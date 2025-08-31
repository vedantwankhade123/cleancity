import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for text transitions
const textVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.6,
      ease: 'easeIn'
    }
  }
};

// Animation variants for the cursor
const cursorVariants = {
  blink: {
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut'
    }
  }
};

interface TypingAnimationProps {
  texts: string[];
  transitionDuration?: number;
  displayDuration?: number;
  className?: string;
  cursorClassName?: string;
  textClassName?: string;
  showCursor?: boolean;
}

export function TypingAnimation({
  texts,
  transitionDuration = 3000,
  displayDuration = 3000,
  className = '',
  cursorClassName = 'bg-white',
  textClassName = 'text-white',
  showCursor = true
}: TypingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle text rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % texts.length);
    }, displayDuration + transitionDuration);

    return () => clearInterval(interval);
  }, [texts, displayDuration, transitionDuration]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          className="inline-flex flex-wrap justify-center items-center"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={textVariants}
        >
          <span className={textClassName}>
            {texts[currentIndex % texts.length]}
          </span>
          {showCursor && (
            <motion.span
              className={`inline-block w-[2px] h-8 ml-1 ${cursorClassName}`}
              variants={cursorVariants}
              animate="blink"
              style={{
                display: 'inline-block',
                transformOrigin: 'center bottom',
                boxShadow: '0 0 15px rgba(255,255,255,0.7)'
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
