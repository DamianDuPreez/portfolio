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
  }
];

const ProjectGallery: React.FC = () => {
  const [projects, setProjects] = useState(() => initialProjects.map(p => ({ ...p, instanceId: 0 })));
  const [selectedProject, setSelectedProject] = useState<typeof initialProjects[0] | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = Math.floor(initialProjects.length / 2);

  const handleNext = () => {
    setProjects(prev => {
      const newArr = [...prev];
      const first = newArr.shift();
      if (first) newArr.push({ ...first, instanceId: first.instanceId + 1 });
      return newArr;
    });
  };

  const handlePrev = () => {
    setProjects(prev => {
      const newArr = [...prev];
      const last = newArr.pop();
      if (last) newArr.unshift({ ...last, instanceId: last.instanceId + 1 });
      return newArr;
    });
  };

  const handleCardClick = (clickedProject: typeof initialProjects[0], index: number) => {
    if (index === activeIndex) {
      // Active card clicked: Open modal
      setSelectedProject(clickedProject);
    } else {
      // Blade clicked: Shift array until it becomes active
      setProjects(prev => {
        const newArr = [...prev];
        const shiftAmount = index - activeIndex;
        
        if (shiftAmount > 0) {
          // Clicked element is to the right. Shift left by shiftAmount.
          const removed = newArr.splice(0, shiftAmount);
          const wrapped = removed.map(p => ({ ...p, instanceId: p.instanceId + 1 }));
          return [...newArr, ...wrapped];
        } else {
          // Clicked element is to the left. Shift right by Math.abs(shiftAmount).
          const absShift = Math.abs(shiftAmount);
          const removed = newArr.splice(-absShift, absShift);
          const wrapped = removed.map(p => ({ ...p, instanceId: p.instanceId + 1 }));
          return [...wrapped, ...newArr];
        }
      });
    }
  };

  return (
    <section id="projects" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-[1500ms]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-3">Portfolio</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Selected Works
            </h3>
          </motion.div>
          
          {/* Navigation Arrows */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mt-8 md:mt-0"
          >
            <button 
              onClick={handlePrev} 
              className="p-4 rounded-md bg-slate-100 dark:bg-gray-800 shadow-sm hover:shadow-md border border-transparent hover:border-brand-500 transition-all text-slate-700 dark:text-white hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext} 
              className="p-4 rounded-md bg-brand-500 text-white shadow-sm hover:shadow-md hover:bg-brand-600 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>

        {/* Accordion Carousel */}
        <div 
          className="flex w-full h-[500px] md:h-[650px] gap-3 md:gap-4 overflow-hidden py-4 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {projects.map((project, index) => {
              const isActive = index === activeIndex;
              const isHovered = hoveredIndex === index;
              
              // Dynamic width scaling: Active is large, hovered blades slightly expand
              let flexClass = "flex-[1]";
              if (isActive) {
                 flexClass = (hoveredIndex !== null && !isActive && hoveredIndex !== activeIndex) ? "flex-[10]" : "flex-[12]";
              } else {
                 flexClass = isHovered ? "flex-[3]" : "flex-[1]";
              }

              return (
                <motion.div
                  key={`${project.id}-${project.instanceId}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 18, mass: 1.2 }}
                  onClick={() => handleCardClick(project, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative h-full rounded-lg overflow-hidden cursor-pointer group ${flexClass} hover:shadow-2xl shadow-lg border border-slate-200 dark:border-gray-800`}
                style={{ minWidth: isActive ? "50%" : "40px" }}
              >
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'bg-gradient-to-t from-black/90 via-black/30 to-transparent' : 'bg-black/40 group-hover:bg-black/20'}`} />
                
                {/* Content - Visible on active card */}
                <motion.div 
                  layout
                  className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex flex-col justify-end"
                >
                  <motion.div 
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: isActive ? 0.2 : 0 }}
                    className={`w-full ${isActive ? 'block' : 'hidden'}`}
                  >
                    <span className="text-brand-400 font-bold tracking-wider uppercase text-sm mb-3 block">
                      {project.category}
                    </span>
                    <h4 className="text-white text-3xl md:text-5xl font-bold mb-4">{project.title}</h4>
                    <p className="text-gray-300 md:text-lg max-w-2xl line-clamp-2 md:line-clamp-3 mb-8">
                      {project.description}
                    </p>
                    
                    <button className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-brand-500 text-white font-medium hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all">
                      View Project Details
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
                
                {/* Vertical title for blades */}
                <motion.div 
                  initial={false}
                  animate={{ opacity: !isActive ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {!isActive && (
                    <span className="text-white font-bold tracking-widest whitespace-nowrap -rotate-90 origin-center text-sm md:text-lg drop-shadow-md">
                      {project.title}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      </div>

      {/* Modal Popup */}
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
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-md backdrop-blur-md transition-colors"
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
                <span className="text-brand-500 font-bold tracking-wider uppercase text-sm mb-2">
                  {selectedProject.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  {selectedProject.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-300 text-lg leading-relaxed mb-10">
                  {selectedProject.description} 
                  <br/><br/>
                  (This is a placeholder for a much longer description where you can talk about the technologies used, the problems solved, and your role in the project.)
                </p>
                
                <a 
                  href="#" 
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-md bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors w-full"
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
