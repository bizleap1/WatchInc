"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

let hasInitialLoaded = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    if (!hasInitialLoaded) {
      hasInitialLoaded = true;
      return;
    }
    setIsWiping(true);
    const timer = setTimeout(() => {
      setIsWiping(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isWiping && (
          <motion.div
            key="route-wipe-curtain"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            style={{ originY: 0, backgroundColor: "var(--theme-bg, #0D0D10)" }}
            onAnimationComplete={() => setIsWiping(false)}
            className="fixed inset-0 z-[99999] pointer-events-none flex flex-col items-center justify-center overflow-hidden"
          >
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ backgroundColor: "var(--theme-accent, #E8A33D)" }}
            />
            <div className="font-sans font-medium text-[15px] tracking-[0.3em] text-white uppercase">
              WATCH INC
            </div>
            <div className="font-mono text-[9px] tracking-[0.28em] text-white/40 uppercase mt-2">
              NATURAL STONE DIALS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}
