import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, animate as animateValue, useReducedMotion } from 'framer-motion';
import { Timer } from 'lucide-react';
import TiltStage from './TiltStage';
import { useLoopStep } from './useLoopStep';

const lineItems = [
  { label: 'UI/UX Design', hours: 12 },
  { label: 'Frontend Build', hours: 24 },
  { label: 'Firebase Setup', hours: 6 },
];
const RATE = 450;
const SUBTOTAL = lineItems.reduce((sum, item) => sum + item.hours * RATE, 0);
const VAT = SUBTOTAL * 0.15;
const TOTAL = SUBTOTAL + VAT;

// e.g. "R 21 735.00" (space-grouped thousands)
const formatRand = (value: number) =>
  'R ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const formatClock = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
};

interface Props {
  active?: boolean;
}

const InvoiceVisual: React.FC<Props> = ({ active = true }) => {
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  // 0: line items drop in, 1: total counts up, 2: PAID stamp
  const { step, cycle } = useLoopStep([1700, 1500, 3400], animate);
  const [total, setTotal] = useState(TOTAL);
  const [elapsed, setElapsed] = useState(2 * 3600 + 14 * 60 + 36);

  useEffect(() => {
    if (!animate || step !== 1) return;
    const controls = animateValue(0, TOTAL, { duration: 1.1, ease: 'easeOut', onUpdate: setTotal });
    return () => controls.stop();
  }, [step, animate]);

  const shownTotal = !animate || step === 2 ? TOTAL : step === 0 ? 0 : total;

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [animate]);

  return (
    <TiltStage disabled={!active}>
      <div className="relative w-[250px] h-[300px] sm:w-[280px] sm:h-[340px]">
        {/* Paper stack behind */}
        <div className="absolute inset-0 rounded-xl bg-white/70 shadow-xl rotate-[-5deg] translate-x-[-10px] translate-y-[6px]" />
        <div className="absolute inset-0 rounded-xl bg-white/85 shadow-xl rotate-[3deg] translate-x-[8px] translate-y-[2px]" />

        {/* Invoice sheet */}
        <div className="relative w-full h-full rounded-xl bg-white shadow-2xl overflow-hidden px-5 py-5 sm:px-6 sm:py-6 flex flex-col">
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{ background: 'linear-gradient(to right, var(--brand-500), var(--brand-600))' }}
          />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[15px] sm:text-[17px] font-bold tracking-tight text-slate-900 leading-none">INVOICE</p>
              <p className="text-[9px] text-slate-400 font-medium mt-1">INV-0042 · Due in 14 days</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-800 leading-none">CodeSolve</p>
              <p className="text-[8px] text-slate-400 mt-1">Pty Ltd</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <p className="text-[7.5px] uppercase tracking-wider font-semibold text-slate-400">Billed to</p>
              <div className="mt-1 h-1.5 w-16 rounded-full bg-slate-200" />
              <div className="mt-1 h-1.5 w-11 rounded-full bg-slate-100" />
            </div>
            <div className="flex-1">
              <p className="text-[7.5px] uppercase tracking-wider font-semibold text-slate-400">Issued</p>
              <div className="mt-1 h-1.5 w-12 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* Line items */}
          <div className="mt-4 border-t border-slate-100 pt-2 space-y-1.5" key={cycle}>
            <div className="flex justify-between text-[7.5px] uppercase tracking-wider font-semibold text-slate-400">
              <span>Description</span>
              <span>Amount</span>
            </div>
            {lineItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={animate ? { opacity: 0, x: -12 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.32, duration: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-between text-[10px] sm:text-[11px]"
              >
                <span className="text-slate-700 font-medium">
                  {item.label}
                  <span className="text-slate-400 font-normal"> · {item.hours}h</span>
                </span>
                <span className="text-slate-800 tabular-nums">{formatRand(item.hours * RATE)}</span>
              </motion.div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-auto border-t border-slate-100 pt-2 space-y-1">
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>VAT (15%)</span>
              <span className="tabular-nums">{formatRand(VAT)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-semibold text-slate-700">Total</span>
              <span className="text-[15px] sm:text-[17px] font-bold text-slate-900 tabular-nums">{formatRand(shownTotal)}</span>
            </div>
          </div>

          {/* PAID stamp */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div
                initial={animate ? { opacity: 0, scale: 2.2, rotate: -24 } : false}
                animate={{ opacity: 1, scale: 1, rotate: -14 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="absolute right-6 top-[44%] px-3 py-1 rounded-md border-[2.5px] border-emerald-500 text-emerald-500 text-[18px] sm:text-[20px] font-black tracking-[0.15em] bg-white/70"
              >
                PAID
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating timer chip */}
        <motion.div
          animate={animate ? { y: [0, -6, 0] } : { y: 0 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-10 sm:-left-14 bottom-24 flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-900 text-white shadow-xl"
        >
          <span className="relative flex w-4 h-4 items-center justify-center">
            {animate && <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />}
            <Timer className="relative w-3.5 h-3.5 text-emerald-400" />
          </span>
          <span className="text-[10px] font-semibold tabular-nums">{formatClock(elapsed)}</span>
        </motion.div>
      </div>
    </TiltStage>
  );
};

export default InvoiceVisual;
