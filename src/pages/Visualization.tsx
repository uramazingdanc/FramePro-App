
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import StructureVisualization from '@/components/visualization/StructureVisualization';
import StepByStepSolution from '@/components/visualization/StepByStepSolution';
import { useCalculation } from '@/context/CalculationContext';

const Visualization = () => {
  const navigate = useNavigate();
  const { structureData, calculationResults, hasCalculated } = useCalculation();
  
  if (!hasCalculated || !structureData || !calculationResults) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto text-center glassmorphism p-8 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-framepro-darkgray">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
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
            View the graphical representation of your structure analysis
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mb-4"
        >
          <button 
            onClick={() => navigate('/calculator')}
            className="btn-secondary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
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
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => window.print()} 
            className="btn-secondary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Export Results
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Visualization;
