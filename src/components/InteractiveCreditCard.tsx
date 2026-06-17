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
        <div className="relative z-20 flex justify-between items-center mt-6 ml-4">
          <div className="flex items-center gap-3">
            {/* Realistic Detailed Metallic EMV Chip (Silver) */}
            <div className="w-9 h-7 rounded-[4px] bg-gradient-to-br from-[#d4d4d8] via-[#f4f4f5] to-[#a1a1aa] p-[1px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] relative overflow-hidden opacity-95">
               <div className="w-full h-full rounded-[3px] overflow-hidden grid grid-cols-3 grid-rows-4 gap-[1px] bg-slate-500/20">
                 {/* Top row */}
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-r border-b border-black/10"></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-b border-black/10 flex items-center justify-center"><div className="w-2 h-[1px] bg-slate-400/50 rounded-full"></div></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-l border-b border-black/10"></div>

                 {/* Middle rows (Center simulation) */}
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 row-span-2 border-r border-black/10"></div>
                 <div className="bg-gradient-to-br from-slate-100 to-slate-300 shadow-inner col-span-1 row-span-2 border border-black/20 rounded-full mx-[1px] my-[1px] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full border border-black/10"></div>
                 </div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 row-span-2 border-l border-black/10"></div>

                 {/* Bottom row */}
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-r border-t border-black/10"></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-t border-black/10 flex items-center justify-center"><div className="w-2 h-[1px] bg-slate-400/50 rounded-full"></div></div>
                 <div className="bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner col-span-1 border-l border-t border-black/10"></div>
               </div>
            </div>

            {/* Inline SVG Contactless Wave Symbol */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5 text-white/80 opacity-90">
              <path d="M5 8.5c.83 1.17.83 2.83 0 4M8 6c1.66 2.17 1.66 5.83 0 8M11 3.5c2.5 3.17 2.5 8.83 0 12" />
            </svg>
          </div>
        </div>

        {/* Bottom Section: VISA Logo */}
        <div className="relative z-20 flex justify-end items-end w-full mb-2 pr-2 pb-2">
          <svg viewBox="0 0 60 20" fill="currentColor" className="h-5 w-auto text-white opacity-95 selection:bg-transparent drop-shadow-sm">
            <path d="M25.2 1.2L22.9 15.6h-3.4l2.3-14.4h3.4zm10.7 0l-2.6 10.3-.3-1.4c-.5-1.8-2-3.8-3.8-4.7l2.5 10.2h3.6l5.3-14.4H35.9zm13 0h-2.8c-.8 0-1.5.5-1.8 1.2l-5.1 13.2h3.7l.7-2.1h4.5l.4 2.1h3.2L52 1.2c-.1 0-.1 0 0 0zm-3.6 9.4l1.9-5.3 1.1 5.3h-3zm-32.5-9.4l-3.3 8.7-.4-1.9c-.6-2.1-2.2-4.3-4.3-5.4L8 15.6h3.7l5.5-14.4H13.6z" />
          </svg>
        </div>

      </motion.div>
    </div>
  );
};

export default InteractiveCreditCard;
