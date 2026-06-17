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
        {/* Subtle Moving Background Gradient (Opal/Pearlescent) */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-90"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          style={{ 
            backgroundImage: 'linear-gradient(135deg, #fdfbfb, #f3f4f6, #e5e7eb, #fdfbfb)', 
            backgroundSize: '300% 300%' 
          }}
        />
        
        {/* Subtle noise/texture overlay for realism */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay z-0" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />

        {/* Top Section: Chip & Contactless */}
        <div className="relative z-20 flex justify-between items-center mt-6 ml-4">
          <div className="flex items-center gap-3">
            {/* Inline SVG Contactless Wave Symbol */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5 text-slate-500 opacity-90">
              <path d="M5 8.5c.83 1.17.83 2.83 0 4M8 6c1.66 2.17 1.66 5.83 0 8M11 3.5c2.5 3.17 2.5 8.83 0 12" />
            </svg>

            {/* Flat Minimalist EMV Chip (2D Silver) */}
            <div className="w-8 h-6 rounded-md bg-[#cbd5e1] border border-white/20 flex flex-col justify-evenly p-[2px] opacity-90 relative">
               <div className="w-full h-[1px] bg-black/10 rounded-full"></div>
               <div className="w-full flex justify-between h-[1px]">
                 <div className="w-1/3 h-full bg-black/10 rounded-full"></div>
                 <div className="w-1/3 h-full bg-black/10 rounded-full"></div>
               </div>
               <div className="w-full h-[1px] bg-black/10 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section: VISA Logo */}
        <div className="relative z-20 flex justify-end items-end w-full mb-2 pr-4 pb-2">
          <img src="/visa-logo.svg?v=1" alt="Visa Logo" className="h-4 w-auto object-contain opacity-95" />
        </div>

      </motion.div>
    </div>
  );
};

export default InteractiveCreditCard;
