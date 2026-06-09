import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const initialProjects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    category: 'Web App',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A full-stack e-commerce solution with Stripe integration and dynamic 3D product previews. This application handles everything from inventory management to secure payment processing.'
  },
  {
    id: 2,
    title: 'Finance Dashboard',
    category: 'UI/UX Design',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A modern, dark-themed analytics dashboard designed for high-frequency traders. Features real-time charting, portfolio tracking, and AI-driven market insights.'
  },
  {
    id: 3,
    title: 'AI Content Generator',
    category: 'SaaS',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'An AI-powered application that generates marketing copy, featuring a sleek, minimal interface. Built with React and integrated with large language models.'
  },
  {
    id: 4,
    title: 'Health Tracking App',
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A comprehensive health and fitness tracker with real-time biometric synchronization. Includes custom workout plans and nutritional logging.'
  },
  {
    id: 5,
    title: 'Real Estate Platform',
    category: 'Web App',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A high-end property listing platform with virtual tours, interactive maps, and automated viewing scheduling systems.'
  },
  {
    id: 6,
    title: 'Social Media Manager',
    category: 'SaaS',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A unified social media management tool with AI-driven analytics, bulk scheduling, and engagement tracking across platforms.'
  },
  {
    id: 7,
    title: 'Cloud Storage Service',
    category: 'SaaS',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A secure, decentralized cloud storage service featuring end-to-end encryption, automated backups, and collaborative file sharing.'
  },
  {
    id: 8,
    title: 'Fitness Companion',
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A mobile application for custom workouts, tracking calorie intake, and synchronizing with smart wearables to monitor progress.'
  },
  {
    id: 9,
    title: 'Developer Portfolio',
    category: 'Web App',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'An interactive, high-performance portfolio website built with React, Three.js, and Tailwind CSS to showcase professional developer projects.'
  }
];

const ProjectGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(3);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const N = initialProjects.length;

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % N);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + N) % N);
  };

  const handleCardClick = (originalIndex: number, visualIndex: number) => {
    if (visualIndex !== 0) {
      setActiveIndex(originalIndex);
    }
  };

  const renderedProjects = Array.from({ length: 7 }, (_, visualIndex) => {
    const originalIndex = (activeIndex + visualIndex) % N;
    return {
      ...initialProjects[originalIndex],
      originalIndex,
      visualIndex
    };
  });

  const getFlexGrow = (vIndex: number) => {
    const defaults = [20, 4, 2, 1, 0.2, 0.2, 0.2];

    if (hoveredIndex === 0) {
      if (vIndex === 0) return 23;
      if (vIndex === 1) return 3;
      if (vIndex === 2) return 1.5;
      if (vIndex === 3) return 0.75;
      return 0.2;
    }

    if (hoveredIndex !== null && hoveredIndex !== 0) {
      if (vIndex === hoveredIndex) {
        if (hoveredIndex === 1) return 5;
        if (hoveredIndex === 2) return 3;
        if (hoveredIndex === 3) return 2;
        if (hoveredIndex >= 4) return 0.4;
      }
      if (vIndex === 0) {
        if (hoveredIndex === 1) return 19;
        if (hoveredIndex === 2) return 19;
        if (hoveredIndex === 3) return 19;
        if (hoveredIndex >= 4) return 19.8;
      }
      return defaults[vIndex];
    }

    return defaults[vIndex];
  };

  return (
    <section id="projects" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-[1500ms]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Controls */}
        <div className="flex items-end justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[28px] md:text-[32px] leading-tight font-medium text-slate-900 dark:text-white tracking-tight">
              What’s happening
            </h2>
            <p className="text-[20px] md:text-[22px] text-slate-500 dark:text-slate-400 tracking-tight">
              See the latest from Stripe.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <button 
              onClick={handlePrev} 
              className="w-10 h-10 rounded-md flex items-center justify-center bg-[#f0ebff] dark:bg-indigo-900/50 hover:bg-[#e0d6ff] dark:hover:bg-indigo-800/50 text-[#635bff] dark:text-indigo-400 transition-colors"
              aria-label="Previous Project"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext} 
              className="w-10 h-10 rounded-md flex items-center justify-center bg-[#f0ebff] dark:bg-indigo-900/50 hover:bg-[#e0d6ff] dark:hover:bg-indigo-800/50 text-[#635bff] dark:text-indigo-400 transition-colors"
              aria-label="Next Project"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Asymmetrical Accordion Carousel */}
        <div 
          className="flex w-full h-[400px] md:h-[520px] gap-2 md:gap-3 overflow-hidden py-4 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {renderedProjects.map((project) => {
              const visualIndex = project.visualIndex;
              const isHero = visualIndex === 0;
              
              return (
                <motion.div
                  key={project.id}
                  layout
                  animate={{
                    flexGrow: getFlexGrow(visualIndex),
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  style={{
                    flexBasis: 0,
                    minWidth: 0,
                  }}
                  onClick={() => handleCardClick(project.originalIndex, visualIndex)}
                  onMouseEnter={() => {
                    setHoveredIndex(visualIndex);
                  }}
                  className="relative h-full overflow-hidden cursor-pointer rounded-xl bg-slate-100 dark:bg-gray-900"
                >
                  
                  {/* Image Mask */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[900px] h-full object-cover object-center max-w-none pointer-events-none select-none"
                    />
                  </div>
                  
                  {/* Subtle gradient on Hero card just to ensure text readability against arbitrary images */}
                  {isHero && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  )}
                  
                  {/* Hero Card Contents */}
                  {isHero && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute bottom-0 left-0 p-8 w-full flex flex-col items-start justify-end text-left z-10 pointer-events-none"
                    >
                      <h4 className="text-white text-[28px] md:text-[34px] font-normal tracking-tight leading-[1.1] max-w-[80%]">
                        {project.title.split(' ').slice(0, -1).join(' ')}<br/>
                        {project.title.split(' ').slice(-1)}
                      </h4>
                    </motion.div>
                  )}
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ProjectGallery;
