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
  
  // Create floor labels
  const floorLabels = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
  
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
                The column shear forces are calculated based on the lateral loads and the number of columns at each story.
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                const floorNumber = floorLabels[numStories - storyIndex - 1];
                const cumulativeLoad = lateralLoads.slice(0, storyIndex + 1).reduce((sum, load) => sum + load, 0);
                const totalColumns = columnsPerStory[storyIndex];
                const baseShear = cumulativeLoad / totalColumns;
                
                return (
                  <div key={`shear-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">{floorNumber} Column Shear:</h4>
                    <p className="mb-2">
                      <span className="text-sm bg-framepro-green/10 p-1 rounded">
                        V = (Sum of lateral loads) / (total number of columns)
                      </span>
                    </p>
                    <p className="mb-2">
                      V = {cumulativeLoad.toFixed(1)} kN / {totalColumns} columns = {baseShear.toFixed(2)} kN
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
                Column moments are calculated based on the column shear force and the story height.
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                const floorNumber = floorLabels[numStories - storyIndex - 1];
                const storyHeight = storyHeights[storyIndex];
                const cumulativeLoad = lateralLoads.slice(0, storyIndex + 1).reduce((sum, load) => sum + load, 0);
                const totalColumns = columnsPerStory[storyIndex];
                const baseShear = cumulativeLoad / totalColumns;
                const exteriorMoment = baseShear * storyHeight * 0.5;
                const interiorMoment = exteriorMoment * 2;
                
                return (
                  <div key={`moment-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">{floorNumber} Column Moment:</h4>
                    <p className="mb-2">
                      <span className="text-sm bg-framepro-green/10 p-1 rounded">
                        Column Moment = Column Shear × ½ × (story height)
                      </span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-sm font-medium">Exterior Columns:</p>
                        <p className="mb-1">M = V × ½ × h</p>
                        <p>M = {baseShear.toFixed(2)} kN × 0.5 × {storyHeight} m = {exteriorMoment.toFixed(2)} kN·m</p>
                      </div>
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-sm font-medium">Interior Columns:</p>
                        <p className="mb-1">M = 2V × ½ × h</p>
                        <p>M = {(baseShear * 2).toFixed(2)} kN × 0.5 × {storyHeight} m = {interiorMoment.toFixed(2)} kN·m</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">3. Girder Moment Calculation</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <p className="text-framepro-darkgray">
                The girder moments are calculated based on the column shears and dimensions.
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                const storyNumber = numStories - storyIndex;
                const spans = spansPerStory[storyIndex];
                
                return (
                  <div key={`girder-moment-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">Story {storyNumber} Girder Moments:</h4>
                    
                    <div className="space-y-3">
                      {Array.from({ length: spans }).map((_, spanIndex) => {
                        const spanLength = spanMeasurements[storyIndex][spanIndex];
                        const moment = results.girderMoment[storyIndex][spanIndex];
                        
                        return (
                          <div key={`span-moment-${storyIndex}-${spanIndex}`} className="bg-white p-2 rounded-md shadow-sm">
                            <p className="text-sm font-medium">Span {spanIndex + 1} ({spanLength} m):</p>
                            <p>Girder Moment = {moment.toFixed(2)} kN·m</p>
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
        
        <AccordionItem value="item-4" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-framepro-lightgray hover:bg-gray-100 transition-colors">
            <span className="text-framepro-text font-medium">4. Girder Shear Calculation</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <motion.div variants={item} className="space-y-4">
              <p className="text-framepro-darkgray">
                The girder shears are calculated based on the girder moments and span lengths.
              </p>
              
              {Array.from({ length: numStories }).map((_, storyIndex) => {
                const storyNumber = numStories - storyIndex;
                const spans = spansPerStory[storyIndex];
                
                return (
                  <div key={`girder-shear-story-${storyIndex}`} className="bg-framepro-lightgray p-3 rounded-md">
                    <h4 className="font-medium mb-2">Story {storyNumber} Girder Shears:</h4>
                    
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
                                Girder Shear = Girder Moment / Span Length
                              </span>
                            </p>
                            <p>Shear = {moment.toFixed(2)} kN·m / {spanLength} m = {shear.toFixed(2)} kN</p>
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
      </Accordion>
    </motion.div>
  );
};

export default StepByStepSolution;
