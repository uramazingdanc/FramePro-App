
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CalculationResults {
  columnShear: number[][];
  columnMoment: number[][];
  girderShear: number[][];
  girderMoment: number[][];
}

interface StructureData {
  numStories: number;
  storyHeights: number[];
  spansPerStory: number[];
  spanMeasurements: number[][];
}

interface VisualizationProps {
  structureData: StructureData;
  results: CalculationResults;
}

const StructureVisualization: React.FC<VisualizationProps> = ({ structureData, results }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate total structure dimensions
  const totalHeight = structureData.storyHeights.reduce((sum, height) => sum + height, 0);
  const maxSpans = Math.max(...structureData.spansPerStory);
  const totalWidthPerStory = structureData.spanMeasurements.map(spans => 
    spans.reduce((sum, span) => sum + span, 0)
  );
  const maxWidth = Math.max(...totalWidthPerStory);
  
  // Drawing scale factor
  const scale = 40; // pixels per meter
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with padding
    const padding = 100;
    canvas.width = maxWidth * scale + padding * 2;
    canvas.height = totalHeight * scale + padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set line styles
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Draw structure frame
    drawStructure(ctx, padding);
    
    // Draw force and moment labels
    drawLabels(ctx, padding);
    
  }, [structureData, results]);
  
  const drawStructure = (ctx: CanvasRenderingContext2D, padding: number) => {
    let currentY = padding;
    
    // Draw stories from top to bottom
    for (let storyIndex = 0; storyIndex < structureData.numStories; storyIndex++) {
      const storyHeight = structureData.storyHeights[storyIndex] * scale;
      const numSpans = structureData.spansPerStory[storyIndex];
      const spans = structureData.spanMeasurements[storyIndex];
      
      // Center the structure horizontally
      const totalWidth = spans.reduce((sum, span) => sum + span, 0) * scale;
      const startX = (ctx.canvas.width - totalWidth) / 2;
      
      // Draw horizontal beam at the top of the story
      ctx.beginPath();
      ctx.moveTo(startX, currentY);
      ctx.lineTo(startX + totalWidth, currentY);
      ctx.stroke();
      
      // Draw columns and label them
      let columnX = startX;
      for (let spanIndex = 0; spanIndex <= numSpans; spanIndex++) {
        // Draw column
        ctx.beginPath();
        ctx.moveTo(columnX, currentY);
        ctx.lineTo(columnX, currentY + storyHeight);
        ctx.stroke();
        
        // Draw column label (C1, C2, etc.)
        const columnLabel = `C${spanIndex + 1}`;
        ctx.fillStyle = '#333';
        ctx.fillText(columnLabel, columnX, currentY - 10);
        
        // Move to next column position
        if (spanIndex < numSpans) {
          columnX += spans[spanIndex] * scale;
        }
      }
      
      // Draw span labels
      columnX = startX;
      for (let spanIndex = 0; spanIndex < numSpans; spanIndex++) {
        const spanWidth = spans[spanIndex] * scale;
        const spanLabel = `S${spanIndex + 1} (${spans[spanIndex]}m)`;
        ctx.fillStyle = '#666';
        ctx.fillText(spanLabel, columnX + spanWidth / 2, currentY - 30);
        columnX += spanWidth;
      }
      
      // Draw story label
      ctx.fillStyle = '#222';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Story ${structureData.numStories - storyIndex}`, startX - 80, currentY + storyHeight / 2);
      ctx.font = '14px Arial';
      
      // Move to the next story
      currentY += storyHeight;
    }
    
    // Draw horizontal beam at the bottom (ground level)
    const bottomBeamX = (ctx.canvas.width - maxWidth * scale) / 2;
    ctx.beginPath();
    ctx.moveTo(bottomBeamX, currentY);
    ctx.lineTo(bottomBeamX + maxWidth * scale, currentY);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.lineWidth = 3;
    
    // Draw ground symbols
    const groundSymbolSpacing = 15;
    const groundY = currentY + 10;
    ctx.beginPath();
    for (let x = bottomBeamX - 20; x <= bottomBeamX + maxWidth * scale + 20; x += groundSymbolSpacing) {
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 10, groundY + 10);
    }
    ctx.stroke();
  };
  
  const drawLabels = (ctx: CanvasRenderingContext2D, padding: number) => {
    let currentY = padding;
    
    // Draw force and moment labels for each story
    for (let storyIndex = 0; storyIndex < structureData.numStories; storyIndex++) {
      const storyHeight = structureData.storyHeights[storyIndex] * scale;
      const numSpans = structureData.spansPerStory[storyIndex];
      const spans = structureData.spanMeasurements[storyIndex];
      
      // Center the structure horizontally
      const totalWidth = spans.reduce((sum, span) => sum + span, 0) * scale;
      const startX = (ctx.canvas.width - totalWidth) / 2;
      
      // Draw column forces and moments
      let columnX = startX;
      for (let columnIndex = 0; columnIndex <= numSpans; columnIndex++) {
        // Only draw if we have data for this story and column
        if (results.columnShear[storyIndex] && results.columnShear[storyIndex][columnIndex] !== undefined) {
          // Column shear
          const shear = results.columnShear[storyIndex][columnIndex].toFixed(1);
          ctx.fillStyle = '#0076FF';
          ctx.fillText(`CS: ${shear} kN`, columnX, currentY + storyHeight / 3);
          
          // Column moment
          const moment = results.columnMoment[storyIndex][columnIndex].toFixed(1);
          ctx.fillStyle = '#FF3B30';
          ctx.fillText(`CM: ${moment} kN·m`, columnX, currentY + storyHeight / 3 + 20);
        }
        
        // Move to next column position
        if (columnIndex < numSpans) {
          columnX += spans[columnIndex] * scale;
        }
      }
      
      // Draw girder forces and moments
      columnX = startX;
      for (let spanIndex = 0; spanIndex < numSpans; spanIndex++) {
        const spanWidth = spans[spanIndex] * scale;
        const spanMidX = columnX + spanWidth / 2;
        
        // Only draw if we have data for this story and span
        if (results.girderShear[storyIndex] && results.girderShear[storyIndex][spanIndex] !== undefined) {
          // Girder shear
          const shear = results.girderShear[storyIndex][spanIndex].toFixed(1);
          ctx.fillStyle = '#34C759';
          ctx.fillText(`GS: ${shear} kN`, spanMidX, currentY + 20);
          
          // Girder moment
          const moment = results.girderMoment[storyIndex][spanIndex].toFixed(1);
          ctx.fillStyle = '#FF9500';
          ctx.fillText(`GM: ${moment} kN·m`, spanMidX, currentY + 40);
        }
        
        columnX += spanWidth;
      }
      
      // Move to the next story
      currentY += storyHeight;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-x-auto glassmorphism rounded-xl p-4 md:p-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-framepro-text">Structure Visualization</h2>
        <p className="text-framepro-darkgray mt-1">Portal Method Analysis Results</p>
      </div>
      
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-sm p-4 overflow-auto max-w-full">
          <canvas 
            ref={canvasRef} 
            className="mx-auto" 
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#0076FF] mr-2"></div>
          <span>CS: Column Shear (kN)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#FF3B30] mr-2"></div>
          <span>CM: Column Moment (kN·m)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#34C759] mr-2"></div>
          <span>GS: Girder Shear (kN)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#FF9500] mr-2"></div>
          <span>GM: Girder Moment (kN·m)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StructureVisualization;
