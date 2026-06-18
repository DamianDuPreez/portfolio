import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import WebGLWaveBackground from './WebGLWaveBackground';

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
      {/* Theme-synced outer container wash */}
      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none transition-colors duration-[1500ms]"
        style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
      />
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className={`relative w-[340px] h-[215px] sm:w-[400px] sm:h-[250px] rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden cursor-default`}
      >
        {/* Stripe-Inspired WebGL Animated Wave Background */}
        <div 
          className="absolute top-0 right-0 w-[65%] h-full overflow-hidden pointer-events-none z-0 opacity-90 transition-opacity duration-[1500ms]"
          style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        >
          <WebGLWaveBackground 
            color1={palette.primary} 
            color2={palette.secondary}
          />
        </div>



        {/* Subtle noise/texture overlay for realism (gradient side only) */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay z-0 pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />

        {/* Top Section: Chip & Contactless */}
        <div className="relative z-20 flex justify-between items-center mt-6 ml-4">
          <div className="flex items-center gap-3">
            {/* Inline SVG Contactless Wave Symbol */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-6 w-6 text-white/80 opacity-90 shrink-0">
              <path d="M5 8.5c.83 1.17.83 2.83 0 4M8 6c1.66 2.17 1.66 5.83 0 8M11 3.5c2.5 3.17 2.5 8.83 0 12" />
            </svg>

            {/* High-Fidelity Geometric EMV Chip */}
            <div className="w-[36px] h-[26px] rounded-[4px] bg-[#cbd5e1] border-[0.5px] border-white/20 relative overflow-hidden flex items-center justify-center opacity-95">
               {/* Divider Grid */}
               <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <div className="absolute top-[25%] w-full h-[0.5px] bg-black/10" />
                  <div className="absolute bottom-[25%] w-full h-[0.5px] bg-black/10" />
                  <div className="absolute left-[30%] w-[0.5px] h-full bg-black/10" />
                  <div className="absolute right-[30%] w-[0.5px] h-full bg-black/10" />
               </div>
               {/* Centered Microcontroller Block */}
               <div className="relative z-10 w-[14px] h-[16px] border-[0.5px] border-black/15 rounded-[2px] flex items-center justify-center bg-[#cbd5e1]">
                  <div className="w-1 h-1 border-[0.5px] border-black/15 rounded-full" />
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: VISA Logo */}
        <div className="relative z-20 flex justify-end items-end w-full mb-2 pr-4 pb-2">
          <img src="/visa-logo.svg?v=1" alt="Visa Logo" className="h-5 w-auto object-contain drop-shadow-sm" />
        </div>

      </motion.div>
    </div>
  );
};

export default InteractiveCreditCard;
