import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedResult } from '../types';

interface Props {
  loading: boolean;
  result: GeneratedResult | null;
  loadingStep: string;
}

export const ResultCard: React.FC<Props> = ({ loading, result, loadingStep }) => {
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    let interval: any;
    if (loading) {
      const start = Date.now();
      interval = setInterval(() => {
        const diff = Date.now() - start;
        const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        const ms = Math.floor((diff % 1000) / 10).toString().padStart(2, '0');
        setTimer(`${mins}:${secs}:${ms}`);
      }, 30);
    } else {
      setTimer("00:00:00");
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (!loading && !result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        mt-8 w-full relative rounded-[32px] overflow-hidden glass-card border border-white/10 shadow-2xl group
        ${loading ? 'aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center' : 'h-auto md:h-[600px]'}
      `}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            {/* Breathing Light Orb - Dark Mode version */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 blur-[60px] animate-pulse opacity-40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,1)] animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <div className="font-mono text-2xl text-slate-300 tracking-widest font-light">
              {timer}
            </div>
            
            <motion.div 
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-slate-400 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5"
            >
              {loadingStep}
            </motion.div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            className="relative w-full h-full flex flex-col md:block"
            initial={{ filter: 'blur(20px)', opacity: 0 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Image Section */}
            <div className="w-full relative flex-1 md:h-full">
              <img 
                src={result.imageUrl} 
                alt="Generated Logo" 
                className="w-full h-auto md:h-full object-cover rounded-t-[32px] md:rounded-[32px]"
              />
            </div>
            
            {/* Analysis Tray - Stacked on Mobile, Overlay on Desktop */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="
                relative md:absolute md:bottom-6 md:left-6 md:right-6 
                p-5 md:p-6 
                bg-black/60 md:glass-card md:backdrop-blur-xl 
                border-t md:border border-white/10 
                rounded-b-[32px] md:rounded-2xl
                z-10
              "
            >
              <div className="flex items-start gap-4">
                <div className="w-1 h-12 bg-gradient-to-b from-purple-400 to-blue-500 rounded-full shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">设计理念解读</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {result.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};