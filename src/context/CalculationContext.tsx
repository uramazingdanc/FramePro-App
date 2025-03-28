
import React, { createContext, useContext, useState } from 'react';

interface StructureData {
  numStories: number;
  storyHeights: number[];
  structureType: 'REGULAR' | 'IRREGULAR';
  spansPerStory: number[];
  spanMeasurements: number[][];
  lateralLoads: number[];
}

interface CalculationResults {
  columnShear: number[][];
  columnMoment: number[][];
  girderShear: number[][];
  girderMoment: number[][];
}

interface CalculationContextType {
  structureData: StructureData | null;
  calculationResults: CalculationResults | null;
  setStructureData: (data: StructureData) => void;
  calculateResults: (data: StructureData) => void;
  hasCalculated: boolean;
}

const defaultStructureData: StructureData = {
  numStories: 2,
  storyHeights: [3, 3],
  structureType: 'REGULAR',
  spansPerStory: [2, 2],
  spanMeasurements: [[4, 4], [4, 4]],
  lateralLoads: [10, 10],
};

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export const CalculationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [structureData, setStructureData] = useState<StructureData | null>(null);
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  
  const calculateResults = (data: StructureData) => {
    const { numStories, storyHeights, spansPerStory, spanMeasurements, lateralLoads } = data;
    
    // Initialize result arrays
    const columnShear: number[][] = [];
    const columnMoment: number[][] = [];
    const girderShear: number[][] = [];
    const girderMoment: number[][] = [];
    
    // Calculate results for each story from top to bottom
    for (let storyIndex = 0; storyIndex < numStories; storyIndex++) {
      const storyColumnShear: number[] = [];
      const storyColumnMoment: number[] = [];
      const storyGirderShear: number[] = [];
      const storyGirderMoment: number[] = [];
      
      // Step 1: Calculate column shear forces
      const numColumns = spansPerStory[storyIndex] + 1;
      
      // Calculate cumulative lateral load from top to current story
      const cumulativeLoad = lateralLoads.slice(0, storyIndex + 1).reduce((sum, load) => sum + load, 0);
      
      // Count effective columns (interior columns count double)
      const effectiveColumns = numColumns + (numColumns - 2); // Add an extra count for each interior column
      
      // Calculate base shear for exterior columns
      const exteriorColumnShear = cumulativeLoad / effectiveColumns;
      
      // Calculate column shear forces
      for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
        // Exterior columns (first and last) have shear = V
        // Interior columns have shear = 2V
        const isExterior = columnIndex === 0 || columnIndex === numColumns - 1;
        const columnShearForce = isExterior ? exteriorColumnShear : exteriorColumnShear * 2;
        storyColumnShear.push(columnShearForce);
        
        // Step 2: Calculate column moment (M_col = V × h/2)
        // Using the explicit formula with half the height as requested
        const columnMomentValue = columnShearForce * (storyHeights[storyIndex] * 0.5);
        storyColumnMoment.push(columnMomentValue);
      }
      
      // Step 3: Calculate girder moments based on joint equilibrium
      // For each span, calculate the girder moment using joint equilibrium: ∑M = 0
      for (let spanIndex = 0; spanIndex < spansPerStory[storyIndex]; spanIndex++) {
        let girderMomentValue = 0;
        
        // For the first joint (leftmost)
        if (spanIndex === 0) {
          // The sum of moments at the joint must be zero
          // At the left end, only the column moment and the girder moment are present
          // Following the convention: negative for counterclockwise (column moment) and positive for clockwise (girder moment)
          // -Column Moment + Girder Moment = 0
          // Therefore, Girder Moment = Column Moment
          girderMomentValue = storyColumnMoment[spanIndex];
        } 
        // For all other joints 
        else {
          // At internal joints, we have:
          // - The column moment (negative/counterclockwise) at this joint
          // - The previous span's girder moment (positive/clockwise)
          // - The current span's girder moment (to be calculated, positive/clockwise)
          
          // Applying ∑M = 0 at the joint:
          // -Column Moment + Previous Girder Moment + Current Girder Moment = 0
          // Current Girder Moment = Column Moment - Previous Girder Moment
          
          girderMomentValue = storyColumnMoment[spanIndex] - storyGirderMoment[spanIndex - 1];
          
          // Handle case where calculated moment would be negative (sign reversal shouldn't happen in this method)
          girderMomentValue = Math.abs(girderMomentValue);
        }
        
        storyGirderMoment.push(girderMomentValue);
        
        // Step 4: Calculate girder shear from girder moments
        const spanLength = spanMeasurements[storyIndex][spanIndex];
        
        // Girder shear = Sum of girder moments / span length
        // For first and last spans, shear is derived from one end moment
        // For middle spans, we use both end moments
        let leftMoment = girderMomentValue;
        let rightMoment = 0;
        
        if (spanIndex < spansPerStory[storyIndex] - 1) {
          // If not the last span, calculate the right moment
          // The right moment would be the same as the left moment of the next span
          // For consistency, we'll calculate this based on our equilibrium equation:
          // -Column Moment(next) + Current Girder Moment(right) + Next Girder Moment(left) = 0
          // Current Girder Moment(right) = Column Moment(next) - Next Girder Moment(left)
          
          // But since we haven't calculated the next girder moment yet,
          // and we want the right moment of current span to be consistent,
          // we'll use the same value as the left moment
          rightMoment = leftMoment;
        } else {
          // For the last span, the right moment is equal to the column moment at the right
          rightMoment = storyColumnMoment[spanIndex + 1];
        }
        
        const girderShearValue = (leftMoment + rightMoment) / spanLength;
        storyGirderShear.push(girderShearValue);
      }
      
      // Store results for this story
      columnShear.push(storyColumnShear);
      columnMoment.push(storyColumnMoment);
      girderShear.push(storyGirderShear);
      girderMoment.push(storyGirderMoment);
    }
    
    // Set calculation results
    setCalculationResults({
      columnShear,
      columnMoment,
      girderShear,
      girderMoment,
    });
    
    setStructureData(data);
    setHasCalculated(true);
  };
  
  return (
    <CalculationContext.Provider
      value={{
        structureData,
        calculationResults,
        setStructureData,
        calculateResults,
        hasCalculated,
      }}
    >
      {children}
    </CalculationContext.Provider>
  );
};

export const useCalculation = () => {
  const context = useContext(CalculationContext);
  if (context === undefined) {
    throw new Error('useCalculation must be used within a CalculationProvider');
  }
  return context;
};
