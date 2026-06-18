import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const getWaveColor = (z: number, timeOfDay: string): string => {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  let backHex = '#3f37c9';
  let middleHex = '#f72585';
  let frontHex = '#ff7300';

  switch (timeOfDay) {
    case 'sunrise':
      backHex = '#be123c';   // Deep rich crimson
      middleHex = '#ff5a00'; // High-saturation flame orange
      frontHex = '#ffc000';  // Glowing gold yellow
      break;
    case 'daytime':
      backHex = '#1e3a8a';   // Deep cobalt blue
      middleHex = '#0066cc'; // Saturated royal blue
      frontHex = '#00f0ff';  // Vibrant neon cyan
      break;
    case 'sunset':
      backHex = '#4a0072';   // Deep midnight violet
      middleHex = '#f72585'; // Intense neon pink
      frontHex = '#ff7300';  // Vibrant orange
      break;
    case 'dusk':
      backHex = '#2c004d';   // Rich dark violet
      middleHex = '#8b5cf6'; // Electric violet
      frontHex = '#ff00ff';  // Glowing neon magenta
      break;
    case 'night':
      backHex = '#080b1e';   // Saturated space black/indigo
      middleHex = '#4f46e5'; // Electric indigo
      frontHex = '#00f5d4';  // Radiant neon teal/turquoise
      break;
    case 'pre-dawn':
      backHex = '#311042';   // Deep plum/wine
      middleHex = '#a21caf'; // Saturated magenta/purple
      frontHex = '#ff7a8a';  // Vibrant coral/gold pink
      break;
  }

  const back = hexToRgb(backHex);
  const middle = hexToRgb(middleHex);
  const front = hexToRgb(frontHex);

  let r, g, b;
  if (z > 0.5) {
    const t = (z - 0.5) * 2.0;
    r = Math.round(middle.r + (back.r - middle.r) * t);
    g = Math.round(middle.g + (back.g - middle.g) * t);
    b = Math.round(middle.b + (back.b - middle.b) * t);
  } else {
    const t = z * 2.0;
    r = Math.round(front.r + (middle.r - front.r) * t);
    g = Math.round(front.g + (middle.g - front.g) * t);
    b = Math.round(front.b + (middle.b - front.b) * t);
  }

  return `${r}, ${g}, ${b}`;
};

const InteractiveCreditCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { activeTimeOfDay } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse position values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the movement with springs
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 25, mass: 1 });
  const mouseYSpring = useSpring(y, { stiffness: 60, damping: 25, mass: 1 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Canvas 3D Ocean Wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const numSlices = 36;
    let width = canvas.clientWidth || 340;
    let height = canvas.clientHeight || 215;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rectWidth = entry.contentRect.width;
        const rectHeight = entry.contentRect.height;
        if (rectWidth === 0 || rectHeight === 0) continue;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rectWidth * dpr;
        canvas.height = rectHeight * dpr;
        ctx.scale(dpr, dpr);
        
        width = rectWidth;
        height = rectHeight;
      }
    });

    resizeObserver.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.003; // Even slower, smoother ocean swell speed

      // Camera tilt configurations for 3D projection
      const cosTilt = Math.cos(0.35); 
      const sinTilt = Math.sin(0.35);
      const perspective = 220; 
      
      const yCenter = height * 0.5;

      // Draw slices from back (z = 1.0) to front (z = 0.0) to preserve 3D layering
      for (let j = numSlices - 1; j >= 0; j--) {
        const z = j / (numSlices - 1); // Depth coordinate
        
        // Dual-color gradient calculation: interpolate color across the slice itself
        // rgbLeft shifts towards the frontmost color (z=0), rgbRight shifts towards the backmost color (z=1)
        const rgbLeft = getWaveColor(z * 0.65, activeTimeOfDay);
        const rgbRight = getWaveColor(Math.min(1.0, z * 1.35), activeTimeOfDay);

        ctx.beginPath();
        
        // Draw the vertical wavy boundary, extending past the top and bottom of the card to hide any corners
        const yStart = -35;
        const yEnd = height + 45;
        
        // Start shape above the top-left edge
        ctx.moveTo(0, yStart - 25);

        let maxScreenX = 0;

        for (let yPos = yStart; yPos <= yEnd; yPos += 3) {
          const yn = yPos / height;
          
          // Responsive diagonal boundary: 70% width at top (yn=0), 50% width at bottom (yn=1)
          const boundaryX = width * (0.70 - yn * 0.20);
          
          // baseline X position scales with the boundary at this Y
          const baseX = (0.15 + z * 0.85) * boundaryX;
          
          // Phase offsets to make slices ripple independently
          const phaseOffset = z * Math.PI * 2.2;
          
          // Ocean wave mathematics (increased amplitude for a more visible organic swell)
          const wave1 = Math.sin(yn * 4.8 - time * 1.5 + phaseOffset) * 18.0;
          const wave2 = Math.cos(yn * 9.0 + time * 2.2 - phaseOffset * 0.5) * 6.0;
          const individual = Math.sin(time * 1.0 + z * 10.0) * 4.0;
          
          const displacement = wave1 + wave2 + individual;

          // 3D coordinates
          const x3d = baseX + displacement;
          const y3d = yPos - yCenter;
          const z3d = (z - 0.5) * 80; // Depth spread

          // 3D Perspective Projection
          const yProj = y3d * cosTilt - z3d * sinTilt;
          const zProj = y3d * sinTilt + z3d * cosTilt;
          const scale = perspective / (perspective + zProj);

          const screenX = x3d * scale;
          const screenY = yCenter + yProj * scale;

          ctx.lineTo(screenX, screenY);
          
          if (screenX > maxScreenX) {
            maxScreenX = screenX;
          }
        }

        // Close the path far below the bottom-left corner and loop back to top-left to avoid visible edges
        ctx.lineTo(0, yEnd + 25);
        ctx.lineTo(0, yStart - 25);
        ctx.closePath();

        // Create linear gradient from left edge (x=0) to rightmost boundary of this slice (maxScreenX)
        const grad = ctx.createLinearGradient(0, 0, Math.max(10, maxScreenX), 0);
        
        // Solid opacity range (0.55 to 0.9) to make the object look solid, not faint
        const baseOpacity = 0.55 + (1.0 - z) * 0.35;
        
        grad.addColorStop(0, `rgba(${rgbLeft}, ${baseOpacity})`);
        grad.addColorStop(0.85, `rgba(${rgbRight}, ${baseOpacity * 0.95})`); // Shift color and keep opacity solid
        grad.addColorStop(1, `rgba(${rgbRight}, 0.0)`); // Swift, clean transition to transparent at the very edge

        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [activeTimeOfDay]);

  return (
    <div 
      className={`relative flex items-center justify-center w-full h-full perspective-[1000px] overflow-visible bg-transparent ${className}`}
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
        className="relative w-[340px] h-[215px] sm:w-[400px] sm:h-[250px] rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden cursor-default bg-white shrink-0"
      >
        {/* HTML5 Canvas for the 3D Ocean Wave lines */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full z-0 pointer-events-none" 
        />

        {/* Subtle noise/texture overlay for realism */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay z-10 pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />

        {/* Top Section: Chip & Contactless */}
        <div className="relative z-20 flex justify-between items-center mt-6 ml-4">
          <div className="flex items-center gap-3">
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

            {/* Inline SVG Contactless Wave Symbol */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-6 w-6 text-slate-700 opacity-90 shrink-0">
              <path d="M5 8.5c.83 1.17.83 2.83 0 4M8 6c1.66 2.17 1.66 5.83 0 8M11 3.5c2.5 3.17 2.5 8.83 0 12" />
            </svg>
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
