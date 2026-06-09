import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowRight, ArrowLeft, X } from 'lucide-react';

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
  const [activeIndex, setActiveIndex] = useState(3); // Health Tracking App initially
  const [selectedProject, setSelectedProject] = useState<typeof initialProjects[0] | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const N = initialProjects.length;

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % N);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + N) % N);
  };

  const handleCardClick = (originalIndex: number, visualIndex: number) => {
    if (visualIndex === 3) {
      // Active Hero card clicked: Open modal
      setSelectedProject(initialProjects[originalIndex]);
    } else {
      // Shift clicked card so it becomes the Hero card at slot index 3
      setActiveIndex(originalIndex);
    }
  };

  // Rotate initialProjects so that whichever project is activeIndex is always rendered at visual slot index 3
  const renderedProjects = Array.from({ length: N }, (_, visualIndex) => {
    const originalIndex = (activeIndex + (visualIndex - 3) + N) % N;
    return {
      ...initialProjects[originalIndex],
      originalIndex,
      visualIndex
    };
  });

  // Dynamically assign classes containing structural layout and scaling values to avoid snappings/rounding jitters
  const getCardClassName = (vIndex: number) => {
    const baseClass = "relative h-full overflow-hidden cursor-pointer group rounded-2xl bg-gray-950/40 backdrop-blur-md border border-white/10 shadow-lg";
    
    // Left Columns (slots 0, 1, 2) - Fixed baseline narrow strips
    if (vIndex < 3) {
      return `${baseClass} flex-[1.2] min-w-[50px] md:min-w-[60px]`;
    }
    
    // Hero Column (slot 3) - Primary active card (shrinks when a middle card is hovered)
    if (vIndex === 3) {
      const isMiddleHovered = hoveredIndex !== null && hoveredIndex >= 4 && hoveredIndex <= 6;
      const heroFlex = isMiddleHovered 
        ? "flex-[8] min-w-[300px] md:min-w-[40%]" 
        : "flex-[12] min-w-[350px] md:min-w-[50%]";
      return `${baseClass} ${heroFlex}`;
    }
    
    // Middle Columns (slots 4, 5, 6) - Interactive stack
    if (vIndex >= 4 && vIndex <= 6) {
      if (hoveredIndex === vIndex) {
        return `${baseClass} flex-[6] min-w-[150px] md:min-w-[200px]`;
      }
      if (hoveredIndex !== null && hoveredIndex >= 4 && hoveredIndex <= 6) {
        return `${baseClass} flex-[2] min-w-[80px] md:min-w-[100px]`;
      }
      return `${baseClass} flex-[3] min-w-[100px] md:min-w-[130px]`;
    }
    
    // Hint Columns (slots 7, 8) - Fixed razor-thin visuals
    return `${baseClass} flex-[0.4] min-w-[16px] md:min-w-[24px] max-w-[24px]`;
  };

  return (
    <section id="projects" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-[1500ms]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Controls */}
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-2 block">Portfolio</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Selected Works
            </h3>
          </motion.div>
          
          {/* Minimalist Navigation Arrows at Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <button 
              onClick={handlePrev} 
              className="w-10 h-10 rounded-md flex items-center justify-center bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-850 active:scale-95 transition-all"
              aria-label="Previous Project"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext} 
              className="w-10 h-10 rounded-md flex items-center justify-center bg-[#0ea5e9] text-white hover:bg-[#0284c7] active:scale-95 transition-all shadow-md shadow-cyan-500/10"
              aria-label="Next Project"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Asymmetrical Accordion Carousel */}
        <div 
          className="flex w-full h-[500px] md:h-[650px] gap-3 md:gap-4 overflow-hidden py-4 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {renderedProjects.map((project) => {
              const visualIndex = project.visualIndex;
              const isHero = visualIndex === 3;
              
              return (
                <motion.div
                  key={project.id}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  onClick={() => handleCardClick(project.originalIndex, visualIndex)}
                  onMouseEnter={() => {
                    // Only trigger hovers for interactive Slots (3, 4, 5, 6)
                    if (visualIndex >= 3 && visualIndex <= 6) {
                      setHoveredIndex(visualIndex);
                    } else {
                      setHoveredIndex(null);
                    }
                  }}
                  className={getCardClassName(visualIndex)}
                >
                  
                  {/* Image Mask (completely static centering, un-warped on scale transitions) */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[900px] h-full object-cover object-center max-w-none pointer-events-none select-none"
                    />
                  </div>
                  
                  {/* Gradient / Glassmorphic Overlays */}
                  <div 
                    className={`absolute inset-0 transition-opacity duration-300 rounded-2xl z-0 ${
                      isHero 
                        ? 'bg-gradient-to-t from-black/95 via-black/40 to-black/15' 
                        : 'bg-black/45'
                    }`} 
                  />
                  
                  {/* Hero Card Contents (Slot 3) */}
                  {isHero && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col items-start justify-end text-left z-10"
                    >
                      <span className="text-xs font-bold tracking-widest text-[#0ea5e9] uppercase mb-1.5 block">
                        {project.category}
                      </span>
                      <h4 className="text-white text-3xl md:text-5xl font-bold mb-3 tracking-tight leading-tight">
                        {project.title}
                      </h4>
                      <p className="text-gray-300 text-xs md:text-sm max-w-xl mb-6 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#0ea5e9] text-white font-medium hover:bg-[#0284c7] hover:scale-105 active:scale-95 transition-all text-sm shadow-md shadow-cyan-500/20"
                      >
                        View Project Details
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                  
                  {/* Persistent Rotated Uppercase Labels (Slots 0,1,2 and 4,5,6) */}
                  {!isHero && visualIndex !== 7 && visualIndex !== 8 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <span className="text-white font-bold tracking-widest uppercase whitespace-nowrap -rotate-90 origin-center text-xs md:text-sm drop-shadow-md select-none">
                        {project.title}
                      </span>
                    </div>
                  )}
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Popup Details */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 100, mass: 1 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 border border-slate-200 dark:border-gray-800"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-md backdrop-blur-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-full md:w-1/2 h-64 md:h-[500px] relative">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-[#0ea5e9] font-bold tracking-wider uppercase text-sm mb-2">
                  {selectedProject.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  {selectedProject.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-10">
                  {selectedProject.description} 
                  <br/><br/>
                  This project demonstrates modern design principles, clean architecture, and responsive execution. Built using high-performance components to ensure a premium user experience and seamless interactions.
                </p>
                
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-md bg-[#0ea5e9] text-white font-medium hover:bg-[#0284c7] transition-colors w-full shadow-md shadow-cyan-500/10"
                >
                  Visit Live Site
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectGallery;
