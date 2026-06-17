import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, ExternalLink } from 'lucide-react';
import InteractiveCreditCard from './InteractiveCreditCard';

const initialProjects = [
  { id: 1, title: '', category: '', image: '', description: '' },
  { id: 2, title: '', category: '', image: '', description: '' },
  { id: 3, title: '', category: '', image: '', description: '' },
  {
    id: 4,
    title: 'CodeSolve Dashboard Showcase',
    category: 'Web App',
    image: '',
    description: 'A high-end client analytics and management infrastructure platform featuring reactive data visualizations, real-time performance tracking, and dynamic security access protocols. Built to demonstrate state management optimization and seamless backend data synchronization.',
    link: 'https://codesolve-dashboard-showcase.web.app'
  },
  { id: 5, title: '', category: '', image: '', description: '' },
  { id: 6, title: '', category: '', image: '', description: '' },
  { id: 7, title: '', category: '', image: '', description: '' },
  { id: 8, title: '', category: '', image: '', description: '' },
  { id: 9, title: '', category: '', image: '', description: '' }
];

const ProjectGallery: React.FC = () => {
  const [absoluteIndex, setAbsoluteIndex] = useState(3);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [selectedProject, setSelectedProject] = useState<typeof initialProjects[0] | null>(null);
  
  const N = initialProjects.length;

  const handleNext = () => {
    setDirection(1);
    setAbsoluteIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setAbsoluteIndex(prev => prev - 1);
  };

  const handleCardClick = (project: typeof initialProjects[0], visualIndex: number) => {
    if (visualIndex === 0) {
      if (project.title === 'CodeSolve Dashboard Showcase') {
        setSelectedProject(project);
      }
    } else {
      setDirection(1);
      setAbsoluteIndex(prev => prev + visualIndex);
    }
  };

  const renderedProjects = Array.from({ length: 7 }, (_, visualIndex) => {
    const currentAbsIndex = absoluteIndex + visualIndex;
    const originalIndex = ((currentAbsIndex % N) + N) % N;
    return {
      ...initialProjects[originalIndex],
      originalIndex,
      visualIndex,
      absoluteIndex: currentAbsIndex
    };
  });

  const getFlexGrow = (vIndex: number) => {
    const defaults = [2000, 400, 200, 100, 20, 20, 20];

    if (hoveredIndex === 0) {
      if (vIndex === 0) return 2300;
      if (vIndex === 1) return 300;
      if (vIndex === 2) return 150;
      if (vIndex === 3) return 75;
      return 20;
    }

    if (hoveredIndex !== null && hoveredIndex !== 0) {
      if (vIndex === hoveredIndex) {
        if (hoveredIndex === 1) return 500;
        if (hoveredIndex === 2) return 300;
        if (hoveredIndex === 3) return 200;
        if (hoveredIndex >= 4) return 40;
      }
      if (vIndex === 0) {
        if (hoveredIndex === 1) return 1900;
        if (hoveredIndex === 2) return 1900;
        if (hoveredIndex === 3) return 1900;
        if (hoveredIndex >= 4) return 1980;
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
              Projects
            </h2>
            <p className="text-[20px] md:text-[22px] text-slate-500 dark:text-slate-400 tracking-tight">
              An overview of custom SaaS platforms, technical design integrations, and scalable client cloud ecosystems built for production.
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
              className="w-10 h-10 rounded-md flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white border border-transparent shadow-sm transition-colors"
              aria-label="Previous Project"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext} 
              className="w-10 h-10 rounded-md flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-transparent hover:border-brand-500 text-black dark:text-white shadow-sm transition-colors"
              aria-label="Next Project"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Asymmetrical Accordion Carousel */}
        <div 
          className="flex w-full h-[400px] md:h-[520px] gap-3 overflow-hidden py-4 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence custom={direction}>
            {renderedProjects.map((project, visualIndex) => {
              const isHero = visualIndex === 0;
              
              return (
                <motion.div
                  key={project.absoluteIndex}
                  custom={direction}
                  variants={{
                    initial: {
                      flexGrow: 0,
                      marginRight: "-0.75rem",
                    },
                    exit: {
                      flexGrow: 0,
                      marginRight: "-0.75rem",
                    }
                  }}
                  initial="initial"
                  animate={{
                    flexGrow: getFlexGrow(visualIndex),
                    marginRight: "0rem",
                  }}
                  exit="exit"
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}
                  style={{
                    flexBasis: 0,
                    minWidth: 0,
                  }}
                  onClick={() => handleCardClick(project, visualIndex)}
                  onMouseEnter={() => {
                    setHoveredIndex(visualIndex);
                  }}
                  className="relative h-full overflow-hidden cursor-pointer rounded-xl bg-slate-100 dark:bg-gray-900"
                >
                  
                  {/* Image Mask */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #042f2e 100%)' }}
                  >
                    {project.title === 'CodeSolve Dashboard Showcase' ? (
                      <div className="w-full h-full flex items-center justify-center pointer-events-auto">
                        <InteractiveCreditCard className="scale-75 md:scale-100" />
                      </div>
                    ) : (
                      <>
                        {project.image && (
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="absolute left-0 top-0 min-w-[1200px] h-full object-cover object-left max-w-none pointer-events-none select-none opacity-30 grayscale mix-blend-luminosity"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                           {visualIndex <= 1 && (
                             <span className="text-white/90 font-medium tracking-widest uppercase text-[10px] whitespace-nowrap bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">Coming Soon</span>
                           )}
                        </div>
                      </>
                    )}
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

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-64 sm:h-80 lg:h-96 shrink-0">
                {selectedProject.title === 'CodeSolve Dashboard Showcase' ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
                    <InteractiveCreditCard />
                  </div>
                ) : (
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="p-8 sm:p-10 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-full border border-brand-100 dark:border-brand-500/20">
                    {selectedProject.category}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  {selectedProject.title}
                </h3>
                <p className="text-lg text-slate-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {selectedProject.description}
                  <br /><br />
                  This project features a fully responsive design, seamless animations, and is optimized for peak performance across all devices. We implemented custom solutions to handle complex state management, real-time data synchronization, and secure backend processing to deliver a flawless user experience.
                </p>
                
                <div className="flex gap-4">
                  <a 
                    href={selectedProject.link || '#'}
                    onClick={(e) => {
                      if (!selectedProject.link) e.preventDefault();
                    }}
                    target={selectedProject.link ? "_blank" : undefined}
                    rel={selectedProject.link ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors gap-2 shadow-sm"
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectGallery;
