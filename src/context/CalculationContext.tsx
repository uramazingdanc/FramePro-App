
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
          // REVISED CALCULATION:
          // For the first span, we need to consider all column moments above this joint
          // If we're at the top floor, there's only the current column moment
          // If we're at a lower floor, we add the column moments from floors above
          let cumulativeColumnMoment = storyColumnMoment[spanIndex];
          
          // If not at the top floor, add column moments from floors above
          if (storyIndex > 0) {
            for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
              // Check if the column exists in the upper story (may have different number of spans)
              if (spanIndex < columnMoment[upperStoryIndex].length) {
                cumulativeColumnMoment += columnMoment[upperStoryIndex][spanIndex];
              }
            }
          }
          
          // The girder moment must balance the cumulative column moment
          // -Column Moment + Girder Moment = 0
          girderMomentValue = cumulativeColumnMoment;
        } 
        // For all other joints 
        else {
          // REVISED CALCULATION:
          // At internal joints, we need to consider:
          // 1. The cumulative column moment at this joint (from all floors above)
          // 2. The previous span's girder moment
          
          // Calculate cumulative column moment at this joint
          let cumulativeColumnMoment = storyColumnMoment[spanIndex];
          
          // If not at the top floor, add column moments from floors above
          if (storyIndex > 0) {
            for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
              // Check if the column exists in the upper story
              if (spanIndex < columnMoment[upperStoryIndex].length) {
                cumulativeColumnMoment += columnMoment[upperStoryIndex][spanIndex];
              }
            }
          }
          
          // Applying the revised equation: -CumulativeColumnMoment + PreviousGirderMoment + CurrentGirderMoment = 0
          // CurrentGirderMoment = CumulativeColumnMoment - PreviousGirderMoment
          girderMomentValue = cumulativeColumnMoment - storyGirderMoment[spanIndex - 1];
          
          // Handle case where calculated moment would be negative
          girderMomentValue = Math.abs(girderMomentValue);
        }
        
        storyGirderMoment.push(girderMomentValue);
        
        // Step 4: Calculate girder shear from girder moments
        const spanLength = spanMeasurements[storyIndex][spanIndex];
        
        // Girder shear calculation
        let leftMoment = girderMomentValue;
        let rightMoment = 0;
        
        if (spanIndex < spansPerStory[storyIndex] - 1) {
          // If not the last span, the right moment will be calculated in the next span
          // For consistency, we use the same value
          rightMoment = leftMoment;
        } else {
          // For the last span, calculate the cumulative column moment at the rightmost joint
          let rightColumnIndex = spanIndex + 1;
          let cumulativeRightColumnMoment = storyColumnMoment[rightColumnIndex];
          
          // If not at the top floor, add column moments from floors above
          if (storyIndex > 0) {
            for (let upperStoryIndex = 0; upperStoryIndex < storyIndex; upperStoryIndex++) {
              // Check if the column exists in the upper story
              if (rightColumnIndex < columnMoment[upperStoryIndex].length) {
                cumulativeRightColumnMoment += columnMoment[upperStoryIndex][rightColumnIndex];
              }
            }
          }
          
          rightMoment = cumulativeRightColumnMoment;
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
