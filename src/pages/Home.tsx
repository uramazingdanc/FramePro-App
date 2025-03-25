
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Logo from '@/components/Logo';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <div className="scale-[2]">
              <Logo />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            Structural Analysis Tool
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-framepro-darkgray mb-12 max-w-2xl mx-auto"
          >
            An intuitive and visually engaging tool designed for civil engineering students and professionals to analyze multi-story building frames using the Portal Method.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col md:flex-row justify-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="glassmorphism p-6 rounded-xl card-hover"
            >
              <div className="h-16 w-16 bg-framepro-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-framepro-green">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-3">Calculator Mode</h2>
              <p className="text-framepro-darkgray mb-6">Input parameters for structural calculations and analyze frames using the Portal Method.</p>
              <button 
                onClick={() => navigate('/calculator')}
                className="btn-primary w-full"
              >
                Start Calculating
              </button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="glassmorphism p-6 rounded-xl card-hover"
            >
              <div className="h-16 w-16 bg-framepro-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-framepro-green">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-3">Visualization Mode</h2>
              <p className="text-framepro-darkgray mb-6">View graphical representations of the Portal Method analysis and results.</p>
              <button 
                onClick={() => navigate('/visualization')}
                className="btn-primary w-full"
              >
                View Visualizations
              </button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-20"
          >
            <h3 className="text-lg font-medium mb-3">Key Features</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-framepro-green/10 text-framepro-text px-3 py-1 rounded-full text-sm">Accurate Structural Analysis</span>
              <span className="bg-framepro-green/10 text-framepro-text px-3 py-1 rounded-full text-sm">Frame Visualization</span>
              <span className="bg-framepro-green/10 text-framepro-text px-3 py-1 rounded-full text-sm">Step-by-Step Solutions</span>
              <span className="bg-framepro-green/10 text-framepro-text px-3 py-1 rounded-full text-sm">User-Friendly Navigation</span>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
