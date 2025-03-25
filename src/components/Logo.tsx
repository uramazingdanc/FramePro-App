
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center logo-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="flex items-center">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-framepro-green font-bold text-2xl md:text-3xl tracking-tighter mr-1"
            style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}
          >
            FRAME
          </motion.div>
          <motion.div
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-framepro-black font-bold text-2xl md:text-3xl tracking-tight"
          >
            PRO
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute -z-10 -top-1 -left-1 -right-1 -bottom-1 flex"
        >
          <svg width="140" height="38" viewBox="0 0 140 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0">
            <g opacity="0.15">
              <line x1="10" y1="5" x2="25" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="25" y1="5" x2="10" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="30" y1="5" x2="45" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="45" y1="5" x2="30" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="50" y1="5" x2="65" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="65" y1="5" x2="50" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="70" y1="5" x2="85" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="85" y1="5" x2="70" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="90" y1="5" x2="105" y2="20" stroke="black" strokeWidth="1.5"/>
              <line x1="105" y1="5" x2="90" y2="20" stroke="black" strokeWidth="1.5"/>
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default Logo;
