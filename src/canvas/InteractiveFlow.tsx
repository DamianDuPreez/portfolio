import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  isDark: boolean;
}

const InteractiveFlow: React.FC<Props> = ({ isDark }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 800;

  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const initPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Butterfly shape
      const t = Math.random() * Math.PI * 2;
      const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t / 12), 5);
      
      const scale = 0.5 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(t) * scale;
      pos[i * 3 + 1] = r * Math.cos(t) * scale;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;

      initPos[i * 3] = pos[i * 3];
      initPos[i * 3 + 1] = pos[i * 3 + 1];
      initPos[i * 3 + 2] = pos[i * 3 + 2];
    }
    return [pos, initPos];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      // Flowing effect
      pos[i * 3 + 2] = initialPositions[i * 3 + 2] + Math.sin(time + initialPositions[i * 3]) * 0.5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Interactive tilt
    const targetY = (state.pointer.x * Math.PI) / 8;
    const targetX = (state.pointer.y * Math.PI) / 8;
    pointsRef.current.rotation.y += (targetY - pointsRef.current.rotation.y) * 0.05;
    pointsRef.current.rotation.x += (targetX - pointsRef.current.rotation.x) * 0.05;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={isDark ? "#8b5cf6" : "#0ea5e9"}
          transparent
          opacity={0.6}
        />
      </points>
    </group>
  );
};

export default InteractiveFlow;
