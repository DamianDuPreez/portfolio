import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useTheme } from '../context/ThemeContext';

// Layered Sine FBM (Fractal Brownian Motion) to perfectly simulate high-quality Perlin/Simplex Noise
const fbm = (x: number, y: number, z: number) => {
  let total = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  for(let i=0; i<3; i++) {
    // Offset phase for organic swirling
    total += Math.sin(x * frequency + z) * Math.cos(y * frequency - z * 0.5) * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return total;
};

const PerlinFlowField: React.FC = () => {
  const { palette } = useTheme();
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  
  const currentColorLowRef = useRef(new THREE.Color(palette.primary));
  const currentColorHighRef = useRef(new THREE.Color(palette.secondary));
  
  // Keep the exact same massive scale as the original lines
  const width = 120;
  const height = 18; 
  
  // Solid sheets need much less geometry than lines for flawless curves
  const segmentsX = 200;
  const segmentsY = 60; 

  // Initialize the RGB color attribute once the geometry is created
  useEffect(() => {
    if (geomRef.current) {
      const count = geomRef.current.attributes.position.count;
      const colors = new Float32Array(count * 3); // 3 floats per vertex (R, G, B)
      geomRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, []);

  useFrame((state, delta) => {
    if (!geomRef.current || !geomRef.current.attributes.color) return;
    const time = state.clock.getElapsedTime() * 0.4; // Gentle flowing speed
    const pos = geomRef.current.attributes.position.array as Float32Array;
    const col = geomRef.current.attributes.color.array as Float32Array;
    
    // Theme-driven dynamic colors synced perfectly with the portfolio's themes
    const targetLow = new THREE.Color(palette.primary);
    const targetHigh = new THREE.Color(palette.secondary);
    
    // Smooth transition over ~2 seconds
    currentColorLowRef.current.lerp(targetLow, delta * 1.5);
    currentColorHighRef.current.lerp(targetHigh, delta * 1.5);
    
    const tempColor = new THREE.Color();

    for (let i = 0; i < pos.length / 3; i++) {
      const px = pos[i * 3];
      const py = pos[i * 3 + 1];
      
      // Original complex Perlin noise flow
      const pz = fbm(px * 0.1, py * 0.1, time) * 1.5;
      pos[i * 3 + 2] = pz;

      // Calculate vertex color exactly as the lines did
      const normalizedHeight = Math.max(0, Math.min(1, (pz + 1.0) / 2.0));
      tempColor.lerpColors(currentColorLowRef.current, currentColorHighRef.current, normalizedHeight);
      tempColor.toArray(col, i * 3);
    }
    
    // Flag arrays for GPU upload
    geomRef.current.attributes.position.needsUpdate = true;
    geomRef.current.attributes.color.needsUpdate = true;
  });

  return (
    // Tilted landscape perspective, exactly like the original lines
    <group rotation={[-Math.PI / 2.5, 0, -Math.PI / 6]} position={[0, -1, -5]}>
      <mesh>
        <planeGeometry ref={geomRef} args={[width, height, segmentsX, segmentsY]} />
        {/* Using MeshBasicMaterial to keep the flat, unlit color style from the lines */}
        <meshBasicMaterial 
          vertexColors={true}
          transparent={true}
          opacity={palette.isDark ? 0.9 : 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default PerlinFlowField;
