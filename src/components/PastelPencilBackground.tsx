import React, { useRef, useEffect } from 'react';
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
      backHex = '#be123c';   // Crimson
      middleHex = '#ff5a00'; // Orange
      frontHex = '#ffc000';  // Gold
      break;
    case 'daytime':
      backHex = '#1e3a8a';   // Cobalt
      middleHex = '#0066cc'; // Royal blue
      frontHex = '#00f0ff';  // Cyan
      break;
    case 'sunset':
      backHex = '#4a0072';   // Midnight violet
      middleHex = '#f72585'; // Hot pink
      frontHex = '#ff7300';  // Orange
      break;
    case 'dusk':
      backHex = '#ffb703';   // Gold/yellow (right side)
      middleHex = '#f72585'; // Hot pink (middle)
      frontHex = '#7b2cbf';  // Purple/fuchsia (left side)
      break;
    case 'night':
      backHex = '#080b1e';   // Space black/indigo
      middleHex = '#4f46e5'; // Indigo
      frontHex = '#00f5d4';  // Teal/turquoise
      break;
    case 'pre-dawn':
      backHex = '#311042';   // Plum/wine
      middleHex = '#a21caf'; // Magenta
      frontHex = '#ff7a8a';  // Coral pink
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

const mixWithWhite = (rgbStr: string, amount: number): string => {
  const parts = rgbStr.split(',').map(x => parseInt(x.trim(), 10));
  const r = Math.round(parts[0] + (255 - parts[0]) * amount);
  const g = Math.round(parts[1] + (255 - parts[1]) * amount);
  const b = Math.round(parts[2] + (255 - parts[2]) * amount);
  return `${r}, ${g}, ${b}`;
};

const PastelPencilBackground: React.FC = () => {
  const { activeTimeOfDay } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed high-resolution size for a static, non-stretching background image
    const width = 2000;
    const height = 1200;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw base theme gradient
    const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
    const blendVal = 0.42;
    const c0 = mixWithWhite(getWaveColor(0.0, activeTimeOfDay), blendVal);
    const c1 = mixWithWhite(getWaveColor(0.35, activeTimeOfDay), blendVal);
    const c2 = mixWithWhite(getWaveColor(0.7, activeTimeOfDay), blendVal);
    const c3 = mixWithWhite(getWaveColor(1.0, activeTimeOfDay), blendVal);
    
    baseGrad.addColorStop(0, `rgb(${c0})`);
    baseGrad.addColorStop(0.3, `rgb(${c1})`);
    baseGrad.addColorStop(0.65, `rgb(${c2})`);
    baseGrad.addColorStop(1, `rgb(${c3})`);
    
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // Soften with a semi-transparent white wash to create a pastel look
    ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw pencil/pastel streaks matching the active theme (fixed amount)
    const numLines = 8000;
    const angle = -Math.PI / 4.5;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i < numLines; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 12 + Math.random() * 25;
      const thickness = 0.5 + Math.random() * 1.5;
      
      const xPercent = x / width;
      // Sample color slightly offset to mix color streaks (e.g. orange in yellow zone)
      const offsetPercent = Math.min(1.0, Math.max(0.0, xPercent + (Math.random() - 0.5) * 0.25));
      const color = mixWithWhite(getWaveColor(offsetPercent, activeTimeOfDay), blendVal);
      const opacity = 0.03 + Math.random() * 0.05;

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
  }, [activeTimeOfDay]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas 
        ref={canvasRef} 
        style={{ width: '2000px', height: '1200px' }}
        className="absolute left-0 top-0 pointer-events-none select-none max-w-none"
      />
    </div>
  );
};

export default PastelPencilBackground;
