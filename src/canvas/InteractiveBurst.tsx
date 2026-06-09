import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  isDark: boolean;
}

const InteractiveBurst: React.FC<Props> = ({ isDark }) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const particleCount = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 6); // 2 points per line, 3 coords per point
    for (let i = 0; i < particleCount; i++) {
      // Start point (origin at bottom)
      pos[i * 6] = 0;
      pos[i * 6 + 1] = -2;
      pos[i * 6 + 2] = 0;

      // End point (spread out)
      const r = 2 + Math.random() * 2;
      const theta = (Math.random() - 0.5) * Math.PI; // -pi/2 to pi/2
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 6 + 3] = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 6 + 4] = -2 + r * Math.cos(theta);
      pos[i * 6 + 5] = r * Math.sin(theta) * Math.sin(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.getElapsedTime();
    linesRef.current.rotation.y = Math.sin(time * 0.2) * 0.5;
    
    // Interactive tilt
    const targetX = (state.pointer.x * Math.PI) / 8;
    const targetY = (state.pointer.y * Math.PI) / 8;
    linesRef.current.rotation.z += (targetX - linesRef.current.rotation.z) * 0.1;
    linesRef.current.rotation.x += (targetY - linesRef.current.rotation.x) * 0.1;
  });

  return (
    <group>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={isDark ? "#6366f1" : "#00d2ff"}
          transparent
          opacity={0.4}
        />
      </lineSegments>
    </group>
  );
};

export default InteractiveBurst;
