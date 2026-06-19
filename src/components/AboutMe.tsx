import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface SkillColumnProps {
  title: string;
  description: string;
}

const SkillColumn: React.FC<SkillColumnProps> = ({ title, description }) => {
  const { palette } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);

  // Keep ref up to date to avoid rebuilding the effect loop when isHovered changes
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    handleResize();

    // Particle representation
    interface Particle {
      xRatio: number;      // horizontal position as fraction of width (-0.5 to 0.5)
      y: number;           // absolute y (for active particles)
      yFromBottom: number; // offset from bottom (for idle particles)
      vxRatio: number;     // horizontal drift velocity (for idle particles)
      vy: number;          // upward velocity (pixels per frame)
      size: number;
      opacity: number;
      maxOpacity: number;
      isIdle: boolean;
      depth: number;
      travelHeight: number;
    }

    let particles: Particle[] = [];

    // Initialize the dense baseline pool of particles at the bottom (350 particles)
    const numIdle = 350;
    for (let i = 0; i < numIdle; i++) {
      const depth = 0.15 + Math.random() * 0.85; // depth between 0.15 and 1.0
      const baseSize = 0.8 + Math.random() * 1.5;
      
      particles.push({
        xRatio: (Math.random() - 0.5) * 0.9, // slightly pulled in from absolute edges
        y: 0,
        yFromBottom: 1 + Math.random() * 5, // pushed towards absolute bottom (1 to 6 pixels)
        vxRatio: (Math.random() - 0.5) * 0.0002, // very slow horizontal drift ratio
        vy: (Math.random() - 0.5) * 0.01,        // extremely slow vertical drift
        size: baseSize * depth,
        opacity: (0.1 + Math.random() * 0.12) * depth,
        maxOpacity: 0.45 * depth, // slightly increased max opacity for denser belt glow
        isIdle: true,
        depth: depth,
        travelHeight: 0
      });
    }

    let hoverProgress = 0;
    const maxActive = 300; // max active rising particles to prevent canvas overloading

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate hoverProgress between 0 and 1
      const targetHover = isHoveredRef.current ? 1 : 0;
      hoverProgress += (targetHover - hoverProgress) * 0.08;

      // Count current active particles
      const activeCount = particles.filter(p => !p.isIdle).length;

      // Spawn new active rising particles when hovered (using a probability threshold for fluid stream)
      if (isHoveredRef.current && activeCount < maxActive) {
        if (Math.random() < 0.45) { // spawn roughly every 2 frames on average
          const xRatio = (Math.random() - 0.5) * 0.9; // match the belt's width
          const depth = 0.1 + Math.random() * 0.9; // depth factor (0.1 to 1.0)
          const baseSize = 1.0 + Math.random() * 2.0;
          
          // Travel height limit based on x coordinate (dome shape) with some random variance
          const ratio = Math.min(1.0, 2 * Math.abs(xRatio));
          const baselineHeight = (height / 2) * (1 - ratio);
          // Let outer particles travel further up to 45% of the remaining distance to height / 2
          const maxVariance = ((height / 2) - baselineHeight) * 0.45;
          const travelHeight = Math.max(5, baselineHeight + Math.random() * maxVariance);

          particles.push({
            xRatio: xRatio,
            y: height + Math.random() * 4,
            yFromBottom: 0,
            vxRatio: 0, // strictly vertical (xRatio remains constant)
            vy: (0.12 + Math.random() * 0.15) * (0.4 + depth * 0.6), // slowed down upward speed (smooth and dreamlike)
            size: baseSize * depth,
            opacity: 0,
            maxOpacity: 0.85 * depth, // deeper particles are dimmer
            isIdle: false,
            depth: depth,
            travelHeight: travelHeight
          });
        }
      }

      // Update and draw particles
      particles = particles.filter(p => {
        if (p.isIdle) {
          // Idle particles drift minutely at the bottom
          p.xRatio += p.vxRatio;
          p.yFromBottom += p.vy;

          // Bounce horizontally
          if (Math.abs(p.xRatio) > 0.5) {
            p.xRatio = Math.sign(p.xRatio) * 0.5;
            p.vxRatio *= -1;
          }
          // Bounce vertically within tight baseline bounds (belt filament)
          const minDrift = 1;
          const maxDrift = 6;
          if (p.yFromBottom < minDrift || p.yFromBottom > maxDrift) {
            p.vy *= -1;
            p.yFromBottom = Math.max(minDrift, Math.min(maxDrift, p.yFromBottom));
          }

          const currentX = width * 0.5 + p.xRatio * width;
          const currentY = height - p.yFromBottom;

          ctx.save();
          ctx.beginPath();
          ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
          // Scale opacity based strictly on hoverProgress (invisible by default, fades in on hover)
          ctx.globalAlpha = p.opacity * hoverProgress;
          ctx.fillStyle = palette.primary;
          ctx.fill();
          ctx.restore();
          return true;
        } else {
          // Active particles rise strictly vertically
          p.y -= p.vy;

          // Calculate travel progress from bottom to max height
          const distanceTraveled = height - p.y;
          const progress = Math.min(1.0, Math.max(0.0, distanceTraveled / p.travelHeight));

          // If reached maximum height, destroy
          if (progress >= 1.0) {
            return false;
          }

          // If mouse leaves and hoverProgress is near 0, destroy
          if (hoverProgress <= 0.001) {
            return false;
          }

          // Linearly decrease opacity to 0 as it approaches max height
          p.opacity = p.maxOpacity * (1 - progress) * hoverProgress;

          const currentX = width * 0.5 + p.xRatio * width;

          ctx.save();
          ctx.beginPath();
          ctx.arc(currentX, p.y, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = palette.primary;
          ctx.fill();
          ctx.restore();
          
          return true;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [palette.primary]); // depend on palette.primary to update colors when theme changes

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden p-8 md:p-12 flex flex-col justify-start min-h-[320px] md:min-h-[420px] cursor-pointer bg-white dark:bg-gray-950 transition-colors duration-300"
    >
      {/* Absolute-positioned canvas for particle effect */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Typographic Layout Content */}
      <div className="relative z-10 pointer-events-none flex flex-col items-center text-center w-full">
        <h4 className="text-lg sm:text-xl md:text-lg lg:text-xl xl:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors duration-300 whitespace-nowrap text-center mx-auto">
          {title}
        </h4>
        
        {/* Accordion style reveal for paragraph on hover */}
        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.p
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-slate-600 dark:text-gray-400 text-base leading-relaxed max-w-xs overflow-hidden text-center mx-auto"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AboutMe: React.FC = () => {
  const services = [
    {
      title: 'UI/UX Design',
      description: 'Creating intuitive, engaging, and accessible user interfaces that solve real problems.'
    },
    {
      title: 'Web Development',
      description: 'Building fast, responsive, and robust web applications using React, Next.js, and modern CSS.'
    },
    {
      title: 'AI Integration',
      description: 'Leveraging AI tools to accelerate development and build smarter, dynamic user experiences.'
    },
    {
      title: 'Responsive Layouts',
      description: 'Ensuring your product looks and feels perfect on any device, from mobile to desktop.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-slate-50 dark:bg-gray-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-3">About Me</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Designer & Developer with a passion for innovation.
            </h3>
            <p className="text-lg text-slate-600 dark:text-gray-300">
              As a freelance web and app designer, I blend creativity with technical expertise to deliver 
              digital products that stand out. From conceptualizing modern designs in Figma to bringing 
              them to life with React and 3D technologies, I handle the entire product lifecycle.
            </p>
          </motion.div>
        </div>

        {/* Minimalist 4-column typographic layout with lower opacity borders */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-slate-200/40 dark:border-slate-800/40 divide-y md:divide-y-0 md:divide-x divide-slate-200/40 dark:divide-slate-800/40 relative z-10 overflow-hidden px-4 md:px-0">
          {services.map((service, index) => (
            <SkillColumn 
              key={index} 
              title={service.title} 
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
