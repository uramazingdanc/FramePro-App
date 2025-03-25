
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface FormData {
  numStories: number;
  storyHeights: number[];
  structureType: 'REGULAR' | 'IRREGULAR';
  spansPerStory: number[];
  spanMeasurements: number[][];
  lateralLoads: number[];
}

interface CalculatorFormProps {
  onCalculate: (data: FormData) => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    numStories: 2,
    storyHeights: [3, 3],
    structureType: 'REGULAR',
    spansPerStory: [2, 2],
    spanMeasurements: [[4, 4], [4, 4]],
    lateralLoads: [10, 10],
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    // Check if all fields have valid values
    const hasValidStories = formData.numStories > 0 && formData.numStories <= 4;
    const hasValidStoryHeights = formData.storyHeights.every(height => height > 0);
    const hasValidSpans = formData.spansPerStory.every(span => span > 0 && span <= 5);
    const hasValidSpanMeasurements = formData.spanMeasurements.every(
      (measurements, index) => measurements.length === formData.spansPerStory[index] && 
      measurements.every(m => m > 0)
    );
    const hasValidLateralLoads = formData.lateralLoads.every(load => load > 0);

    setIsFormValid(
      hasValidStories && 
      hasValidStoryHeights && 
      hasValidSpans && 
      hasValidSpanMeasurements && 
      hasValidLateralLoads
    );
  };

  const handleNumberOfStoriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const numStories = parseInt(e.target.value);
    
    if (numStories > 4) {
      toast.error("Maximum 4 stories allowed");
      return;
    }
    
    // Initialize arrays with default values based on the number of stories
    const storyHeights = Array(numStories).fill(3);
    const spansPerStory = Array(numStories).fill(2);
    const lateralLoads = Array(numStories).fill(10);
    
    // Initialize span measurements based on spans per story
    const spanMeasurements = spansPerStory.map(spans => Array(spans).fill(4));
    
    setFormData({
      ...formData,
      numStories,
      storyHeights,
      spansPerStory,
      spanMeasurements,
      lateralLoads,
    });
  };
  
  const handleStoryHeightChange = (index: number, value: number) => {
    const newHeights = [...formData.storyHeights];
    newHeights[index] = value;
    setFormData({ ...formData, storyHeights: newHeights });
  };
  
  const handleStructureTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      structureType: e.target.value as 'REGULAR' | 'IRREGULAR',
    });
  };
  
  const handleSpansPerStoryChange = (index: number, value: number) => {
    if (value > 5) {
      toast.error("Maximum 5 spans allowed per story");
      return;
    }
    
    const newSpansPerStory = [...formData.spansPerStory];
    newSpansPerStory[index] = value;
    
    // Update span measurements based on new span count
    const newSpanMeasurements = [...formData.spanMeasurements];
    newSpanMeasurements[index] = Array(value).fill(4);
    
    setFormData({
      ...formData,
      spansPerStory: newSpansPerStory,
      spanMeasurements: newSpanMeasurements,
    });
  };
  
  const handleSpanMeasurementChange = (storyIndex: number, spanIndex: number, value: number) => {
    const newSpanMeasurements = [...formData.spanMeasurements];
    if (!newSpanMeasurements[storyIndex]) {
      newSpanMeasurements[storyIndex] = [];
    }
    newSpanMeasurements[storyIndex][spanIndex] = value;
    setFormData({ ...formData, spanMeasurements: newSpanMeasurements });
  };
  
  const handleLateralLoadChange = (index: number, value: number) => {
    const newLateralLoads = [...formData.lateralLoads];
    newLateralLoads[index] = value;
    setFormData({ ...formData, lateralLoads: newLateralLoads });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fill all required fields with valid values");
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate calculation time
    setTimeout(() => {
      onCalculate(formData);
      setIsCalculating(false);
      toast.success("Calculation completed successfully!");
      
      // Navigate to visualization page
      navigate('/visualization');
    }, 1500);
  };
  
  const handleReset = () => {
    setFormData({
      numStories: 2,
      storyHeights: [3, 3],
      structureType: 'REGULAR',
      spansPerStory: [2, 2],
      spanMeasurements: [[4, 4], [4, 4]],
      lateralLoads: [10, 10],
    });
    toast.info("Form has been reset");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="glassmorphism rounded-xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-medium text-framepro-text">Structure Parameters</h2>
            <div className="h-0.5 w-full bg-gradient-to-r from-framepro-green/80 to-framepro-green/10"></div>
          </div>
          
          {/* Number of Stories & Structure Type */}
          <div className="space-y-4">
            <div>
              <label htmlFor="numStories" className="form-label">Number of Stories (Max: 4)</label>
              <select
                id="numStories"
                value={formData.numStories}
                onChange={handleNumberOfStoriesChange}
                className="form-select input-focus"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="structureType" className="form-label">Structure Type</label>
              <select
                id="structureType"
                value={formData.structureType}
                onChange={handleStructureTypeChange}
                className="form-select input-focus"
              >
                <option value="REGULAR">Regular (Uniform Spans)</option>
                <option value="IRREGULAR">Irregular (Varied Spans)</option>
              </select>
            </div>
          </div>
          
          {/* Story Height Inputs */}
          <div className="space-y-4">
            {Array.from({ length: formData.numStories }).map((_, index) => (
              <div key={`story-height-${index}`}>
                <label htmlFor={`storyHeight-${index}`} className="form-label">
                  Height of Story {formData.numStories - index} (m)
                </label>
                <input
                  id={`storyHeight-${index}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.storyHeights[index]}
                  onChange={(e) => handleStoryHeightChange(index, parseFloat(e.target.value))}
                  className="form-input input-focus"
                />
              </div>
            ))}
          </div>
          
          {/* Spans Section */}
          <div className="md:col-span-2 space-y-4 mt-2">
            <h2 className="text-xl font-medium text-framepro-text">Spans & Loads</h2>
            <div className="h-0.5 w-full bg-gradient-to-r from-framepro-green/80 to-framepro-green/10"></div>
          </div>
          
          {/* Spans Per Story & Measurements */}
          {Array.from({ length: formData.numStories }).map((_, storyIndex) => (
            <div key={`story-spans-${storyIndex}`} className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/50 rounded-lg border border-gray-100">
              <div>
                <h3 className="text-lg font-medium mb-3">Story {formData.numStories - storyIndex}</h3>
                <div>
                  <label htmlFor={`spansPerStory-${storyIndex}`} className="form-label">
                    Number of Spans (Max: 5)
                  </label>
                  <select
                    id={`spansPerStory-${storyIndex}`}
                    value={formData.spansPerStory[storyIndex]}
                    onChange={(e) => handleSpansPerStoryChange(storyIndex, parseInt(e.target.value))}
                    className="form-select input-focus"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-4">
                  <label htmlFor={`lateralLoad-${storyIndex}`} className="form-label">
                    Lateral Load (kN)
                  </label>
                  <input
                    id={`lateralLoad-${storyIndex}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.lateralLoads[storyIndex]}
                    onChange={(e) => handleLateralLoadChange(storyIndex, parseFloat(e.target.value))}
                    className="form-input input-focus"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium mb-3 text-framepro-darkgray">Span Measurements (m)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Array.from({ length: formData.spansPerStory[storyIndex] }).map((_, spanIndex) => (
                    <div key={`span-${storyIndex}-${spanIndex}`}>
                      <label htmlFor={`spanMeasurement-${storyIndex}-${spanIndex}`} className="form-label text-xs">
                        Span {spanIndex + 1}
                      </label>
                      <input
                        id={`spanMeasurement-${storyIndex}-${spanIndex}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.spanMeasurements[storyIndex]?.[spanIndex] || 0}
                        onChange={(e) => handleSpanMeasurementChange(storyIndex, spanIndex, parseFloat(e.target.value))}
                        className="form-input input-focus"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Actions */}
          <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={isCalculating || !isFormValid}
              className="btn-primary relative"
            >
              {isCalculating ? (
                <span className="flex items-center justify-center">
                  Calculating
                  <span className="loading-dots ml-2">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </span>
              ) : (
                'Calculate & View Frame'
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CalculatorForm;
