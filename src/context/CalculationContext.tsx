
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
        const columnMomentValue = columnShearForce * storyHeights[storyIndex] * 0.5;
        storyColumnMoment.push(columnMomentValue);
      }
      
      // Step 3: Calculate girder moments based on joint equilibrium
      for (let spanIndex = 0; spanIndex < spansPerStory[storyIndex]; spanIndex++) {
        // For each span, calculate the girder moment using joint equilibrium
        // Sum of moments at joint = 0
        
        // Left column moment
        const leftColumnMoment = storyColumnMoment[spanIndex];
        
        // Right column moment
        const rightColumnMoment = storyColumnMoment[spanIndex + 1];
        
        // For simplicity, we'll use a simplified approach for girder moment calculation
        // In a real implementation, this would consider the full joint equilibrium
        
        // For the first span at each story
        if (spanIndex === 0) {
          // The girder moment is equal to the column moment at the left end
          storyGirderMoment.push(leftColumnMoment);
        } 
        // For middle spans
        else if (spanIndex < spansPerStory[storyIndex] - 1) {
          // For middle spans, we account for moments from both sides
          const previousGirderMoment = storyGirderMoment[spanIndex - 1];
          const girderMomentValue = (leftColumnMoment + rightColumnMoment - previousGirderMoment) / 2;
          storyGirderMoment.push(girderMomentValue);
        }
        // For the last span
        else {
          // The girder moment equals the right column moment
          storyGirderMoment.push(rightColumnMoment);
        }
        
        // Step 4: Calculate girder shear from girder moments
        const spanLength = spanMeasurements[storyIndex][spanIndex];
        
        // Girder shear = Sum of girder moments / span length
        const leftMoment = storyGirderMoment[spanIndex];
        const rightMoment = spanIndex === spansPerStory[storyIndex] - 1 
                            ? leftMoment  // For the last span, use the same moment
                            : storyGirderMoment[spanIndex + 1];
        
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
