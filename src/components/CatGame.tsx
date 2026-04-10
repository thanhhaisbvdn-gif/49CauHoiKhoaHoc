import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface CatGameProps {
  incorrectCount: number;
  lastResult: "correct" | "incorrect" | null;
  isFainted: boolean;
}

export default function CatGame({ incorrectCount, lastResult, isFainted }: CatGameProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [walkDirection, setWalkDirection] = useState(1); // 1 for right, -1 for left
  const [posX, setPosX] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isFainted) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 4000);

    const walkInterval = setInterval(() => {
      if (!isFainted && lastResult === null) {
        setPosX(prev => {
          const next = prev + walkDirection * 2;
          if (next > 100 || next < -100) {
            setWalkDirection(d => -d);
            return prev;
          }
          return next;
        });
      }
    }, 50);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(walkInterval);
    };
  }, [isFainted, walkDirection, lastResult]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-48 pointer-events-none z-50 overflow-visible">
      {/* Apple Falling Animation - Now falls from top of screen */}
      <AnimatePresence>
        {lastResult === "incorrect" && (
          <motion.div
            initial={{ y: -window.innerHeight, x: posX, opacity: 1 }}
            animate={{ y: 100, x: posX }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8, ease: "circIn" }}
            className="absolute left-1/2 -translate-x-1/2 z-50"
          >
            <div className="relative w-10 h-10 bg-green-500 rounded-full shadow-md">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-amber-900 rounded-full" />
              <div className="absolute -top-1 left-1/2 w-3 h-2 bg-green-600 rounded-full rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Cat */}
      <motion.div
        animate={{ 
          x: posX,
          rotate: isFainted ? 90 : 0,
          y: isFainted ? 20 : 0
        }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        {/* Ears */}
        <div className="flex justify-between w-20 -mb-2 px-2">
          <div className="w-6 h-6 bg-orange-400 rounded-tr-2xl rotate-[-15deg]" />
          <div className="w-6 h-6 bg-orange-400 rounded-tl-2xl rotate-[15deg]" />
        </div>

        {/* Head */}
        <div className="w-24 h-20 bg-orange-400 rounded-[35px] relative shadow-md flex flex-col items-center justify-center border-b-4 border-orange-500">
          {/* Bump on head - Attached to head and grows with incorrectCount */}
          {incorrectCount > 0 && (
            <motion.div 
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -top-6 z-30"
            >
              <div 
                className="bg-pink-300 rounded-full border-2 border-pink-400 shadow-sm"
                style={{ 
                  width: `${12 + incorrectCount * 10}px`, 
                  height: `${8 + incorrectCount * 6}px` 
                }}
              />
            </motion.div>
          )}
          
          {/* Face */}
          <div className="flex gap-6 mt-1">
            {isFainted ? (
              <div className="flex gap-6 text-xl font-bold text-orange-800">
                <span>X</span>
                <span>X</span>
              </div>
            ) : lastResult === "correct" ? (
              <div className="flex gap-6 text-xl font-bold text-orange-800">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>^</motion.span>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>^</motion.span>
              </div>
            ) : (
              <div className="flex gap-8">
                <div className="w-2.5 h-2.5 bg-gray-800 rounded-full relative overflow-hidden">
                  <motion.div 
                    animate={{ height: isBlinking ? "100%" : "0%" }}
                    className="absolute top-0 w-full bg-orange-400" 
                  />
                </div>
                <div className="w-2.5 h-2.5 bg-gray-800 rounded-full relative overflow-hidden">
                  <motion.div 
                    animate={{ height: isBlinking ? "100%" : "0%" }}
                    className="absolute top-0 w-full bg-orange-400" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Nose & Mouth */}
          <div className="mt-1 flex flex-col items-center">
            <div className="w-2.5 h-1.5 bg-pink-400 rounded-full" />
            {lastResult === "correct" ? (
              <motion.div 
                animate={{ scaleY: [1, 1.5, 1] }}
                className="w-6 h-3 border-b-3 border-orange-800 rounded-full" 
              />
            ) : isFainted ? (
              <div className="w-5 h-0.5 bg-orange-800 rounded-full mt-1" />
            ) : (
              <div className="flex">
                <div className="w-3 h-2 border-b-2 border-orange-800 rounded-full -mr-0.5" />
                <div className="w-3 h-2 border-b-2 border-orange-800 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="w-20 h-16 bg-orange-400 rounded-t-[40px] -mt-2 relative shadow-inner">
          {/* Paws */}
          <motion.div 
            animate={!isFainted && lastResult === null ? { y: [0, -4, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -bottom-1 left-2 w-5 h-5 bg-orange-500 rounded-full" 
          />
          <motion.div 
            animate={!isFainted && lastResult === null ? { y: [-4, 0, -4] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -bottom-1 right-2 w-5 h-5 bg-orange-500 rounded-full" 
          />
          
          {/* Tail */}
          {!isFainted && (
            <motion.div
              animate={{ rotate: [0, 30, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-5 bottom-3 w-10 h-3 bg-orange-500 rounded-full origin-left"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
