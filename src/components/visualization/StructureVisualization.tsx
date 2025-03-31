
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
  structureType: 'REGULAR' | 'IRREGULAR';
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
  
  // For irregular structures, we want equal column spacing regardless of span measurements
  const isIrregular = structureData.structureType === 'IRREGULAR';
  
  // Calculate the maximum number of columns across all stories
  const maxColumns = Math.max(...structureData.spansPerStory.map(spans => spans + 1));
  
  // Drawing scale factor
  const scale = 40; // pixels per meter
  const columnSpacing = isIrregular ? 120 : scale; // Fixed column spacing for irregular structures
  
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
  
  // Create floor labels with correct naming convention
  const createFloorLabel = (storyIndex: number, numStories: number) => {
    if (storyIndex === numStories - 1) return 'Ground Floor';
    const floorNumber = numStories - storyIndex;
    return `${floorNumber}${getOrdinalSuffix(floorNumber)} Floor`;
  };
  
  // Helper function to format numbers to 2 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with padding
    const padding = 100;
    
    // Calculate the maximum width needed for any story
    const totalWidthRegular = Math.max(...structureData.spanMeasurements.map(spans => 
      spans.reduce((sum, span) => sum + span, 0)
    )) * scale;
    
    const totalWidthIrregular = Math.max(...structureData.spansPerStory) * columnSpacing;
    
    const totalWidth = isIrregular ? totalWidthIrregular : totalWidthRegular;
    
    canvas.width = totalWidth + padding * 2;
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
    
    // Draw arrows for forces and moments
    drawArrows(ctx, padding);
    
  }, [structureData, results]);
  
  const drawStructure = (ctx: CanvasRenderingContext2D, padding: number) => {
    let currentY = padding;
    
    // Calculate left alignment position - for irregular structures, all stories should start from same left position
    const fixedStartX = padding;
    
    // Draw stories from top to bottom
    for (let storyIndex = 0; storyIndex < structureData.numStories; storyIndex++) {
      const storyHeight = structureData.storyHeights[storyIndex] * scale;
      const numSpans = structureData.spansPerStory[storyIndex];
      const spans = structureData.spanMeasurements[storyIndex];
      
      // Calculate total width for this story
      const totalWidth = isIrregular 
        ? columnSpacing * numSpans  
        : spans.reduce((sum, span) => sum + span * scale, 0);
      
      // For regular: center the structure horizontally
      // For irregular: align to the left (all stories start from same left position)
      const startX = isIrregular 
        ? fixedStartX 
        : (ctx.canvas.width - totalWidth) / 2;
      
      // Draw horizontal beam at the top of the story
      ctx.beginPath();
      ctx.moveTo(startX, currentY);
      ctx.lineTo(startX + totalWidth, currentY);
      ctx.stroke();
      
      // Draw columns and label them
      for (let spanIndex = 0; spanIndex <= numSpans; spanIndex++) {
        // Calculate column position
        const columnX = startX + (isIrregular 
          ? spanIndex * columnSpacing 
          : spans.slice(0, spanIndex).reduce((sum, span) => sum + span * scale, 0));
        
        // Draw column
        ctx.beginPath();
        ctx.moveTo(columnX, currentY);
        ctx.lineTo(columnX, currentY + storyHeight);
        ctx.stroke();
        
        // Draw column label (C1, C2, etc.)
        const columnLabel = `C${spanIndex + 1}`;
        ctx.fillStyle = '#333';
        ctx.fillText(columnLabel, columnX, currentY - 10);
      }
      
      // Draw span labels
      for (let spanIndex = 0; spanIndex < numSpans; spanIndex++) {
        // Calculate span start and end points
        const spanStartX = startX + (isIrregular 
          ? spanIndex * columnSpacing 
          : spans.slice(0, spanIndex).reduce((sum, span) => sum + span * scale, 0));
        
        const spanEndX = startX + (isIrregular 
          ? (spanIndex + 1) * columnSpacing 
          : spans.slice(0, spanIndex + 1).reduce((sum, span) => sum + span * scale, 0));
        
        const spanMidX = (spanStartX + spanEndX) / 2;
        
        // Draw span label
        const spanLabel = `S${spanIndex + 1} (${spans[spanIndex]}m)`;
        ctx.fillStyle = '#666';
        ctx.fillText(spanLabel, spanMidX, currentY - 30);
      }
      
      // Use correct floor label
      const floorLabel = createFloorLabel(storyIndex, structureData.numStories);
      ctx.fillStyle = '#222';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(floorLabel, startX - 80, currentY + storyHeight / 2);
      ctx.font = '14px Arial';
      
      // Move to the next story
      currentY += storyHeight;
    }
    
    // Draw horizontal beam at the bottom (ground level)
    const bottomStoryIndex = structureData.numStories - 1;
    const totalWidthBottom = isIrregular 
      ? columnSpacing * structureData.spansPerStory[bottomStoryIndex] 
      : structureData.spanMeasurements[bottomStoryIndex].reduce((sum, span) => sum + span * scale, 0);
    
    const bottomBeamX = isIrregular 
      ? fixedStartX 
      : (ctx.canvas.width - totalWidthBottom) / 2;
    
    ctx.beginPath();
    ctx.moveTo(bottomBeamX, currentY);
    ctx.lineTo(bottomBeamX + totalWidthBottom, currentY);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.lineWidth = 3;
    
    // Draw ground symbols
    const groundSymbolSpacing = 15;
    const groundY = currentY + 10;
    ctx.beginPath();
    for (let x = bottomBeamX - 20; x <= bottomBeamX + totalWidthBottom + 20; x += groundSymbolSpacing) {
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 10, groundY + 10);
    }
    ctx.stroke();
  };
  
  const drawLabels = (ctx: CanvasRenderingContext2D, padding: number) => {
    let currentY = padding;
    
    // Fixed left alignment for irregular structures
    const fixedStartX = padding;
    
    // Draw force and moment labels for each story
    for (let storyIndex = 0; storyIndex < structureData.numStories; storyIndex++) {
      const storyHeight = structureData.storyHeights[storyIndex] * scale;
      const numSpans = structureData.spansPerStory[storyIndex];
      const spans = structureData.spanMeasurements[storyIndex];
      
      // Calculate total width for this story
      const totalWidth = isIrregular 
        ? columnSpacing * numSpans 
        : spans.reduce((sum, span) => sum + span * scale, 0);
      
      // For regular: center the structure horizontally
      // For irregular: align to the left (all stories start from same left position)
      const startX = isIrregular 
        ? fixedStartX 
        : (ctx.canvas.width - totalWidth) / 2;
      
      // Draw column forces and moments
      for (let columnIndex = 0; columnIndex <= numSpans; columnIndex++) {
        // Calculate column position
        const columnX = startX + (isIrregular 
          ? columnIndex * columnSpacing 
          : spans.slice(0, columnIndex).reduce((sum, span) => sum + span * scale, 0));
        
        // Only draw if we have data for this story and column
        if (results.columnShear[storyIndex] && results.columnShear[storyIndex][columnIndex] !== undefined) {
          // Column shear
          const shear = formatNumber(results.columnShear[storyIndex][columnIndex]);
          ctx.fillStyle = '#0076FF';
          ctx.fillText(`CS: ${shear} kN`, columnX, currentY + storyHeight / 3);
          
          // Column moment
          const moment = formatNumber(results.columnMoment[storyIndex][columnIndex]);
          ctx.fillStyle = '#FF3B30';
          ctx.fillText(`CM: ${moment} kN·m`, columnX, currentY + storyHeight / 3 + 20);
        }
      }
      
      // Draw girder forces and moments
      for (let spanIndex = 0; spanIndex < numSpans; spanIndex++) {
        // Calculate span start and end points
        const spanStartX = startX + (isIrregular 
          ? spanIndex * columnSpacing 
          : spans.slice(0, spanIndex).reduce((sum, span) => sum + span * scale, 0));
        
        const spanEndX = startX + (isIrregular 
          ? (spanIndex + 1) * columnSpacing 
          : spans.slice(0, spanIndex + 1).reduce((sum, span) => sum + span * scale, 0));
        
        const spanMidX = (spanStartX + spanEndX) / 2;
        
        // Only draw if we have data for this story and span
        if (results.girderShear[storyIndex] && results.girderShear[storyIndex][spanIndex] !== undefined) {
          // Girder shear
          const shear = formatNumber(results.girderShear[storyIndex][spanIndex]);
          ctx.fillStyle = '#34C759';
          ctx.fillText(`GS: ${shear} kN`, spanMidX, currentY + 20);
          
          // Girder moment
          const moment = formatNumber(results.girderMoment[storyIndex][spanIndex]);
          ctx.fillStyle = '#FF9500';
          ctx.fillText(`GM: ${moment} kN·m`, spanMidX, currentY + 40);
          
          // Add visual markers for special points on ground floor
          if (storyIndex === structureData.numStories - 1) {
            if (spanIndex === 0) {
              // Red mark for first span on ground floor
              ctx.fillStyle = '#FF0000';
              ctx.beginPath();
              ctx.arc(spanMidX, currentY + 30, 10, 0, Math.PI * 2);
              ctx.fill();
            } else if (spanIndex === 1) {
              // Blue mark for second span on ground floor
              ctx.fillStyle = '#0000FF';
              ctx.beginPath();
              ctx.arc(spanMidX, currentY + 30, 10, 0, Math.PI * 2);
              ctx.fill();
              
              // Add yellow mark if it's a 3-story building (special case)
              if (structureData.numStories === 3) {
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(spanMidX + 15, currentY + 30, 10, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      }
      
      // Move to the next story
      currentY += storyHeight;
    }
  };
  
  const drawArrows = (ctx: CanvasRenderingContext2D, padding: number) => {
    let currentY = padding;
    
    // Fixed left alignment for irregular structures
    const fixedStartX = padding;
    
    // Draw arrows for each story
    for (let storyIndex = 0; storyIndex < structureData.numStories; storyIndex++) {
      const storyHeight = structureData.storyHeights[storyIndex] * scale;
      const numSpans = structureData.spansPerStory[storyIndex];
      const spans = structureData.spanMeasurements[storyIndex];
      
      // Calculate total width for this story
      const totalWidth = isIrregular 
        ? columnSpacing * numSpans 
        : spans.reduce((sum, span) => sum + span * scale, 0);
      
      // For regular: center the structure horizontally
      // For irregular: align to the left (all stories start from same left position)
      const startX = isIrregular 
        ? fixedStartX 
        : (ctx.canvas.width - totalWidth) / 2;
      
      // Draw lateral load arrow at the right side of the structure
      const lateralLoadArrowX = startX + totalWidth + 30;
      const lateralLoadArrowY = currentY + storyHeight / 2;
      
      // Draw lateral load arrow
      drawHorizontalArrow(
        ctx, 
        lateralLoadArrowX, 
        lateralLoadArrowY, 
        lateralLoadArrowX - 30, 
        lateralLoadArrowY, 
        '#FF5722', 
        6
      );
      
      // Label the lateral load
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Lateral Load', lateralLoadArrowX + 5, lateralLoadArrowY - 5);
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      
      // Draw column shear arrows
      for (let columnIndex = 0; columnIndex <= numSpans; columnIndex++) {
        // Calculate column position
        const columnX = startX + (isIrregular 
          ? columnIndex * columnSpacing 
          : spans.slice(0, columnIndex).reduce((sum, span) => sum + span * scale, 0));
        
        if (results.columnShear[storyIndex] && results.columnShear[storyIndex][columnIndex] !== undefined) {
          // Draw column shear arrow
          const arrowY = currentY + storyHeight / 3;
          const arrowLength = 20;
          
          drawHorizontalArrow(
            ctx,
            columnX - arrowLength, 
            arrowY, 
            columnX, 
            arrowY, 
            '#0076FF',
            3
          );
        }
        
        // Draw column moment curved arrows
        if (results.columnMoment[storyIndex] && results.columnMoment[storyIndex][columnIndex] !== undefined) {
          // Draw curved arrow for column moment
          const momentY = currentY + storyHeight / 3 + 20;
          drawCurvedArrow(ctx, columnX, momentY, 15, '#FF3B30');
        }
      }
      
      // Draw girder shear and moment arrows
      for (let spanIndex = 0; spanIndex < numSpans; spanIndex++) {
        // Calculate span start and end points
        const spanStartX = startX + (isIrregular 
          ? spanIndex * columnSpacing 
          : spans.slice(0, spanIndex).reduce((sum, span) => sum + span * scale, 0));
        
        const spanEndX = startX + (isIrregular 
          ? (spanIndex + 1) * columnSpacing 
          : spans.slice(0, spanIndex + 1).reduce((sum, span) => sum + span * scale, 0));
        
        const spanMidX = (spanStartX + spanEndX) / 2;
        
        if (results.girderShear[storyIndex] && results.girderShear[storyIndex][spanIndex] !== undefined) {
          // Draw girder shear arrow
          const arrowY = currentY + 5;
          const arrowLength = 15;
          
          drawVerticalArrow(
            ctx,
            spanMidX, 
            currentY - arrowLength, 
            spanMidX, 
            currentY, 
            '#34C759',
            3
          );
        }
        
        // Draw girder moment curved arrows
        if (results.girderMoment[storyIndex] && results.girderMoment[storyIndex][spanIndex] !== undefined) {
          // Draw curved arrow for girder moment
          drawCurvedArrow(ctx, spanMidX, currentY + 10, 12, '#FF9500', true); // downward arrow
        }
      }
      
      // Move to the next story
      currentY += storyHeight;
    }
  };
  
  // Helper function to draw a horizontal arrow
  const drawHorizontalArrow = (
    ctx: CanvasRenderingContext2D, 
    fromX: number, 
    fromY: number, 
    toX: number, 
    toY: number, 
    color: string,
    headSize: number = 8
  ) => {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headSize, toY - headSize / 2);
    ctx.lineTo(toX - headSize, toY + headSize / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  
  // Helper function to draw a vertical arrow
  const drawVerticalArrow = (
    ctx: CanvasRenderingContext2D, 
    fromX: number, 
    fromY: number, 
    toX: number, 
    toY: number, 
    color: string,
    headSize: number = 8
  ) => {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headSize / 2, toY - headSize);
    ctx.lineTo(toX + headSize / 2, toY - headSize);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  
  // Helper function to draw a curved arrow
  const drawCurvedArrow = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    color: string,
    clockwise: boolean = false
  ) => {
    const startAngle = clockwise ? Math.PI : 0;
    const endAngle = clockwise ? 0 : Math.PI;
    
    // Draw arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, !clockwise);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Arrow head
    const headX = clockwise ? centerX + radius : centerX - radius;
    const headY = centerY;
    const headSize = 6;
    
    ctx.beginPath();
    if (clockwise) {
      ctx.moveTo(headX, headY);
      ctx.lineTo(headX - headSize, headY - headSize / 2);
      ctx.lineTo(headX - headSize, headY + headSize / 2);
    } else {
      ctx.moveTo(headX, headY);
      ctx.lineTo(headX + headSize, headY - headSize / 2);
      ctx.lineTo(headX + headSize, headY + headSize / 2);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
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
      
      <div className="mt-4 flex justify-center">
        <div className="w-full max-w-2xl p-3 border border-gray-200 rounded-lg bg-gray-50">
          <div className="text-sm text-framepro-darkgray">
            <p className="mb-2 font-medium">Legend:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Horizontal arrows (→) represent column shear forces</li>
              <li>Vertical arrows (↓) represent girder shear forces</li>
              <li>Curved arrows (↺/↻) represent moments</li>
              <li>Larger arrow at right represents the lateral load</li>
              <li>Colored markers indicate special structural analysis points on the ground floor:</li>
              <ul className="pl-5 space-y-1">
                <li><span className="text-red-500 font-medium">Red</span>: First span</li>
                <li><span className="text-blue-500 font-medium">Blue</span>: Second span</li>
                <li><span className="text-yellow-500 font-medium">Yellow</span>: Special case (3-story building)</li>
              </ul>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StructureVisualization;
