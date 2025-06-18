import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Animation variants for characters
const charVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    rotateX: -90,
    scale: 0.8 
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay: i * 0.03,
      type: 'spring',
      damping: 12,
      stiffness: 100
    }
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -20,
    rotateX: 90,
    scale: 0.8,
    transition: {
      delay: i * 0.02,
      type: 'spring',
      damping: 15,
      stiffness: 100
    }
  })
};

// Animation variants for the cursor
const cursorVariants = {
  blink: {
    opacity: [0, 1, 1, 0],
    scaleY: [1, 1.2, 0.8, 1],
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
  speed?: number;
  deleteSpeed?: number;
  delayBetweenTexts?: number;
  delayBeforeDelete?: number;
  className?: string;
  cursorClassName?: string;
  textClassName?: string;
}

export function TypingAnimation({
  texts,
  speed = 40,
  deleteSpeed = 20,
  delayBetweenTexts = 1500,
  delayBeforeDelete = 2000,
  className = '',
  cursorClassName = 'bg-white',
  textClassName = 'text-white'
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimation();

  // Handle typing and deleting text
  useEffect(() => {
    const currentText = texts[currentIndex % texts.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing effect
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, speed);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDelete);
      }
    } else {
      // Deleting effect
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, deleteSpeed);
      } else {
        // Finished deleting, move to next text
        setIsDeleting(false);
        setCurrentIndex(prev => (prev + 1) % texts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentIndex, isDeleting, texts, speed, deleteSpeed, delayBeforeDelete]);

  // Split text into characters for individual animation
  const characters = displayText.split('');

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          className="inline-flex flex-wrap justify-center items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {characters.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              className={`inline-block ${textClassName}`}
              custom={i}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={charVariants}
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                transformOrigin: 'bottom center'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
