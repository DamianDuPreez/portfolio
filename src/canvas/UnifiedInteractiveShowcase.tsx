import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

interface Props { 
  activeCard: number | null;
  isHovered: boolean;
  isPaused: boolean;
}

const maxCount = 400;

const UnifiedInteractiveShowcase: React.FC<Props> = ({ activeCard, isHovered, isPaused }) => {
  const { palette } = useTheme();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const validActiveCard = activeCard !== null ? activeCard : 0;
  const targetCardRef = useRef(validActiveCard);
  const currentCardRef = useRef(validActiveCard);
  
  // Start in collapse so it does an intro animation if mounted directly
  const transitionPhaseRef = useRef<'idle' | 'collapse' | 'pause' | 'expand'>('collapse');
  const transitionStartTimeRef = useRef(0);
  const globalRotRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (validActiveCard !== targetCardRef.current) {
      targetCardRef.current = validActiveCard;
      // Force a transition restart no matter what state we are in!
      transitionPhaseRef.current = 'collapse';
      transitionStartTimeRef.current = 0; 
    }
  }, [validActiveCard]);

  const shapes = useMemo(() => {
    const sphere = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < maxCount; i++) {
      const y = 1 - (i / (maxCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      sphere.push({
        base: new THREE.Vector3(Math.cos(theta) * radius * 2.4, y * 2.4, Math.sin(theta) * radius * 2.4),
        speed: 0, offset: 0, active: true
      });
    }

    const helix = [];
    for (let i = 0; i < maxCount; i++) {
      if (i < 300) {
        const t = (i % 150) / 150;
        const angle = t * Math.PI * 2 * 2.5;
        const y = (t - 0.5) * 8;
        const radius = 1.5;
        const strand = i < 150 ? 0 : Math.PI;
        helix.push({
          base: new THREE.Vector3(Math.cos(angle + strand) * radius, y, Math.sin(angle + strand) * radius),
          speed: 0, offset: 0, active: true
        });
      } else {
        helix.push({ base: new THREE.Vector3(0,0,0), speed: 0, offset: 0, active: false });
      }
    }

    const cloud = [];
    for (let i = 0; i < maxCount; i++) {
      if (i < 300) {
        cloud.push({
          base: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6),
          speed: 0.025 + Math.random() * 0.06,
          offset: Math.random() * Math.PI * 2,
          active: true
        });
      } else {
        cloud.push({ base: new THREE.Vector3(0,0,0), speed: 0, offset: 0, active: false });
      }
    }

    const grid = [];
    const gridSize = 15;
    const spacing = 0.3;
    for (let i = 0; i < maxCount; i++) {
      if (i < 225) {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);
        grid.push({
          base: new THREE.Vector3((x - gridSize / 2) * spacing, (y - gridSize / 2) * spacing, -1.0),
          speed: 0, offset: 0, active: true
        });
      } else {
        grid.push({ base: new THREE.Vector3(0,0,0), speed: 0, offset: 0, active: false });
      }
    }

    return [sphere, helix, cloud, grid];
  }, []);

  const centerNoise = useMemo(() => {
    return Array(maxCount).fill(0).map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5
    ));
  }, []);

  // Initialize current positions to the target shape's base so it can collapse from there on mount
  const currentPositions = useMemo(() => {
    return shapes[validActiveCard].map(p => p.base.clone());
  }, [shapes, validActiveCard]);

  const currentScales = useMemo(() => Array(maxCount).fill(0), []);

  const prevTimeRef = useRef(0);
  const internalTimeRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Custom time accumulator to support the Pause functionality without breaking WebGL clock sync
    const clockTime = state.clock.getElapsedTime();
    if (prevTimeRef.current === 0 && clockTime > 0) prevTimeRef.current = clockTime;
    const dt = clockTime - prevTimeRef.current;
    prevTimeRef.current = clockTime;
    
    if (!isPaused) {
      internalTimeRef.current += dt;
    }
    
    const time = internalTimeRef.current;
    
    if (transitionPhaseRef.current === 'collapse' && transitionStartTimeRef.current === 0) {
      transitionStartTimeRef.current = time;
    }

    let phase = transitionPhaseRef.current;
    let t = time - transitionStartTimeRef.current;

    if (phase === 'collapse') {
      if (t > 0.2) { // 0.2 seconds to zip to the center instantly
        transitionPhaseRef.current = 'pause';
        transitionStartTimeRef.current = time;
        phase = 'pause';
        t = 0;
        currentCardRef.current = targetCardRef.current;
      }
    } else if (phase === 'pause') {
      if (t > 1.0) { // 1 second pause
        transitionPhaseRef.current = 'expand';
        transitionStartTimeRef.current = time;
        phase = 'expand';
        t = 0;
      }
    } else if (phase === 'expand') {
      if (t > 2.0) {
        transitionPhaseRef.current = 'idle';
        phase = 'idle';
      }
    }

    const activeShapeData = shapes[currentCardRef.current];
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(state.pointer, state.camera);

    let helixClosestDepth = Infinity;
    if (phase === 'idle' && currentCardRef.current === 1) {
      for (let i = 0; i < maxCount; i++) {
        if (!activeShapeData[i].active) continue;
        const target = activeShapeData[i].base.clone();
        const wave = Math.sin(time * 1.5 + target.y * 2) * 0.2;
        target.x += Math.cos(target.y) * wave;
        target.z += Math.sin(target.y) * wave;
        
        const worldTarget = target.applyMatrix4(meshRef.current.matrixWorld);
        if (raycaster.ray.distanceToPoint(worldTarget) < 0.5) {
          const depth = state.camera.position.distanceTo(worldTarget);
          if (depth < helixClosestDepth) helixClosestDepth = depth;
        }
      }
    }

    for (let i = 0; i < maxCount; i++) {
      const p = activeShapeData[i];
      let finalTarget = new THREE.Vector3(0,0,0);
      
      if (p.active) {
        finalTarget.copy(p.base);
        if (currentCardRef.current === 0) {
          const localExpand = 1 + Math.sin(time * 0.125 + finalTarget.y) * 0.05;
          finalTarget.multiplyScalar(localExpand);
        } else if (currentCardRef.current === 1) {
          const wave = Math.sin(time * 1.5 + finalTarget.y * 2) * 0.2;
          finalTarget.x += Math.cos(finalTarget.y) * wave;
          finalTarget.z += Math.sin(finalTarget.y) * wave;
        } else if (currentCardRef.current === 2) {
          finalTarget.set(
            p.base.x + Math.sin(time * p.speed + p.offset) * 1.5,
            p.base.y + Math.cos(time * p.speed + p.offset) * 1.5,
            p.base.z + Math.sin(time * p.speed * 0.5 + p.offset) * 1.5
          );
        } else if (currentCardRef.current === 3) {
          const distToCenter = Math.sqrt(finalTarget.x * finalTarget.x + finalTarget.y * finalTarget.y);
          finalTarget.z = Math.sin(distToCenter * 2 - time * 2) * 0.2 - 1.0;
        }
      }

      // Calculate scale BEFORE finalTarget is overwritten by transition physics,
      // ensuring the cubes don't falsely calculate massive scales while in the center noise!
      let targetScale = p.active ? 0.8 : 0;
      
      if (currentCardRef.current === 2 && p.active) {
        targetScale = 0.8 + Math.sin(time * 0.25 + p.offset) * 0.4;
      } else if (currentCardRef.current === 3 && p.active) {
        targetScale = Math.max(0.1, 1 + finalTarget.z + 1.0);
      }

      if (phase === 'collapse') {
        const progress = Math.min(1, t / 0.2);
        const ease = progress * progress * progress;
        finalTarget.lerp(centerNoise[i], ease);
      } else if (phase === 'pause') {
        finalTarget.copy(centerNoise[i]);
      } else if (phase === 'expand') {
        const progress = Math.min(1, t / 2.0);
        const ease = 1 - Math.pow(1 - progress, 3);
        finalTarget = centerNoise[i].clone().lerp(finalTarget, ease);
      }

      if (phase === 'idle' && p.active && isHovered) {
        const worldTarget = finalTarget.clone().applyMatrix4(meshRef.current.matrixWorld);
        const distToRay = raycaster.ray.distanceToPoint(worldTarget);
        let shouldRepel = false;
        let repRadius = 0.5;

        if (currentCardRef.current === 0) {
          repRadius = 0.1;
          shouldRepel = distToRay < repRadius && worldTarget.z > 0;
        } else if (currentCardRef.current === 1) {
          repRadius = 0.15;
          shouldRepel = distToRay < repRadius && state.camera.position.distanceTo(worldTarget) <= helixClosestDepth + 1.0;
        } else if (currentCardRef.current === 2) {
          repRadius = 0.15;
          shouldRepel = distToRay < repRadius;
        } else if (currentCardRef.current === 3) {
          repRadius = 0.2;
          shouldRepel = distToRay < repRadius;
        }

        if (shouldRepel) {
          const closestPoint = raycaster.ray.closestPointToPoint(worldTarget, new THREE.Vector3());
          const closestLocal = meshRef.current.worldToLocal(closestPoint);
          const repelDir = finalTarget.clone().sub(closestLocal).normalize();
          const force = (repRadius - distToRay) * 5.0; // Higher force to compensate for tiny radius
          finalTarget.add(repelDir.multiplyScalar(force));
        }
      }

      currentPositions[i].lerp(finalTarget, 0.1);
      dummy.position.copy(currentPositions[i]);
      
      if (!p.active) targetScale = 0;
      if (phase === 'collapse' || phase === 'pause') {
        if (targetCardRef.current !== currentCardRef.current && !shapes[targetCardRef.current][i].active) {
            targetScale = 0;
        }
      }

      currentScales[i] = THREE.MathUtils.lerp(currentScales[i], targetScale, 0.1);
      dummy.scale.setScalar(currentScales[i]);

      if (p.active) {
        if (currentCardRef.current === 0) dummy.rotation.set(time * 0.03 + i, time * 0.03 + i, 0);
        else if (currentCardRef.current === 1) dummy.rotation.set(time * 0.5 + i, time * 0.5 + i, 0);
        else if (currentCardRef.current === 2) dummy.rotation.set(time * p.speed, time * p.speed, 0);
        else dummy.rotation.set(0, 0, 0);
      }
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    const targetRotation = new THREE.Euler(0, 0, 0);
    if (currentCardRef.current === 0) {
      if (!isPaused) {
        globalRotRef.current.x += 0.0001;
        globalRotRef.current.y += 0.0003;
      }
      targetRotation.set(globalRotRef.current.x, globalRotRef.current.y, 0);
    } else if (currentCardRef.current === 1) {
      targetRotation.set(0, time * 0.2, 0);
    } else if (currentCardRef.current === 2) {
      targetRotation.set(0, 0, 0);
    } else if (currentCardRef.current === 3) {
      targetRotation.set(-Math.PI / 6, 0, 0);
    }

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.x, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.y, 0.05);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.z, 0.05);
  });

  const brandColor = palette.primary;

  return (
    <group>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial 
          color={brandColor} 
          emissive={brandColor}
          emissiveIntensity={0.2}
          roughness={0.2} 
          metalness={0.3} 
        />
      </instancedMesh>
    </group>
  );
};

export default UnifiedInteractiveShowcase;
