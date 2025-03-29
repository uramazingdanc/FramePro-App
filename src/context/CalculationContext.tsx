
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
      for (let spanIndex = 0; spanIndex < spansPerStory[storyIndex]; spanIndex++) {
        let girderMomentValue = 0;
        
        // For each span, get the girder moment based on the correct joint equilibrium
        if (spanIndex === 0) {
          // For the first span of any story:
          // The girder moment is equal to the sum of column moments at this joint
          // from the current story and all stories above
          let totalColumnMoment = 0;
          
          // Add column moments from current story and all stories above
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Current story's column moment for this column
              totalColumnMoment += storyColumnMoment[spanIndex];
            } else if (columnMoment[upperStoryIndex] && spanIndex < columnMoment[upperStoryIndex].length) {
              // Add column moments from stories above for this column
              totalColumnMoment += columnMoment[upperStoryIndex][spanIndex];
            }
          }
          
          girderMomentValue = totalColumnMoment;
        } else {
          // For subsequent spans (span 2 onwards):
          // Get the column moment at the left side of this span
          let totalColumnMoment = 0;
          
          // Sum column moments from current story and all stories above for this column
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Current story's column moment for this column
              totalColumnMoment += storyColumnMoment[spanIndex];
            } else if (columnMoment[upperStoryIndex] && spanIndex < columnMoment[upperStoryIndex].length) {
              // Add column moments from stories above for this column
              totalColumnMoment += columnMoment[upperStoryIndex][spanIndex];
            }
          }
          
          // The girder moment for this span is the total column moment minus the previous span's girder moment
          girderMomentValue = totalColumnMoment - storyGirderMoment[spanIndex - 1];
          
          // Ensure the value is positive for visualization purposes
          girderMomentValue = Math.abs(girderMomentValue);
        }
        
        storyGirderMoment.push(girderMomentValue);
        
        // Step 4: Calculate girder shear from girder moments
        const spanLength = spanMeasurements[storyIndex][spanIndex];
        
        // For girder shear calculation, we need the left and right girder moments
        let leftMoment = girderMomentValue;
        let rightMoment = 0;
        
        // If this is not the last span, calculate the right moment for shear calculation
        if (spanIndex < spansPerStory[storyIndex] - 1) {
          // Calculate the total column moment for the next joint
          let nextTotalColumnMoment = 0;
          
          // Sum column moments for the next column from current story and all stories above
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Current story's column moment for the next column
              nextTotalColumnMoment += storyColumnMoment[spanIndex + 1];
            } else if (columnMoment[upperStoryIndex] && (spanIndex + 1) < columnMoment[upperStoryIndex].length) {
              // Add column moments from stories above for the next column
              nextTotalColumnMoment += columnMoment[upperStoryIndex][spanIndex + 1];
            }
          }
          
          // The right moment is the next total column moment minus the current girder moment
          rightMoment = Math.abs(nextTotalColumnMoment - girderMomentValue);
        } else {
          // For the last span, the right moment is the column moment of the last column
          let lastColumnMoment = 0;
          
          // Sum column moments for the last column from current story and all stories above
          for (let upperStoryIndex = 0; upperStoryIndex <= storyIndex; upperStoryIndex++) {
            if (upperStoryIndex === storyIndex) {
              // Current story's column moment for the last column
              lastColumnMoment += storyColumnMoment[numColumns - 1];
            } else if (columnMoment[upperStoryIndex] && (numColumns - 1) < columnMoment[upperStoryIndex].length) {
              // Add column moments from stories above for the last column
              lastColumnMoment += columnMoment[upperStoryIndex][numColumns - 1];
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
