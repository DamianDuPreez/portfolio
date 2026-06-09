import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Palette, Code, Cpu, X, Pause, Play } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import UnifiedInteractiveShowcase from '../canvas/UnifiedInteractiveShowcase';
import { useTheme } from '../context/ThemeContext';

const AboutSection: React.FC = () => {
  const { palette } = useTheme();
  const [activeCard, setActiveCard] = useState<number | null>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const skills = [
    {
      title: 'UI/UX Design',
      description: 'Creating intuitive, engaging, and accessible user interfaces that solve real problems.',
      icon: <Palette className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Web Development',
      description: 'Building fast, responsive, and robust web applications using React, Next.js, and modern CSS.',
      icon: <Code className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'AI Integration',
      description: 'Leveraging AI tools to accelerate development and build smarter, dynamic user experiences.',
      icon: <Cpu className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Responsive Layouts',
      description: 'Ensuring your product looks and feels perfect on any device, from mobile to desktop.',
      icon: <Layout className="w-6 h-6 text-brand-500" />
    }
  ];

  // We no longer need ActiveComponent since we use UnifiedInteractiveShowcase

  return (
    <section id="about" className="py-24 bg-slate-50 dark:bg-gray-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => {
                setActiveCard(activeCard === index ? null : index);
                setIsPaused(false);
              }}
              className={`group relative overflow-hidden bg-white dark:bg-gray-950 p-8 rounded-lg border ${activeCard === index ? 'shadow-2xl scale-110 z-20 border-transparent' : 'border-gray-100 dark:border-gray-800 shadow-sm'} hover:shadow-2xl hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointer`}
            >
              {/* Animated Border Outline using SVG Mask */}
              <motion.svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                initial="rest"
                whileHover="hover"
                animate={activeCard === index ? "hover" : "rest"}
              >
                <defs>
                  <mask id={`border-mask-${index}`}>
                    <motion.circle
                      cx="50%"
                      cy="0%"
                      variants={{
                        rest: { r: "0%" },
                        hover: { r: "150%" }
                      }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      fill="white"
                    />
                  </mask>
                  <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={palette.primary} />
                    <stop offset="100%" stopColor={palette.secondary} />
                  </linearGradient>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="8"
                  fill="none"
                  stroke={`url(#grad-${index})`}
                  strokeWidth="3"
                  mask={`url(#border-mask-${index})`}
                />
              </motion.svg>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-slate-50 dark:bg-brand-900/20 rounded-md flex items-center justify-center mb-6 transition-colors group-hover:bg-brand-50 dark:group-hover:bg-brand-900/40">
                  {skill.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{skill.title}</h4>
                <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{skill.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive 3D Showcase Data Card */}
        <AnimatePresence>
          {activeCard !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 500, y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="mt-8 overflow-hidden rounded-lg shadow-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 relative"
            >
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 bg-slate-100 dark:bg-gray-800 rounded-md hover:bg-slate-200 dark:hover:bg-gray-700 border border-transparent hover:border-brand-500 transition-colors text-slate-600 dark:text-slate-300 shadow-sm"
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setActiveCard(null)}
                  className="p-2 bg-slate-100 dark:bg-gray-800 rounded-md hover:bg-slate-200 dark:hover:bg-gray-700 border border-transparent hover:border-brand-500 transition-colors text-slate-600 dark:text-slate-300 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div 
                className="absolute inset-0 z-0"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                  <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <ambientLight intensity={palette.ambientIntensity * 1.5} />
                    <UnifiedInteractiveShowcase activeCard={activeCard} isHovered={isHovered} isPaused={isPaused} />
                  </Canvas>
                </Suspense>
              </div>
              
              <div className="absolute bottom-8 left-8 z-10 pointer-events-none">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{skills[activeCard].title} Experience</h4>
                <p className="text-slate-600 dark:text-gray-300 max-w-md">Interact with the WebGL object using your mouse to see the dynamic effect.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AboutSection;
