
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
  lateralLoads: [10, 10],
  spanMeasurements: [[4, 4], [4, 4]],
};

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export const CalculationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [structureData, setStructureData] = useState<StructureData | null>(null);
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  
  // Helper function to round to 2 decimal places
  const roundToTwoDecimal = (num: number): number => {
    return Math.round(num * 100) / 100;
  };
  
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
        storyColumnShear.push(roundToTwoDecimal(columnShearForce));
        
        // Step 2: Calculate column moment (M_col = V × h/2)
        // Using the explicit formula with half the height as requested
        const columnMomentValue = columnShearForce * (storyHeights[storyIndex] * 0.5);
        storyColumnMoment.push(roundToTwoDecimal(columnMomentValue));
      }
      
      // Step 3: Calculate girder moments based on joint equilibrium
      for (let spanIndex = 0; spanIndex < spansPerStory[storyIndex]; spanIndex++) {
        let girderMomentValue = 0;
        
        // For first span (left-most span)
        if (spanIndex === 0) {
          // Sum of column moments at this joint from the current story and all stories above
          let totalColumnMoment = 0;
          
          // Current story's column moment
          totalColumnMoment += storyColumnMoment[spanIndex];
          
          // Add column moments from stories above for this column
          for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
            if (columnMoment[upperStoryIndex] && spanIndex < columnMoment[upperStoryIndex].length) {
              totalColumnMoment += columnMoment[upperStoryIndex][spanIndex];
            }
          }
          
          girderMomentValue = totalColumnMoment;
        } else {
          // For subsequent spans (span 2 onwards)
          // Sum of column moments at this joint
          let totalColumnMoment = 0;
          
          // Current story's column moment
          totalColumnMoment += storyColumnMoment[spanIndex];
          
          // Add column moments from stories above for this column
          for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
            if (columnMoment[upperStoryIndex] && spanIndex < columnMoment[upperStoryIndex].length) {
              totalColumnMoment += columnMoment[upperStoryIndex][spanIndex];
            }
          }
          
          // Subtract the previous span's girder moment
          girderMomentValue = totalColumnMoment - storyGirderMoment[spanIndex - 1];
          
          // Ensure the value is positive for visualization purposes
          girderMomentValue = Math.abs(girderMomentValue);
        }
        
        storyGirderMoment.push(roundToTwoDecimal(girderMomentValue));
        
        // Step 4: Calculate girder shear from girder moments
        const spanLength = spanMeasurements[storyIndex][spanIndex];
        
        // For girder shear calculation, we need the left and right girder moments
        const leftMoment = girderMomentValue;
        let rightMoment = 0;
        
        // If this is not the last span, calculate the right moment for shear calculation
        if (spanIndex < spansPerStory[storyIndex] - 1) {
          // For the next joint, do the same process to get the moment
          let nextTotalColumnMoment = 0;
          
          // Current story's next column moment
          nextTotalColumnMoment += storyColumnMoment[spanIndex + 1];
          
          // Add column moments from stories above for the next column
          for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
            if (columnMoment[upperStoryIndex] && (spanIndex + 1) < columnMoment[upperStoryIndex].length) {
              nextTotalColumnMoment += columnMoment[upperStoryIndex][spanIndex + 1];
            }
          }
          
          // Calculate the right moment
          rightMoment = Math.abs(nextTotalColumnMoment - leftMoment);
        } else {
          // For the last span, the right moment is the column moment of the last column
          let lastColumnMoment = 0;
          
          // Add the current story's last column moment
          lastColumnMoment += storyColumnMoment[numColumns - 1];
          
          // Add column moments from stories above for the last column
          for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
            if (columnMoment[upperStoryIndex] && (numColumns - 1) < columnMoment[upperStoryIndex].length) {
              lastColumnMoment += columnMoment[upperStoryIndex][numColumns - 1];
            }
          }
          
          rightMoment = lastColumnMoment;
        }
        
        // Calculate girder shear as (leftMoment + rightMoment) / span length
        const girderShearValue = (leftMoment + rightMoment) / spanLength;
        storyGirderShear.push(roundToTwoDecimal(girderShearValue));
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
