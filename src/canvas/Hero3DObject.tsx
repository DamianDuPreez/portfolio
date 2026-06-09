import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const WavyLinesRibbon: React.FC = () => {
  const { palette } = useTheme();
  // Reduced line count to space the lines a bit further from each other
  const lineCount = 250; 
  
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Premium gradient colors tailored for light and dark modes
  const currentColorStartRef = useRef(new THREE.Color(palette.primary));
  const currentColorEndRef = useRef(new THREE.Color(palette.secondary));
  
  const baseColorsRef = useRef(new Float32Array(lineCount * 3));

  // Define the sweeping 3D path
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < lineCount; i++) {
      const t = i / (lineCount - 1);
      
      const z = -t * 28 + 0; 
      const x = Math.sin(t * Math.PI * 3) * 11 + t * 3 - 1.5;
      const y = t * 10 - 3;
      
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [lineCount]);

  // Geometry for the trailing vertical lines
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(lineCount * 2 * 3);
    const colors = new Float32Array(lineCount * 2 * 3);
    const alphas = new Float32Array(lineCount * 2);
    
    points.forEach((p, i) => {
      const t = i / (lineCount - 1);
      
      let fade = 1.0;
      if (t < 0.15) fade = t / 0.15;
      if (t > 0.85) fade = (1 - t) / 0.15;
      
      // --- Top Point ---
      positions[i * 6] = p.x;
      positions[i * 6 + 1] = p.y;
      positions[i * 6 + 2] = p.z;
      
      // --- Bottom Point ---
      const dropLength = 16;
      positions[i * 6 + 3] = p.x;
      positions[i * 6 + 4] = p.y - dropLength;
      positions[i * 6 + 5] = p.z;
      
      // Initialize colors
      colors[i * 6] = 1.0;
      colors[i * 6 + 1] = 1.0;
      colors[i * 6 + 2] = 1.0;
      
      colors[i * 6 + 3] = 1.0;
      colors[i * 6 + 4] = 1.0;
      colors[i * 6 + 5] = 1.0;
      
      alphas[i * 2] = fade * 0.8; 
      alphas[i * 2 + 1] = 0.0; 
    });
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, [points]);

  const dotColors = useMemo(() => new Float32Array(lineCount * 3).fill(1.0), [lineCount]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        attribute float alpha;
        attribute vec3 color;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vAlpha = alpha;
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, vAlpha * 0.5); 
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Lerp colors over time for smooth transitions
    const targetStart = new THREE.Color(palette.primary);
    const targetEnd = new THREE.Color(palette.secondary);
    currentColorStartRef.current.lerp(targetStart, delta * 1.5);
    currentColorEndRef.current.lerp(targetEnd, delta * 1.5);
    
    // Update baseColors array
    const tempColor = new THREE.Color();
    for (let i = 0; i < lineCount; i++) {
      const t = i / (lineCount - 1);
      tempColor.lerpColors(currentColorStartRef.current, currentColorEndRef.current, t);
      baseColorsRef.current[i * 3] = tempColor.r;
      baseColorsRef.current[i * 3 + 1] = tempColor.g;
      baseColorsRef.current[i * 3 + 2] = tempColor.b;
    }
    
    // Slowed down even further so each dot's sequential animation is highly visible
    const travelTime = 12.0; 
    const waitTime = 2.0;   
    const cycleDuration = travelTime + waitTime;
    
    const pulseCycle = time % cycleDuration;
    const pulseCenter = pulseCycle / travelTime; 
    
    // 1. Visual Energy Wave (Wide, for the darkening effect)
    const visualWaveWidth = 24; 
    const pulseCenterIndex = pulseCenter * (lineCount + visualWaveWidth * 2) - visualWaveWidth;

    // 2. Physical Displacement Wave (Very narrow, so dots animate sequentially)
    const physicalWaveWidth = 4;

    if (dotsRef.current && linesRef.current) {
      const linePositions = linesRef.current.geometry.attributes.position.array as Float32Array;
      const lineColorsArray = linesRef.current.geometry.attributes.color.array as Float32Array;
      const dotColorsArray = dotsRef.current.geometry.attributes.color.array as Float32Array;

      points.forEach((p, i) => {
        const t = i / (lineCount - 1);
        
        // Base Ambient Wave
        const baseWave = Math.sin(time * 0.6 + t * Math.PI * 4) * 0.3;
        
        // --- Calculate Physical Y Displacement ---
        let pulseY = 0;
        let physicalAmount = 0;
        const physicalDist = i - pulseCenterIndex; // signed distance for continuous wave
        
        // Create a smooth continuous wave that goes UP then DOWN naturally
        if (Math.abs(physicalDist) < physicalWaveWidth) {
           // Base wave shape: goes from 0 -> up -> 0 -> down -> 0
           const waveShape = Math.sin((physicalDist / physicalWaveWidth) * Math.PI);
           
           // Smooth envelope: fades the physical wave out gradually over the first 25 lines
           // to prevent tearing or abrupt stops, keeping the "current property" of only moving the start
           let envelope = 1.0;
           if (i > 10) {
               envelope = Math.max(0, 1.0 - ((i - 10) / 15)); // Fades out completely by line 25
           }
           
           physicalAmount = Math.abs(waveShape) * envelope;
           pulseY = waveShape * 0.8 * envelope; // Scale the height of the wave
        }
        
        const finalY = p.y + baseWave + pulseY;
        
        // --- Update Positions ---
        // Dots
        let scale = 1.0;
        if (t < 0.15) scale = t / 0.15; 
        if (t > 0.85) scale = (1 - t) / 0.15; 
        
        // Make the dots that physically move slightly larger during their sequential pulse
        const scaleBoost = (i <= 16) ? (physicalAmount * 0.2) : 0;
        const finalScale = scale * (1.0 + scaleBoost);

        dummy.position.set(p.x, finalY, p.z);
        dummy.scale.setScalar(finalScale);
        dummy.updateMatrix();
        dotsRef.current!.setMatrixAt(i, dummy.matrix);
        
        // Lines
        linePositions[i * 6 + 1] = finalY;
        linePositions[i * 6 + 4] = finalY - 16; 

        // --- Calculate Visual Darkening (Chain Reaction) ---
        let visualAmount = 0;
        const visualDist = Math.abs(i - pulseCenterIndex);
        if (visualDist < visualWaveWidth) {
           visualAmount = Math.cos((visualDist / visualWaveWidth) * (Math.PI / 2)); 
        }

        const r = baseColorsRef.current[i * 3];
        const g = baseColorsRef.current[i * 3 + 1];
        const b = baseColorsRef.current[i * 3 + 2];
        
        const darkenFactor = 1.0 - (visualAmount * 0.75); 
        
        const cR = r * darkenFactor;
        const cG = g * darkenFactor;
        const cB = b * darkenFactor;
        
        dotColorsArray[i * 3] = cR;
        dotColorsArray[i * 3 + 1] = cG;
        dotColorsArray[i * 3 + 2] = cB;
        
        lineColorsArray[i * 6] = cR;
        lineColorsArray[i * 6 + 1] = cG;
        lineColorsArray[i * 6 + 2] = cB;
        
        lineColorsArray[i * 6 + 3] = cR;
        lineColorsArray[i * 6 + 4] = cG;
        lineColorsArray[i * 6 + 5] = cB;
      });

      // Mark buffers for update in WebGL
      dotsRef.current.instanceMatrix.needsUpdate = true;
      dotsRef.current.geometry.attributes.color.needsUpdate = true;
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    // Scaled up by 1.15 to make it bigger overall
    <group position={[0, -0.5, 0]} scale={1.15}>
      {/* Trailing vertical lines */}
      <lineSegments ref={linesRef} geometry={lineGeo} material={shaderMaterial} />
      
      {/* Top dots */}
      <instancedMesh ref={dotsRef} args={[undefined, undefined, lineCount]}>
        <sphereGeometry args={[0.045, 16, 16]}>
          <instancedBufferAttribute attach="attributes-color" args={[dotColors, 3]} />
        </sphereGeometry>
        <meshBasicMaterial vertexColors={true} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
};

const Hero3DObject: React.FC = () => {
  const { palette } = useTheme();
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 12], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={palette.ambientIntensity} />
          <WavyLinesRibbon />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3DObject;
