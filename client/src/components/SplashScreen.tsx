import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain, Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => onComplete(), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax]"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: phase >= 2 ? 3 : 0,
              rotate: phase >= 2 ? 180 : 0
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-conic from-primary via-teal-400 to-primary opacity-20 blur-3xl" />
          </motion.div>

          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary"
              initial={{ 
                x: "50vw",
                y: "50vh",
                scale: 0 
              }}
              animate={{ 
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: phase >= 2 ? [0, 1, 0] : 0,
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            className="relative"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: phase >= 0 ? 1 : 0,
              opacity: phase >= 0 ? 1 : 0
            }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
          >
            <motion.div
              className="absolute -inset-8 rounded-full bg-gradient-to-r from-primary to-teal-400 opacity-30 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.div
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-2xl shadow-primary/50"
              animate={phase >= 1 ? {
                rotateY: [0, 360],
                rotateX: [0, 10, 0]
              } : {}}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              
              <motion.div
                className="absolute -top-2 -right-2"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ 
                  scale: phase >= 1 ? 1 : 0,
                  rotate: 0
                }}
                transition={{ type: "spring", delay: 0.5 }}
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: phase >= 1 ? 1 : 0,
              y: phase >= 1 ? 0 : 20
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl font-bold font-['Playfair_Display'] text-white"
              animate={phase >= 2 ? {
                backgroundImage: [
                  "linear-gradient(90deg, #fff 0%, #fff 100%)",
                  "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 50%, #14b8a6 100%)",
                  "linear-gradient(90deg, #fff 0%, #fff 100%)"
                ]
              } : {}}
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "white"
              }}
              transition={{ duration: 1.5 }}
            >
              Genius
            </motion.h1>

            <motion.p
              className="mt-3 text-gray-400 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              transition={{ delay: 0.2 }}
            >
              O teu tutor inteligente
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-12 flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
