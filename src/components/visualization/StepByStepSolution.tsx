
import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StepByStepSolutionProps {
  structureData: {
    numStories: number;
    storyHeights: number[];
    spansPerStory: number[];
    spanMeasurements: number[][];
    lateralLoads: number[];
  };
  results: {
    columnShear: number[][];
    columnMoment: number[][];
    girderShear: number[][];
    girderMoment: number[][];
  };
}

const StepByStepSolution: React.FC<StepByStepSolutionProps> = ({ structureData, results }) => {
  const { numStories, storyHeights, spansPerStory, spanMeasurements, lateralLoads } = structureData;
  
  // Calculate number of columns for each story
  const columnsPerStory = spansPerStory.map(spans => spans + 1);
  
  // Create floor labels with correct naming convention
  const floorLabels = ['Ground Floor'];
  for (let i = 2; i <= 4; i++) {
    floorLabels.push(`${i}${getOrdinalSuffix(i)} Floor`);
  }
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper function to get ordinal suffix
  function getOrdinalSuffix(i: number) {
    const j = i % 10,
          k = i % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="w-full glassmorphism rounded-xl p-4 md:p-6 mt-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-framepro-text">Step-by-Step Solution</h2>
        <p className="text-framepro-darkgray mt-1">Portal Method Analysis Breakdown</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {/* Column Shear Calculation */}
        <AccordionItem value="item-1" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">1. Column Shear Force Calculation</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <p className="text-framepro-darkgray">
                Column shear forces are calculated based on the lateral loads and the adjusted number of columns.
                Interior columns carry twice the load of exterior columns.
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                // Calculate the correct floor label
                const floorNumber = storyIndex === numStories - 1 ? floorLabels[0] : floorLabels[numStories - storyIndex - 1];
                const cumulativeLoad = lateralLoads.slice(0, storyIndex + 1).reduce((sum, load) => sum + load, 0);
                const totalColumns = columnsPerStory[storyIndex];
                const effectiveColumns = totalColumns + (totalColumns - 2); // Interior columns count double
                const baseShear = cumulativeLoad / effectiveColumns;
                
                return (
                  <div key={`shear-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">{floorNumber} Column Shear:</h4>
                    <p className="mb-2">
                      <span className="text-sm bg-framepro-green/10 p-1 rounded">
                        V = (Sum of lateral loads) / (Adjusted total columns)
                      </span>
                    </p>
                    <p className="mb-2">
                      Total lateral load = {cumulativeLoad.toFixed(1)} kN
                    </p>
                    <p className="mb-2">
                      Adjusted columns count = {effectiveColumns} (each interior column counts as 2)
                    </p>
                    <p className="mb-2">
                      Base Shear V = {cumulativeLoad.toFixed(1)} kN / {effectiveColumns} = {baseShear.toFixed(2)} kN
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-sm font-medium">Exterior Columns:</p>
                        <p>Shear Force = V = {baseShear.toFixed(2)} kN</p>
                      </div>
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-sm font-medium">Interior Columns:</p>
                        <p>Shear Force = 2V = {(baseShear * 2).toFixed(2)} kN</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Column Moment Calculation */}
        <AccordionItem value="item-2" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">2. Column Moment Calculation</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <p className="text-framepro-darkgray">
                Column moments are calculated using the formula: M<sub>col</sub> = V × (1/2 × h)
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                // Calculate the correct floor label
                const floorNumber = storyIndex === numStories - 1 ? floorLabels[0] : floorLabels[numStories - storyIndex - 1];
                const storyHeight = storyHeights[storyIndex];
                const cumulativeLoad = lateralLoads.slice(0, storyIndex + 1).reduce((sum, load) => sum + load, 0);
                const totalColumns = columnsPerStory[storyIndex];
                const effectiveColumns = totalColumns + (totalColumns - 2); // Interior columns count double
                const baseShear = cumulativeLoad / effectiveColumns;
                const exteriorMoment = baseShear * (storyHeight * 0.5);
                const interiorMoment = exteriorMoment * 2;
                
                return (
                  <div key={`moment-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">{floorNumber} Column Moment:</h4>
                    <p className="mb-2">
                      <span className="text-sm bg-framepro-green/10 p-1 rounded">
                        M<sub>col</sub> = V × (1/2 × h)
                      </span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-sm font-medium">Exterior Columns:</p>
                        <p className="mb-1">M = V × (1/2 × h)</p>
                        <p>M = {baseShear.toFixed(2)} kN × (0.5 × {storyHeight} m) = {exteriorMoment.toFixed(2)} kN·m</p>
                      </div>
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-sm font-medium">Interior Columns:</p>
                        <p className="mb-1">M = 2V × (1/2 × h)</p>
                        <p>M = {(baseShear * 2).toFixed(2)} kN × (0.5 × {storyHeight} m) = {interiorMoment.toFixed(2)} kN·m</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Girder Moment Calculation */}
        <AccordionItem value="item-3" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">3. Girder Moment Calculation</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <p className="text-framepro-darkgray">
                Girder moments are calculated using the principle of joint equilibrium: ∑M = 0 at each joint.
                We use the convention that column moments are counterclockwise (negative) and girder moments are clockwise (positive).
                <strong className="block mt-2">Important: We only include column moments from the current story and the story directly above when calculating girder moments.</strong>
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                // Calculate the correct floor label
                const floorNumber = storyIndex === numStories - 1 ? floorLabels[0] : floorLabels[numStories - storyIndex - 1];
                const spans = spansPerStory[storyIndex];
                
                return (
                  <div key={`girder-moment-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">{floorNumber} Girder Moments:</h4>
                    
                    <div className="space-y-3">
                      {Array.from({ length: spans }).map((_, spanIndex) => {
                        const spanLength = spanMeasurements[storyIndex][spanIndex];
                        const moment = results.girderMoment[storyIndex][spanIndex];
                        const columnMomentAtJoint = results.columnMoment[storyIndex][spanIndex];
                        const previousGirderMoment = spanIndex > 0 ? results.girderMoment[storyIndex][spanIndex - 1] : 0;
                        
                        // Calculate column moment from story directly above (if it exists)
                        let upperFloorColumnMoment = 0;
                        if (storyIndex > 0 && spanIndex < results.columnMoment[storyIndex - 1].length) {
                          upperFloorColumnMoment = results.columnMoment[storyIndex - 1][spanIndex];
                        }
                        
                        return (
                          <div key={`span-moment-${storyIndex}-${spanIndex}`} className="bg-white p-2 rounded-md shadow-sm">
                            <p className="text-sm font-medium">Span {spanIndex + 1} ({spanLength} m):</p>
                            <p className="mb-2">
                              <span className="text-sm bg-framepro-green/10 p-1 rounded">
                                ∑M = 0 at each joint
                              </span>
                            </p>
                            {spanIndex === 0 ? (
                              <div>
                                <p className="mb-1">At leftmost joint (Column 1):</p>
                                <div className="mb-1 space-y-1">
                                  <p>Current floor column moment = {columnMomentAtJoint.toFixed(2)} kN·m</p>
                                  {upperFloorColumnMoment > 0 && (
                                    <p>Column moment from story directly above = {upperFloorColumnMoment.toFixed(2)} kN·m</p>
                                  )}
                                  <p>
                                    (−{columnMomentAtJoint.toFixed(2)} kN·m {upperFloorColumnMoment > 0 ? `− ${upperFloorColumnMoment.toFixed(2)} kN·m` : ''}) + Girder Moment = 0
                                  </p>
                                </div>
                                <p className="mb-1">
                                  Girder Moment = {columnMomentAtJoint.toFixed(2)} kN·m {upperFloorColumnMoment > 0 ? `+ ${upperFloorColumnMoment.toFixed(2)} kN·m` : ''} = {moment.toFixed(2)} kN·m
                                </p>
                                <p className="text-xs text-framepro-darkgray mt-2">
                                  Note: The column moments are counterclockwise (negative), and the girder moment is clockwise (positive).
                                  We only sum column moments from current floor AND the floor directly above (if it exists).
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="mb-1">At joint (Column {spanIndex + 1}):</p>
                                <div className="mb-1 space-y-1">
                                  <p>Current floor column moment = {columnMomentAtJoint.toFixed(2)} kN·m</p>
                                  {upperFloorColumnMoment > 0 && (
                                    <p>Column moment from story directly above = {upperFloorColumnMoment.toFixed(2)} kN·m</p>
                                  )}
                                  <p>Previous span girder moment = {previousGirderMoment.toFixed(2)} kN·m</p>
                                  <p>
                                    (−{columnMomentAtJoint.toFixed(2)} kN·m {upperFloorColumnMoment > 0 ? `− ${upperFloorColumnMoment.toFixed(2)} kN·m` : ''}) + {previousGirderMoment.toFixed(2)} kN·m + Girder Moment = 0
                                  </p>
                                </div>
                                <p className="mb-1">
                                  Girder Moment = {columnMomentAtJoint.toFixed(2)} kN·m {upperFloorColumnMoment > 0 ? `+ ${upperFloorColumnMoment.toFixed(2)} kN·m` : ''} − {previousGirderMoment.toFixed(2)} kN·m = {moment.toFixed(2)} kN·m
                                </p>
                                <p className="text-xs text-framepro-darkgray mt-2">
                                  Note: At internal joints, we consider column moments from the current floor AND the floor directly above (all counterclockwise/negative), 
                                  the previous span's girder moment (clockwise/positive), and the current span's girder moment (clockwise/positive).
                                  We use absolute values in the visualization.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Girder Shear Calculation */}
        <AccordionItem value="item-4" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">4. Girder Shear Calculation</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <p className="text-framepro-darkgray">
                Girder shears are calculated by doubling the girder moment and dividing by the span length.
                This represents equal moments at both ends of the girder.
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                // Calculate the correct floor label
                const floorNumber = storyIndex === numStories - 1 ? floorLabels[0] : floorLabels[numStories - storyIndex - 1];
                const spans = spansPerStory[storyIndex];
                
                return (
                  <div key={`girder-shear-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">{floorNumber} Girder Shears:</h4>
                    
                    <div className="space-y-3">
                      {Array.from({ length: spans }).map((_, spanIndex) => {
                        const spanLength = spanMeasurements[storyIndex][spanIndex];
                        const shear = results.girderShear[storyIndex][spanIndex];
                        const moment = results.girderMoment[storyIndex][spanIndex];
                        
                        return (
                          <div key={`span-shear-${storyIndex}-${spanIndex}`} className="bg-white p-2 rounded-md shadow-sm">
                            <p className="text-sm font-medium">Span {spanIndex + 1} ({spanLength} m):</p>
                            <p className="mb-1">
                              <span className="text-sm bg-framepro-green/10 p-1 rounded">
                                V<sub>girder</sub> = (2 × M<sub>girder</sub>) / L<sub>span</sub>
                              </span>
                            </p>
                            <p>
                              V<sub>girder</sub> = (2 × {moment.toFixed(2)} kN·m) / {spanLength} m = {shear.toFixed(2)} kN
                            </p>
                            <p className="text-xs text-framepro-darkgray mt-2">
                              This calculation represents equal moments on both ends of the girder (M + M = 2M),
                              which is equivalent to doubling the girder moment and then dividing by the span length.
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AccordionContent>
        </AccordionItem>

        {/* Additional Explanation */}
        <AccordionItem value="item-5" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">5. Special Cases & Notes</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <div className="bg-framepro-lightgray p-3 rounded-md">
                <h4 className="font-medium mb-2">Sign Conventions</h4>
                <p className="mb-2">
                  In our calculations, we follow these sign conventions:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Column moments are negative (counterclockwise)</li>
                  <li>Girder moments are positive (clockwise)</li>
                  <li>In the visualization, we use absolute values for clarity</li>
                </ul>
              </div>
              
              <div className="bg-framepro-lightgray p-3 rounded-md">
                <h4 className="font-medium mb-2">Joint Equilibrium Principle</h4>
                <p>
                  At each joint, the sum of all moments must equal zero. This key principle guides our calculation of girder moments.
                </p>
                <p className="mt-2">
                  When applying this principle: (-Column Moment) + Previous Girder Moment + Current Girder Moment = 0
                </p>
                <p className="mt-2">
                  Solving for the Current Girder Moment: Current Girder Moment = Column Moment - Previous Girder Moment
                </p>
                <p className="mt-2 text-sm font-medium">
                  Important: Only column moments from the current floor and the floor directly above are included in the calculations. For example, in a four-story building, the ground floor girder moments only include contributions from the ground floor and 2nd floor column moments.
                </p>
              </div>
              
              <div className="bg-framepro-lightgray p-3 rounded-md">
                <h4 className="font-medium mb-2">Girder Shear Calculation</h4>
                <p>
                  For girder shear, we use the formula: V<sub>girder</sub> = (2 × M<sub>girder</sub>) / L<sub>span</sub>
                </p>
                <p className="mt-2">
                  This represents equal moments on both ends of the girder. The factor of 2 comes from adding the same girder moment twice (M + M = 2M),
                  then dividing by the span length. For example, if the moment is 57.50 kN·m, we calculate (57.50 + 57.50) / span length, which is the same as (2 × 57.50) / span length.
                </p>
              </div>
              
              <div className="bg-framepro-lightgray p-3 rounded-md">
                <h4 className="font-medium mb-2">Irregular Structures</h4>
                <p>
                  For irregular structures, the upper floors align with the left side of the ground floor, maintaining vertical column alignment.
                  This is critical for proper load transmission through the structure.
                </p>
                <p className="mt-2">
                  Despite irregular configurations, the same portal method principles apply:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Exterior columns take half the shear of interior columns</li>
                  <li>Only column moments from the current story and the story directly above are included in calculations</li>
                  <li>Girder moments and shears follow joint equilibrium principles</li>
                </ul>
              </div>
              
              <div className="bg-framepro-lightgray p-3 rounded-md">
                <h4 className="font-medium mb-2">Cumulative Loads</h4>
                <p>
                  For lower floors, the lateral loads from upper floors are included in the calculations.
                  This reflects how forces accumulate through the structure from top to bottom.
                </p>
              </div>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

export default StepByStepSolution;
