import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Hero3DObject from '../canvas/Hero3DObject';

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/20 dark:bg-brand-500/10 rounded-full blur-[120px] -z-10 pointer-events-none transition-colors duration-500"></div>

      {/* Full-Screen 3D Object Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40 md:opacity-100">
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Hero3DObject />
        </Suspense>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center w-full h-full min-h-[calc(100vh-4rem)] pointer-events-none">
        {/* Left Side: Text Content */}
        <div className="w-full md:w-1/2 pt-20 md:pt-0 z-10 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6 md:p-8 -ml-6 md:-ml-8 rounded-lg relative"
          >
            <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-3">
              Freelance Web & App Designer
            </h2>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
              Crafting Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-[1500ms] ease-in-out" style={{ backgroundImage: `linear-gradient(to right, var(--brand-500), var(--brand-600))` }}>
                Experiences
              </span>
            </h1>
            <p className="text-xl text-slate-700 dark:text-gray-300 mb-8 max-w-lg leading-relaxed font-medium">
              I specialize in creating premium, dynamic websites and applications powered by cutting-edge AI tools and modern web technologies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#projects"
                className="group inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                View My Work
                <ArrowRight className="w-0 opacity-0 -translate-x-2 group-hover:w-4 group-hover:opacity-100 group-hover:translate-x-1 group-hover:ml-2 transition-all duration-300 overflow-hidden" />
              </a>
              <a
                href="#contact"
                className="inline-flex justify-center items-center px-6 py-2.5 border border-slate-300 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 text-sm font-medium rounded-md text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Contact Me
              </a>
            </div>
          </motion.div>
        </div>

      </div>
      

    </section>
  );
};

export default HeroSection;
