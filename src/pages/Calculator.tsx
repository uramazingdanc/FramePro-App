
import React from 'react';
import Layout from '@/components/Layout';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import { useCalculation } from '@/context/CalculationContext';

const Calculator = () => {
  const { calculateResults } = useCalculation();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Frame Analysis Calculator</h1>
          <p className="text-framepro-darkgray mt-2">
            Input your structure parameters to calculate forces and moments using the Portal Method
          </p>
        </div>
        
        <CalculatorForm onCalculate={calculateResults} />
      </div>
    </Layout>
  );
};

export default Calculator;
