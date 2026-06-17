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

            {/* Metallic EMV Chip (Silver) */}
            <div className="w-12 h-10 rounded-md overflow-hidden bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 shadow-inner flex flex-col justify-evenly p-[1px] opacity-95 relative">
               <div className="absolute inset-0 border border-black/10 rounded-md"></div>
               {/* Chip lines */}
               <div className="w-full h-[1px] bg-black/10"></div>
               <div className="w-full h-[1px] bg-black/10"></div>
               <div className="w-full flex justify-between h-[1px]">
                 <div className="w-1/3 h-full bg-black/10"></div>
                 <div className="w-1/3 h-full bg-black/10"></div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: VISA Logo */}
        <div className="relative z-20 flex justify-end items-end w-full mb-2">
          <svg viewBox="0 0 320 104" width="70" className="fill-white drop-shadow-md opacity-90">
            <path d="M125.79 0l-19.16 99.88h30.63L156.4 0h-30.61zm83.35 0c-6.84 0-17.7 1.83-26.68 6.44l-4.75 22.84c8.47-3.95 19.17-6.03 29.56-6.03 10.23 0 13.55 3.1 13.55 8.1 0 11.23-41.97 9.87-41.97 34.52 0 12.3 10.5 21.05 31.7 21.05 10.2 0 19.34-2.14 26.64-5.6l4.98-23.77c-6.28 2.87-16.14 5.3-25.7 5.3-9.52 0-14.44-2.78-14.44-7.8 0-10.87 41.96-10.4 41.96-34.8C244 5.8 230.14 0 209.14 0zM302.58 0h-24.1c-5.8 0-10.3 2.76-12.82 8.08l-36.27 83.5 32.14-8.3 5.4-15.35h39.3l3.77 18.06h29.5L302.58 0zm-18.78 43.14l9.46-25.96 5.44 26.68-14.9-.72zM94.66 0L67.14 68.3 64 53.64C61.4 43.9 52 35.8 38 31.05L65.4 99.88h32.1l48.24-99.88H114.2l-19.54 0zM0 0v16.12c14.28 0 24 3.96 31 10.2l15.54 73.56H78.1L62 0H0z" />
          </svg>
        </div>

      </motion.div>
    </div>
  );
};

export default InteractiveCreditCard;
