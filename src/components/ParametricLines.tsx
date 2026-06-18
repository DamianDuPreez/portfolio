import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

// Helper to convert hex to RGB for the gradient interpolation
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

const ParametricLines: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { palette } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays for perfectly sharp, non-pixelated lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create the sweeping horizontal gradient (Primary -> Secondary)
    const colorStart = hexToRgb(palette.primary);
    const colorEnd = hexToRgb(palette.secondary);
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    // 0.2 opacity gives a massive glowing effect when hundreds of lines overlap
    gradient.addColorStop(0, `rgba(${colorStart.r}, ${colorStart.g}, ${colorStart.b}, 0.25)`);
    gradient.addColorStop(1, `rgba(${colorEnd.r}, ${colorEnd.g}, ${colorEnd.b}, 0.25)`);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.2; // Hair-thin lines
    
    // Use screen blend mode for a luminous, additive glowing effect
    ctx.globalCompositeOperation = 'screen';

    // Draw the parametric wireframe mesh
    const numLines = 180; // Dense line count matching the reference image
    
    for (let i = 0; i < numLines; i++) {
      const t = i / numLines; // 0 to 1
      
      ctx.beginPath();
      
      // Start on the left, slightly below center
      const startX = -50; 
      // Spread vertically
      const startY = height * 0.7 + (t - 0.5) * 80; 
      
      // Control point 1: Pulls right and DOWN into the tight pinch.
      // We invert `t` here (minus sign) to force the top lines to cross over the bottom lines.
      const cp1X = width * 0.4;
      const cp1Y = height * 0.95 - (t - 0.5) * 120; 
      
      // Control point 2: Pushes the curve up towards the massive top-right sweep
      const cp2X = width * 0.65;
      const cp2Y = height * 0.3 - (t - 0.5) * 400; 
      
      // End point: Far right, sweeping dramatically upwards and spreading out massively
      const endX = width + 50;
      const endY = height * 0.1 - (t - 0.5) * 700; 
      
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      
      ctx.stroke();
    }
  }, [palette.primary, palette.secondary]); // Re-draw perfectly when theme changes

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full block ${className}`}
    />
  );
};

export default ParametricLines;
