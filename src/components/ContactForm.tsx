import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, Mail, Sun, Moon, MapPin } from 'lucide-react';
import DayNightGlobe from '../canvas/DayNightGlobe';
import type { GlobeDrag } from '../canvas/DayNightGlobe';

const EMAIL = 'damian@codesolve.co.za';
const TIME_ZONE = 'Africa/Johannesburg';

const getLocalTime = () => {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIME_ZONE }).format(now);
  const hour = Number(new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', hour12: false, timeZone: TIME_ZONE }).format(now)) % 24;
  const isDay = hour >= 6 && hour < 18;
  const phase = hour < 5 ? 'Late night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night';
  return { time, isDay, phase };
};

const useLocalTime = () => {
  const [local, setLocal] = useState(getLocalTime);
  useEffect(() => {
    const id = setInterval(() => setLocal(getLocalTime()), 15000);
    return () => clearInterval(id);
  }, []);
  return local;
};

// Only render frames while the section is on screen
const useInView = <T extends Element>(ref: React.RefObject<T | null>) => {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '100px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
};

const ContactForm: React.FC = () => {
  const local = useLocalTime();
  const [copied, setCopied] = useState(false);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(globeWrapRef);
  const drag = useRef<GlobeDrag>({ total: 0, dragging: false });
  const lastX = useRef(0);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  // Mouse-only drag so touch users can still scroll past the globe
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    drag.current.dragging = true;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.dragging) return;
    drag.current.total += (e.clientX - lastX.current) * 0.006;
    lastX.current = e.clientX;
  };
  const endDrag = () => {
    drag.current.dragging = false;
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-slate-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Faint dot grid fading out towards the edges */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(148 163 184 / 0.5) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 70% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 50%, black, transparent)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-8 items-center">
          {/* Copy & actions */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2 variants={reveal} className="text-brand-500 font-semibold tracking-wide uppercase text-sm mb-3">Get in Touch</motion.h2>
            <motion.h3 variants={reveal} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.05]">
              Let's build something{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(to right, var(--brand-500), var(--brand-600))' }}
              >
                amazing
              </span>{' '}
              together.
            </motion.h3>
            <motion.p variants={reveal} className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed">
              Whether you have a specific project in mind or just want to explore possibilities, I'm here to help bring
              your ideas to life, wherever in the world you are.
            </motion.p>

            <motion.div variants={reveal} className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href="https://codesolve.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                Start Project Scoping
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              {/* Email pill with copy */}
              <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/60 backdrop-blur-md shadow-sm overflow-hidden">
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex flex-1 items-center gap-2.5 pl-4 pr-3 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-brand-500 transition-colors"
                >
                  <Mail className="w-4 h-4 text-brand-500" />
                  {EMAIL}
                </a>
                <button
                  onClick={copyEmail}
                  aria-label="Copy email address"
                  className="relative self-stretch px-3 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-brand-500 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? 'done' : 'copy'}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>

            <motion.p variants={reveal} className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              Project intake, custom SaaS scoping and cloud consulting are handled through the CodeSolve storefront.
            </motion.p>
          </motion.div>

          {/* Globe */}
          <motion.div
            ref={globeWrapRef}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[600px] mx-auto aspect-square"
          >
            {/* Soft brand glow behind the globe */}
            <div
              className="absolute inset-[18%] rounded-full blur-3xl opacity-15 dark:opacity-25 pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--brand-500), transparent 70%)' }}
            />

            <div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{ touchAction: 'pan-y' }}
            >
              <Suspense fallback={null}>
                <Canvas
                  camera={{ position: [0, 0, 3.55], fov: 40 }}
                  dpr={[1, 2]}
                  frameloop={inView ? 'always' : 'never'}
                  gl={{ antialias: true, alpha: true }}
                >
                  <DayNightGlobe drag={drag} />
                </Canvas>
              </Suspense>
            </div>

            {/* Local time chip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute left-0 sm:left-2 top-[10%] flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-950/70 backdrop-blur-md border border-white/60 dark:border-gray-800 shadow-lg pointer-events-none"
            >
              <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-50 dark:bg-brand-500/15">
                {local.isDay ? <Sun className="w-4 h-4 text-brand-500" /> : <Moon className="w-4 h-4 text-brand-500" />}
              </span>
              <span>
                <span className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-none mb-1">
                  {local.phase} in South Africa
                </span>
                <span className="block text-lg font-semibold tabular-nums text-gray-900 dark:text-white leading-none">
                  {local.time} <span className="text-xs font-medium text-gray-400">SAST</span>
                </span>
              </span>
            </motion.div>

            {/* Location chip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute right-0 sm:right-4 bottom-[12%] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-950/70 backdrop-blur-md border border-white/60 dark:border-gray-800 shadow-lg pointer-events-none"
            >
              <MapPin className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Based in SA, working worldwide</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default ContactForm;
