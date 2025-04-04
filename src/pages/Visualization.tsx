
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import StructureVisualization from '@/components/visualization/StructureVisualization';
import StepByStepSolution from '@/components/visualization/StepByStepSolution';
import { useCalculation } from '@/context/CalculationContext';
import { AlertCircle, Download, Info, RefreshCw } from 'lucide-react';

const Visualization = () => {
  const navigate = useNavigate();
  const { structureData, calculationResults, hasCalculated } = useCalculation();
  
  if (!hasCalculated || !structureData || !calculationResults) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto text-center glassmorphism p-8 rounded-xl">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-framepro-darkgray" />
            <h2 className="text-2xl font-medium mb-4">No Calculations Yet</h2>
            <p className="text-framepro-darkgray mb-6">
              You need to run a calculation first before viewing visualizations.
            </p>
            <button 
              onClick={() => navigate('/calculator')} 
              className="btn-primary"
            >
              Go to Calculator
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Frame Analysis Visualization</h1>
          <p className="text-framepro-darkgray mt-2">
            View the graphical representation of your structure analysis with visual indicators for forces and moments
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6"
        >
          <div className="bg-blue-50 p-3 rounded-lg max-w-xl">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-framepro-darkgray">
                <span className="font-medium">Portal Method Analysis:</span> Girder moments are calculated using column moments from the current floor and the floor directly above. Girder shears are calculated by doubling the girder moment and dividing by the span length (Vgirder = 2M / L), which represents equal moments on both ends of the girder.
                For irregular structures, the upper floors align with the left side of the ground floor to maintain column alignment.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/calculator')}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Update Calculation
          </button>
        </motion.div>
        
        <StructureVisualization 
          structureData={structureData}
          results={calculationResults}
        />
        
        <StepByStepSolution 
          structureData={structureData}
          results={calculationResults}
        />
        
        <div className="flex justify-center mt-8 gap-4">
          <button 
            onClick={() => window.print()} 
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Results
          </button>
          
          <button 
            onClick={() => navigate('/calculator')} 
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Modify Structure
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Visualization;
