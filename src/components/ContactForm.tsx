import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import PerlinFlowField from '../canvas/PerlinFlowField';
import { useTheme } from '../context/ThemeContext';

const ContactForm: React.FC = () => {
  const { palette } = useTheme();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xyyqpeok', { // Replace with actual formspree endpoint if provided
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setFormStatus('success');
        form.reset();
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      setFormStatus('error');
    }
  };

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

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-sm mr-4">
                  <Mail className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">hello@portfolio.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-sm mr-4">
                  <Phone className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-sm mr-4">
                  <MapPin className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">San Francisco, CA (Remote)</p>
                </div>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-70 transition-colors"
              >
                {formStatus === 'submitting' ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>

              {formStatus === 'success' && (
                <p className="text-green-500 text-center font-medium">Message sent successfully!</p>
              )}
              {formStatus === 'error' && (
                <p className="text-red-500 text-center font-medium">Oops! There was a problem sending your message.</p>
              )}
            </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
