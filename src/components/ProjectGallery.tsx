import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, ExternalLink, Check, ArrowUpRight } from 'lucide-react';
import { projects } from '../data/projects';
import type { Project } from '../data/projects';
import ProjectVisual, { ProjectBackdrop } from './showcase/ProjectVisual';

const noiseTexture = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

const N = projects.length;
const VISIBLE = Math.min(7, N);
const DEFAULT_GROW = [2000, 400, 200, 100, 20, 20, 20];

const ProjectGallery: React.FC = () => {

  const [absoluteIndex, setAbsoluteIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const modalIsOpen = selectedProject !== null;
  const activeIndex = ((absoluteIndex % N) + N) % N;

  // Close on Escape and lock page scroll while the modal is open
  useEffect(() => {
    if (!modalIsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [modalIsOpen]);

  const handleNext = () => {
    setDirection(1);
    setAbsoluteIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setAbsoluteIndex(prev => prev - 1);
  };

  const goTo = (index: number) => {
    const delta = index - activeIndex;
    if (delta === 0) return;
    setDirection(delta > 0 ? 1 : -1);
    setAbsoluteIndex(prev => prev + delta);
  };

  const handleCardClick = (project: Project, visualIndex: number) => {
    if (visualIndex === 0) {
      if (project.visual) {
        setSelectedProject(project);
      }
    } else {
      setDirection(1);
      setAbsoluteIndex(prev => prev + visualIndex);
    }
  };

  const renderedProjects = Array.from({ length: VISIBLE }, (_, visualIndex) => {
    const currentAbsIndex = absoluteIndex + visualIndex;
    const originalIndex = ((currentAbsIndex % N) + N) % N;
    return {
      ...projects[originalIndex],
      originalIndex,
      visualIndex,
      absoluteIndex: currentAbsIndex
    };
  });

  const getFlexGrow = (vIndex: number) => {
    const defaults = DEFAULT_GROW;

    if (modalIsOpen) {
      return defaults[vIndex];
    }

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-3">Selected Work</h2>
            <h3 className="text-[28px] md:text-[32px] leading-tight font-medium text-slate-900 dark:text-white tracking-tight">
              Projects
            </h3>
            <p className="text-[18px] md:text-[20px] text-slate-500 dark:text-slate-400 tracking-tight mt-1">
              Custom SaaS platforms, business tools and client-facing sites, built and shipped to production.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <span className="text-sm font-medium tabular-nums text-slate-400 dark:text-slate-500">
              <span className="text-slate-900 dark:text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
              {' / '}
              {String(N).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handlePrev}
                className="w-10 h-10 rounded-md flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white border border-transparent shadow-sm transition-colors"
                aria-label="Previous Project"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleNext}
                className="w-10 h-10 rounded-md flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 hover:border-brand-500 dark:hover:border-brand-500 text-black dark:text-white shadow-sm transition-colors"
                aria-label="Next Project"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Asymmetrical Accordion Carousel */}
        <div
          className="flex w-full h-[500px] md:h-[520px] gap-3 overflow-hidden py-4 relative"
          onMouseLeave={() => {
            if (!modalIsOpen) {
              setHoveredIndex(null);
            }
          }}
        >
          <AnimatePresence custom={direction}>
            {renderedProjects.map((project, visualIndex) => {
              const isHero = visualIndex === 0;
              const isPlaceholder = !project.visual;

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
                  transition={{ type: "tween", ease: [0.65, 0, 0.35, 1], duration: 0.7 }}
                  style={{
                    flexBasis: 0,
                    minWidth: 0,
                  }}
                  onClick={() => handleCardClick(project, visualIndex)}
                  onMouseEnter={() => {
                    if (!modalIsOpen) {
                      setHoveredIndex(visualIndex);
                    }
                  }}
                  className={`group relative h-full overflow-hidden rounded-xl bg-slate-100 dark:bg-gray-900 ${
                    isHero ? 'w-full md:w-auto' : 'hidden md:block'
                  } ${modalIsOpen ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                >

                  {/* Visual Mask */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
                    {project.visual ? (
                      <div className="w-full h-full flex items-center justify-center pointer-events-auto relative z-10">
                        {/* Static Pastel Pencil Background */}
                        <ProjectBackdrop visual={project.visual} />

                        {/* Floating showcase object on top */}
                        <div
                          className={`relative z-10 pointer-events-auto flex items-center justify-center w-full h-full transition-all duration-[700ms] ease-in-out origin-center ${
                            isHero
                              ? 'scale-[0.82] sm:scale-90 md:scale-100 opacity-100 pb-28 md:pb-0'
                              : `scale-50 md:scale-55 opacity-60 ${!modalIsOpen ? 'group-hover:opacity-90' : ''}`
                          }`}
                        >
                          <ProjectVisual visual={project.visual} active={isHero && !modalIsOpen} />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center transition-colors duration-[1500ms]">
                        {/* Subtle noise pattern for greyed out texture */}
                        <div
                          className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
                          style={{ backgroundImage: noiseTexture }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                           {visualIndex <= 2 && (
                             <span className="text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase text-[10px] whitespace-nowrap bg-slate-200/50 dark:bg-slate-950/40 px-4 py-2 rounded-full border border-slate-300/30 dark:border-slate-800/20 shadow-md backdrop-blur-md">Coming Soon</span>
                           )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gradient on project cards to keep the label readable */}
                  {!isPlaceholder && (
                    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none z-10 transition-opacity duration-500 ${
                      isHero ? 'h-1/2' : 'h-1/3 opacity-0 group-hover:opacity-100'
                    }`} />
                  )}

                  {/* Hero Card Contents */}
                  {isHero && !isPlaceholder && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex items-end justify-between gap-4 text-left z-20 pointer-events-none"
                    >
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-2 text-white/80 text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">
                          {project.category}
                          {project.status && (
                            <span className="hidden sm:inline-flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-white/60" />
                              {project.status}
                            </span>
                          )}
                        </span>
                        <h4 className="text-white text-[26px] md:text-[34px] font-normal tracking-tight leading-[1.1] max-w-[80%]">
                          {project.title.split(' ').slice(0, -1).join(' ')}<br/>
                          {project.title.split(' ').slice(-1)}
                        </h4>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-white text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-slate-900">
                        <span className="hidden sm:inline">View details</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </motion.div>
                  )}

                  {/* Secondary card label, revealed on hover */}
                  {!isHero && !isPlaceholder && visualIndex <= 2 && (
                    <div className="absolute bottom-0 left-0 w-full p-4 z-20 pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-[0.16em] truncate">{project.category}</p>
                      <p className="text-white text-sm font-medium truncate">{project.title}</p>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              aria-label={`Show ${p.title}`}
              className="group/dot py-2"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  i === activeIndex
                    ? 'w-8 bg-brand-500'
                    : 'w-1.5 bg-slate-300 dark:bg-gray-700 group-hover/dot:bg-slate-400 dark:group-hover/dot:bg-gray-500'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && selectedProject.visual && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={selectedProject.title}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto">
                <div className="relative w-full h-64 sm:h-80 lg:h-96 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    <ProjectBackdrop visual={selectedProject.visual} />
                  </div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center scale-[0.72] sm:scale-90 lg:scale-100">
                    <ProjectVisual visual={selectedProject.visual} active={true} />
                  </div>
                </div>

                <div className="p-8 sm:p-10">
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                  >
                    <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-full border border-brand-100 dark:border-brand-500/20">
                        {selectedProject.category}
                      </span>
                      {selectedProject.status && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedProject.status === 'Live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {selectedProject.status}
                        </span>
                      )}
                    </motion.div>

                    <motion.h3 variants={fadeUp} className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                      {selectedProject.title}
                    </motion.h3>
                    {selectedProject.summary && (
                      <motion.p variants={fadeUp} className="text-lg text-slate-500 dark:text-gray-400 mb-6">
                        {selectedProject.summary}
                      </motion.p>
                    )}

                    {selectedProject.description?.map((paragraph, i) => (
                      <motion.p key={i} variants={fadeUp} className="text-base sm:text-[17px] text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {paragraph}
                      </motion.p>
                    ))}

                    <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 mt-8 pt-8 border-t border-slate-100 dark:border-gray-800">
                      {selectedProject.highlights && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-gray-500 mb-4">Highlights</h4>
                          <ul className="space-y-2.5">
                            {selectedProject.highlights.map(item => (
                              <li key={item} className="flex items-start gap-3 text-slate-700 dark:text-gray-300">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 text-brand-500" strokeWidth={3} />
                                </span>
                                <span className="text-[15px] leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedProject.stack && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-gray-500 mb-4">Built with</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.stack.map(tech => (
                              <span key={tech} className="px-3 py-1.5 text-sm rounded-md bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {selectedProject.link && (
                      <motion.div variants={fadeUp} className="flex gap-4 mt-10">
                        <a
                          href={selectedProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors gap-2 shadow-sm"
                        >
                          {selectedProject.linkLabel ?? 'Visit Website'}
                          <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default ProjectGallery;
