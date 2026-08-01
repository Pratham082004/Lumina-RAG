import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      overflow: 'hidden',
      background: 'var(--bg-primary)',
      pointerEvents: 'none'
    }}>
      {/* Noise Texture Overlay for Premium Feel */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          zIndex: 0
        }}
      />
      
      {/* Blob 1 - Top Left */}
      <motion.div
        animate={{
          x: [0, 150, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-15%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, var(--accent-blue) 0%, transparent 60%)',
          opacity: 0.15,
          filter: 'blur(100px)',
          borderRadius: '50%'
        }}
      />

      {/* Blob 2 - Bottom Right */}
      <motion.div
        animate={{
          x: [0, -150, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, var(--accent-purple) 0%, transparent 60%)',
          opacity: 0.12,
          filter: 'blur(120px)',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
