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
        className={`relative w-[340px] h-[215px] sm:w-[400px] sm:h-[250px] rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden cursor-default transition-shadow hover:shadow-[0_20px_50px_rgba(236,72,153,0.3)]`}
      >
        {/* Background vivid gradient based on theme */}
        <div className={`absolute inset-0 z-0 opacity-90 transition-colors duration-[1500ms] ${palette.isDark ? 'bg-gradient-to-br from-indigo-800 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-rose-200 via-fuchsia-300 to-indigo-300'}`} />
        
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
          {/* Metallic EMV Chip */}
          <div className="w-12 h-10 rounded-md overflow-hidden bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-inner flex flex-col justify-evenly p-[1px] opacity-90 relative">
             <div className="absolute inset-0 border border-black/10 rounded-md"></div>
             {/* Chip lines */}
             <div className="w-full h-[1px] bg-black/10"></div>
             <div className="w-full h-[1px] bg-black/10"></div>
             <div className="w-full flex justify-between h-[1px]">
               <div className="w-1/3 h-full bg-black/10"></div>
               <div className="w-1/3 h-full bg-black/10"></div>
             </div>
          </div>

          {/* Inline SVG Contactless Wave Symbol */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/80"
          >
            <path d="M5.5 15.5C4 13.5 4 10.5 5.5 8.5" />
            <path d="M8.5 18.5C6 15 6 9 8.5 5.5" />
            <path d="M11.5 21.5C8 16.5 8 7.5 11.5 2.5" />
            <path d="M14.5 18.5C17 15 17 9 14.5 5.5" />
            <path d="M17.5 15.5C19 13.5 19 10.5 17.5 8.5" />
          </svg>
        </div>

        {/* Bottom Section: VISA Logo */}
        <div className="relative z-20 flex justify-end items-end w-full mb-2">
          <span className="text-white font-bold text-4xl italic tracking-wider drop-shadow-md">
            VISA
          </span>
        </div>

      </motion.div>
    </div>
  );
};

export default InteractiveCreditCard;
