import React, { useRef, useEffect } from 'react';

const PastelPencilBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      // 1. Draw base gradient (Warm Sunrise/Sunset pastel tones)
      const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
      baseGrad.addColorStop(0, '#c084fc');     // Soft purple/violet
      baseGrad.addColorStop(0.3, '#f472b6');   // Soft pink
      baseGrad.addColorStop(0.65, '#ff9036');  // Peach orange
      baseGrad.addColorStop(1, '#ffc72c');     // Pastel yellow
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw pencil/pastel streaks
      const numLines = Math.floor((width * height) / 45);
      const angle = -Math.PI / 4.5;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const getStreakColor = (xPercent: number) => {
        const rand = Math.random();
        if (xPercent < 0.25) {
          if (rand < 0.6) return '168, 85, 247'; // violet
          if (rand < 0.8) return '236, 72, 153'; // pink
          return '139, 92, 246'; // deep purple
        } else if (xPercent < 0.5) {
          if (rand < 0.5) return '244, 63, 94';  // rose/pink
          if (rand < 0.8) return '168, 85, 247'; // purple
          return '249, 115, 22'; // orange
        } else if (xPercent < 0.75) {
          if (rand < 0.5) return '249, 115, 22'; // orange
          if (rand < 0.8) return '244, 63, 94';  // pink
          return '234, 179, 8';  // yellow
        } else {
          if (rand < 0.5) return '234, 179, 8';  // yellow
          if (rand < 0.85) return '249, 115, 22'; // orange
          return '251, 191, 36'; // amber/peach
        }
      };

      for (let i = 0; i < numLines; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 12 + Math.random() * 25;
        const thickness = 0.5 + Math.random() * 1.5;
        
        const xPercent = x / width;
        const color = getStreakColor(xPercent);
        const opacity = 0.04 + Math.random() * 0.08;

        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length * cosA, y + length * sinA);
        ctx.stroke();
      }

      // 3. Add paper grain noise pattern
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 128;
      noiseCanvas.height = 128;
      const noiseCtx = noiseCanvas.getContext('2d')!;
      const noiseData = noiseCtx.createImageData(128, 128);
      for (let i = 0; i < noiseData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        noiseData.data[i] = val;
        noiseData.data[i+1] = val;
        noiseData.data[i+2] = val;
        noiseData.data[i+3] = 16;
      }
      noiseCtx.putImageData(noiseData, 0, 0);

      const pattern = ctx.createPattern(noiseCanvas, 'repeat');
      if (pattern) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(container);
    render();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full pointer-events-none select-none"
      />
    </div>
  );
};

export default PastelPencilBackground;
