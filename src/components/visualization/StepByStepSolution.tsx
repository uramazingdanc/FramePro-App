
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
                Girder moments are calculated using joint equilibrium: ∑M = 0
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
                        const leftColumnMoment = results.columnMoment[storyIndex][spanIndex];
                        const rightColumnMoment = results.columnMoment[storyIndex][spanIndex + 1];
                        
                        return (
                          <div key={`span-moment-${storyIndex}-${spanIndex}`} className="bg-white p-2 rounded-md shadow-sm">
                            <p className="text-sm font-medium">Span {spanIndex + 1} ({spanLength} m):</p>
                            <p className="mb-2">
                              <span className="text-sm bg-framepro-green/10 p-1 rounded">
                                ∑M = 0
                              </span>
                            </p>
                            {spanIndex === 0 ? (
                              <p>
                                At left joint: (-{leftColumnMoment.toFixed(2)} kN·m) + M<sub>girder</sub> = 0<br/>
                                M<sub>girder</sub> = {leftColumnMoment.toFixed(2)} kN·m
                              </p>
                            ) : spanIndex === spans - 1 ? (
                              <p>
                                At right joint: (-{rightColumnMoment.toFixed(2)} kN·m) + M<sub>girder</sub> = 0<br/>
                                M<sub>girder</sub> = {rightColumnMoment.toFixed(2)} kN·m
                              </p>
                            ) : (
                              <p>
                                At middle joint:<br/>
                                (-{leftColumnMoment.toFixed(2)} kN·m) + (-{rightColumnMoment.toFixed(2)} kN·m) + {
                                  results.girderMoment[storyIndex][spanIndex-1].toFixed(2)
                                } kN·m + M<sub>girder</sub> = 0<br/>
                                M<sub>girder</sub> = {leftColumnMoment.toFixed(2)} kN·m + {rightColumnMoment.toFixed(2)} kN·m - {
                                  results.girderMoment[storyIndex][spanIndex-1].toFixed(2)
                                } kN·m = {moment.toFixed(2)} kN·m
                              </p>
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
                Girder shears are calculated using the formula: V<sub>girder</sub> = ∑M<sub>girder</sub> / L<sub>span</sub>
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
                        const leftMoment = results.girderMoment[storyIndex][spanIndex];
                        const rightMoment = spanIndex === spans - 1 
                                         ? leftMoment 
                                         : results.girderMoment[storyIndex][spanIndex + 1];
                        
                        return (
                          <div key={`span-shear-${storyIndex}-${spanIndex}`} className="bg-white p-2 rounded-md shadow-sm">
                            <p className="text-sm font-medium">Span {spanIndex + 1} ({spanLength} m):</p>
                            <p className="mb-1">
                              <span className="text-sm bg-framepro-green/10 p-1 rounded">
                                V<sub>girder</sub> = ∑M<sub>girder</sub> / L<sub>span</sub>
                              </span>
                            </p>
                            <p>
                              V<sub>girder</sub> = ({leftMoment.toFixed(2)} kN·m + {rightMoment.toFixed(2)} kN·m) / {spanLength} m = {shear.toFixed(2)} kN
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
                  <li>Column moments are negative if counterclockwise</li>
                  <li>Girder moments are positive if clockwise</li>
                  <li>In the visualization, we use absolute values for clarity</li>
                </ul>
              </div>
              
              <div className="bg-framepro-lightgray p-3 rounded-md">
                <h4 className="font-medium mb-2">Variable Spans</h4>
                <p>
                  If the number of spans changes between floors (e.g., first floor has 3 spans, second floor has 2 spans), 
                  the values and frame configuration will adjust accordingly in the calculations.
                </p>
                <p className="mt-2">
                  The column positions remain consistent through all floors. For floors with fewer spans, 
                  the columns maintain alignment with the corresponding columns from other floors.
                </p>
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
