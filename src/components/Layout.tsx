
import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 pt-24 pb-12"
      >
        {children}
      </motion.main>
      <footer className="py-6 bg-white/30 backdrop-blur-sm border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-framepro-darkgray">
          <p>© 2024 FramePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
