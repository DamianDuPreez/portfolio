import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, X, Code2, Clock, Sunrise, Sunset, CloudMoon, Check } from 'lucide-react';
import { useTheme, getTimeDisplayName } from '../context/ThemeContext';
import type { TimeOfDay } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const times: TimeOfDay[] = ['auto', 'pre-dawn', 'sunrise', 'daytime', 'sunset', 'dusk', 'night'];

const getIcon = (time: TimeOfDay | Exclude<TimeOfDay, 'auto'>) => {
  switch (time) {
    case 'auto': return <Clock className="w-4 h-4" />;
    case 'pre-dawn': return <CloudMoon className="w-4 h-4" />;
    case 'sunrise': return <Sunrise className="w-4 h-4" />;
    case 'daytime': return <Sun className="w-4 h-4" />;
    case 'sunset': return <Sunset className="w-4 h-4" />;
    case 'dusk': return <CloudMoon className="w-4 h-4" />;
    case 'night': return <Moon className="w-4 h-4" />;
    default: return <Sun className="w-4 h-4" />;
  }
};

const ThemeDropdown: React.FC = () => {
  const { mode, setMode, activeTimeOfDay } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Theme Selection"
        title="Change Time of Day"
      >
        {getIcon(mode === 'auto' ? activeTimeOfDay : mode)}
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 overflow-hidden z-50"
          >
            <div className="py-1">
              {times.map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.05)" }}
                  whileTap={{ scale: 0.98, backgroundColor: "rgba(14, 165, 233, 0.1)" }}
                  onClick={() => {
                    setMode(t);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${mode === t
                    ? 'text-brand-500 font-semibold bg-brand-50/50 dark:bg-brand-900/10'
                    : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {getIcon(t)}
                    {getTimeDisplayName(t)}
                  </div>
                  {mode === t && <Check className="w-4 h-4 text-brand-500" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-[1500ms] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Code2 className="w-8 h-8 text-brand-500 transition-colors duration-[1500ms]" />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-colors duration-[1500ms]">Portfolio</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm"
              >
                {link.name}
              </a>
            ))}

            <ThemeDropdown />

            <a href="#contact" className="px-5 py-2 rounded-md bg-slate-900 text-white dark:bg-white dark:text-gray-900 font-medium text-sm hover:opacity-90 border border-transparent hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-[1500ms]">
              Get in touch
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeDropdown />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 transition-colors duration-[1500ms]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              className="block mt-4 text-center px-5 py-3 rounded-md bg-slate-900 text-white dark:bg-white dark:text-gray-900 font-medium border border-transparent hover:border-brand-500 transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get in touch
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
