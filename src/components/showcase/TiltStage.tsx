import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltStageProps {
  children: React.ReactNode;
  disabled?: boolean;
  maxTilt?: number;
  className?: string;
}

// Shared 3D mouse-tilt wrapper for the project showcase objects (same feel as the credit card)
const TiltStage: React.FC<TiltStageProps> = ({ children, disabled = false, maxTilt = 10, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (disabled) {
      x.set(0);
      y.set(0);
    }
  }, [disabled, x, y]);

  const springX = useSpring(x, { stiffness: 60, damping: 25, mass: 1 });
  const springY = useSpring(y, { stiffness: 60, damping: 25, mass: 1 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full perspective-[1000px] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative shrink-0">
        {children}
      </motion.div>
    </div>
  );
};

export default TiltStage;
