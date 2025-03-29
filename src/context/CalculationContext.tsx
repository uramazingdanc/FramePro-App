
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
          // Sum column moments from current story and all stories above for this column
          let cumulativeColumnMoment = 0;
          
          // Calculate the cumulative column moment for this joint (sum all column moments from upper stories)
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Current story's column moment
              cumulativeColumnMoment += storyColumnMoment[spanIndex];
            } else if (upperStoryIndex < storyIndex && spanIndex < columnMoment[upperStoryIndex].length) {
              // Add column moments from all stories above
              cumulativeColumnMoment += columnMoment[upperStoryIndex][spanIndex];
            }
          }
          
          // For the first span, girder moment = sum of column moments
          // This follows the formula: (-ColumnMoment) + GirderMoment = 0
          // So: GirderMoment = ColumnMoment
          girderMomentValue = cumulativeColumnMoment;
        } else {
          // For interior columns (2nd span onwards)
          // Sum column moments for this joint from all stories
          let cumulativeColumnMoment = 0;
          
          // Calculate the cumulative column moment for this joint
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Current story's column moment
              cumulativeColumnMoment += storyColumnMoment[spanIndex];
            } else if (upperStoryIndex < storyIndex && spanIndex < columnMoment[upperStoryIndex].length) {
              // Add column moments from all stories above
              cumulativeColumnMoment += columnMoment[upperStoryIndex][spanIndex];
            }
          }
          
          // For interior joints, apply the joint equilibrium formula:
          // (-CumulativeColumnMoment) + PreviousGirderMoment + CurrentGirderMoment = 0
          // So: CurrentGirderMoment = CumulativeColumnMoment - PreviousGirderMoment
          girderMomentValue = cumulativeColumnMoment - storyGirderMoment[spanIndex - 1];
          
          // Ensure the value is positive for visualization purposes
          girderMomentValue = Math.abs(girderMomentValue);
        }
        
        storyGirderMoment.push(girderMomentValue);
        
        // Step 4: Calculate girder shear from girder moments
        const spanLength = spanMeasurements[storyIndex][spanIndex];
        
        // Get left and right girder moments for shear calculation
        const leftMoment = girderMomentValue;
        let rightMoment = 0;
        
        // If there's a next column, calculate the right girder moment
        if (spanIndex < spansPerStory[storyIndex] - 1) {
          // Calculate the cumulative column moment for the next joint
          let nextCumulativeColumnMoment = 0;
          
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Add current story's column moment for the next column
              nextCumulativeColumnMoment += storyColumnMoment[spanIndex + 1];
            } else if (upperStoryIndex < storyIndex && (spanIndex + 1) < columnMoment[upperStoryIndex].length) {
              // Add column moments from all stories above for the next column
              nextCumulativeColumnMoment += columnMoment[upperStoryIndex][spanIndex + 1];
            }
          }
          
          // Calculate the next girder moment using the same equilibrium formula
          // nextGirderMoment = nextCumulativeColumnMoment - currentGirderMoment
          rightMoment = Math.abs(nextCumulativeColumnMoment - girderMomentValue);
          
          // If this is the last span calculation, we'll use this for the right moment
        } else {
          // For the last span, calculate the right-side moment using the last column
          let lastColumnMoment = 0;
          
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Add current story's column moment for the last column
              lastColumnMoment += storyColumnMoment[spansPerStory[storyIndex]];
            } else if (upperStoryIndex < storyIndex && spansPerStory[storyIndex] < columnMoment[upperStoryIndex].length) {
              // Add column moments from all stories above for the last column
              lastColumnMoment += columnMoment[upperStoryIndex][spansPerStory[storyIndex]];
            }
          }
          
          rightMoment = lastColumnMoment;
        }
        
        // Calculate girder shear as (leftMoment + rightMoment) / span length
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
