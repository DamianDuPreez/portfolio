import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  isDark: boolean;
}

const InteractiveRibbon: React.FC<Props> = ({ isDark }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 1000;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 4;
      pos[i * 3] = t - Math.PI * 2; // x
      pos[i * 3 + 1] = Math.sin(t); // y
      pos[i * 3 + 2] = Math.cos(t) * 0.5; // z
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3];
      // Wave effect
      positions[i * 3 + 1] = Math.sin(x + time * 2) * Math.cos(time * 0.5) * 1.5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Interactive tilt
    const targetY = (state.pointer.x * Math.PI) / 4;
    const targetX = (state.pointer.y * Math.PI) / 4;
    pointsRef.current.rotation.y += (targetY - pointsRef.current.rotation.y) * 0.1;
    pointsRef.current.rotation.x += (targetX - pointsRef.current.rotation.x) * 0.1;
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
          size={0.05}
          color={isDark ? "#4f46e5" : "#3a7bd5"}
          transparent
          opacity={0.8}
        />
      </points>
    </group>
  );
};

export default InteractiveRibbon;
