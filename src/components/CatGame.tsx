import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface CatGameProps {
  incorrectCount: number;
  lastResult: "correct" | "incorrect" | null;
}

export default function CatGame({ incorrectCount, lastResult }: CatGameProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [walkDirection, setWalkDirection] = useState(1); // 1 for right, -1 for left
  const [posX, setPosX] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);

    const walkInterval = setInterval(() => {
      if (lastResult === null) {
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
  }, [walkDirection, lastResult]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-48 pointer-events-none z-50 overflow-visible">
      {/* Apple Falling Animation - Falls, hits, and shoots off */}
      <AnimatePresence>
        {lastResult === "incorrect" && (
          <motion.div
            initial={{ y: -window.innerHeight, x: posX, opacity: 1, rotate: 0 }}
            animate={{ 
              y: [null, 100, 150], // Hits at 100, then falls off
              x: [posX, posX, posX + 150], // Shoots to the side
              rotate: [0, 0, 360],
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 1.0, 
              times: [0, 0.5, 1],
              ease: "easeIn" 
            }}
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
          rotate: 0,
          y: 0
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
          {/* Face */}
          <div className="flex gap-6 mt-1">
            {lastResult === "correct" ? (
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
            ) : (
              <div className="flex">
                <div className="w-3 h-2 border-b-2 border-orange-800 rounded-full -mr-0.5" />
                <div className="w-3 h-2 border-b-2 border-orange-800 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="w-20 h-16 bg-orange-400 rounded-t-[40px] -mt-2 relative shadow-inner overflow-hidden">
          {/* Green Paint Spots (Bruises) - Deterministic positions */}
          {Array.from({ length: incorrectCount }).map((_, i) => {
            // Deterministic values based on index i so they don't move
            const size = 10 + (i % 3) * 4;
            const top = 15 + (i * 17) % 60;
            const left = 10 + (i * 23) % 75;
            const rotation = i * 45;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.8, scale: 1 }}
                className="absolute bg-green-500 rounded-full blur-[1px]"
                style={{
                  width: `${size}px`,
                  height: `${size * 0.85}px`,
                  top: `${top}%`,
                  left: `${left}%`,
                  transform: `rotate(${rotation}deg)`,
                  boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.1)'
                }}
              />
            );
          })}

          {/* Paws */}
          <motion.div 
            animate={lastResult === null ? { y: [0, -4, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -bottom-1 left-2 w-5 h-5 bg-orange-500 rounded-full" 
          />
          <motion.div 
            animate={lastResult === null ? { y: [-4, 0, -4] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -bottom-1 right-2 w-5 h-5 bg-orange-500 rounded-full" 
          />
          
          {/* Tail */}
          <motion.div
            animate={{ rotate: [0, 30, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-5 bottom-3 w-10 h-3 bg-orange-500 rounded-full origin-left"
          />
        </div>
      </motion.div>
    </div>
  );
}
