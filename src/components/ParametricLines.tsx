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

    // SUPER-SAMPLING: Multiply dpr by 2 to force the browser to render at double resolution internally,
    // which completely eliminates pixelation and aliasing when CSS scales it back down.
    const dpr = Math.max(window.devicePixelRatio || 1, 2) * 2;
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
    // Lower opacity with thicker lines prevents aliasing and creates buttery smooth blends
    gradient.addColorStop(0, `rgba(${colorStart.r}, ${colorStart.g}, ${colorStart.b}, 0.15)`);
    gradient.addColorStop(1, `rgba(${colorEnd.r}, ${colorEnd.g}, ${colorEnd.b}, 0.15)`);
    
    ctx.strokeStyle = gradient;
    // Thicker lines anti-alias much better than sub-pixel lines
    ctx.lineWidth = 1.5; 
    
    // Screen blending provides a smooth, glowing overlay without the harsh edge artifacts of 'lighter'
    ctx.globalCompositeOperation = 'screen';

    // Draw the parametric wireframe mesh
    const numLines = 60; 
    
    for (let i = 0; i < numLines; i++) {
      const t = i / numLines; // 0 to 1
      
      ctx.beginPath();
      
      // Start on the left, bundled tightly
      const startX = -50; 
      const startY = height * 0.65 + (t - 0.5) * (height * 0.2); 
      
      // Control point 1: Pulls right and DOWN into the tight pinch.
      const cp1X = width * 0.4;
      const cp1Y = height * 0.85 - (t - 0.5) * (height * 0.15); 
      
      // Control point 2: Smoothed out to prevent the harsh "hump" at the top
      const cp2X = width * 0.7;
      const cp2Y = height * 0.5 - (t - 0.5) * (height * 1.2); 
      
      // End point: Far right, sweeping dramatically upwards
      const endX = width + 50;
      const endY = height * 0.1 - (t - 0.5) * (height * 2.2); 
      
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
