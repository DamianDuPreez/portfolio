import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import PerlinFlowField from '../canvas/PerlinFlowField';
import { useTheme } from '../context/ThemeContext';

const ContactForm: React.FC = () => {
  const { palette } = useTheme();

  return (
    <section id="contact" className="relative py-24 bg-slate-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* 3D Perlin Flow Field strictly contained within the bounds of the entire section */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={palette.ambientIntensity * 1.2} />
            <PerlinFlowField />
          </Canvas>
        </Suspense>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-3">Get in Touch</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Let's build something amazing together.
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
              Whether you have a specific project in mind or just want to explore possibilities, 
              I'm here to help bring your ideas to life.
            </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-sm mr-4">
                  <Mail className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">hello@portfolio.com</p>
                </div>
              </div>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-10 bg-white/60 dark:bg-gray-950/60 backdrop-blur-2xl rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-none border border-white/50 dark:border-gray-800/50 p-8"
            >
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Ready to Engineer Your Enterprise Tech Stack?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                Project intake, custom Web SaaS scoping, and cloud consulting infrastructure management are handled exclusively through our corporate storefront.
              </p>
              <a
                href="http://localhost:3000"
                className="group inline-flex justify-center items-center px-6 py-2.5 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                Start Project Scoping
                <ArrowRight className="w-0 opacity-0 -translate-x-2 group-hover:w-4 group-hover:opacity-100 group-hover:translate-x-1 group-hover:ml-2 transition-all duration-300 overflow-hidden" />
              </a>
            </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
