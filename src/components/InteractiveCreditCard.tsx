import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const InteractiveCreditCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { palette } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  // Mouse position values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the movement with springs
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 25, mass: 1 });
  const mouseYSpring = useSpring(y, { stiffness: 60, damping: 25, mass: 1 });

  // Map mouse positions to rotation angles
  // Max rotation angle is 10 degrees for a smoother, more subtle tilt
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Calculate a subtle glare effect that moves with the mouse
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate normalized coordinates (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    // Reset back to center when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className={`relative flex items-center justify-center w-full h-full perspective-[1000px] overflow-visible ${palette.isDark ? 'bg-slate-900' : 'bg-slate-100'} ${className} transition-colors duration-[1500ms]`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className={`relative w-[340px] h-[215px] sm:w-[400px] sm:h-[250px] rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden cursor-default`}
      >
        {/* Background vivid gradient based on active theme tokens */}
        <div 
          className="absolute inset-0 z-0 opacity-90 transition-colors duration-[1500ms]"
          style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
        />
        
        {/* Subtle noise/texture overlay for realism */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay z-0" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />

        {/* Glare effect */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)",
            left: glareX,
            top: glareY,
            width: "150%",
            height: "150%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Top Section: Chip & Contactless */}
        <div className="relative z-20 flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            {/* Inline SVG Contactless Wave Symbol (Left of Chip, facing chip) */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/90"
            >
              <path d="M5.5 15.5C4 13.5 4 10.5 5.5 8.5" />
              <path d="M8.5 18.5C6 15 6 9 8.5 5.5" />
              <path d="M11.5 21.5C8 16.5 8 7.5 11.5 2.5" />
              <path d="M14.5 18.5C17 15 17 9 14.5 5.5" />
            </svg>

            {/* Realistic Detailed Metallic EMV Chip (Silver) */}
            <div className="w-12 h-10 sm:w-14 sm:h-[42px] rounded-md bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 p-[1px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] relative overflow-hidden opacity-95">
               <div className="w-full h-full rounded-[5px] overflow-hidden grid grid-cols-3 grid-rows-4 gap-[1px] bg-slate-500/30">
                 {/* Top row */}
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-r border-b border-black/10"></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-b border-black/10 flex items-center justify-center"><div className="w-4 h-[1px] bg-slate-400/50 rounded-full"></div></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-l border-b border-black/10"></div>

                 {/* Middle rows (Center simulation) */}
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 row-span-2 border-r border-black/10"></div>
                 <div className="bg-gradient-to-br from-slate-100 to-slate-300 shadow-inner col-span-1 row-span-2 border border-black/20 rounded-full mx-[2px] my-[1px] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full border border-black/10"></div>
                 </div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 row-span-2 border-l border-black/10"></div>

                 {/* Bottom row */}
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-r border-t border-black/10"></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-t border-black/10 flex items-center justify-center"><div className="w-4 h-[1px] bg-slate-400/50 rounded-full"></div></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-l border-t border-black/10"></div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: VISA Logo */}
        <div className="relative z-20 flex justify-end items-end w-full mb-2">
          <img 
            src="/images/visa_logo.svg" 
            alt="Visa Logo" 
            className="w-[70px] drop-shadow-md opacity-90 object-contain"
          />
        </div>

      </motion.div>
    </div>
  );
};

export default InteractiveCreditCard;
