import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Lock, Globe, GitBranch, Zap, Database, Check } from 'lucide-react';
import TiltStage from './TiltStage';
import { useLoopStep } from './useLoopStep';

// Architecture nodes on a 170 x 150 SVG grid (Edge -> CI/CD -> Functions -> Firestore)
const nodes = [
  { id: 'edge', label: 'Edge', x: 30, y: 28, Icon: Globe },
  { id: 'ci', label: 'CI/CD', x: 140, y: 28, Icon: GitBranch },
  { id: 'fn', label: 'Functions', x: 140, y: 112, Icon: Zap },
  { id: 'db', label: 'Firestore', x: 30, y: 112, Icon: Database },
];

const links: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]];

interface Props {
  active?: boolean;
}

const CorporateSiteVisual: React.FC<Props> = ({ active = true }) => {
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  // 0: idle, 1: lead submitted toast
  const { step } = useLoopStep([3200, 2600], animate);

  return (
    <TiltStage disabled={!active}>
      <div className="relative w-[340px] h-[230px] sm:w-[420px] sm:h-[270px] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 h-9 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-slate-500 font-medium">
            <Lock className="w-2.5 h-2.5" />
            codesolve.co.za
          </div>
          <div className="w-10" />
        </div>

        {/* Page body */}
        <div className="relative flex-1 grid grid-cols-[1fr_auto] gap-2 px-5 py-4">
          {/* Mini hero */}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-500 mb-1.5">Cloud & Web Studio</span>
            <p className="text-[15px] sm:text-[19px] leading-[1.1] font-bold tracking-tight text-slate-900">
              Scale Without
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(to right, var(--brand-500), var(--brand-600))' }}
              >
                Bottlenecks.
              </span>
            </p>
            <div className="mt-2.5 space-y-1.5">
              <div className="h-1.5 w-[88%] rounded-full bg-slate-200" />
              <div className="h-1.5 w-[64%] rounded-full bg-slate-200" />
            </div>
            <div className="mt-3 flex gap-1.5">
              <span
                className="px-2.5 py-1 rounded-md text-[8px] sm:text-[9px] font-semibold text-white"
                style={{ background: 'linear-gradient(to right, var(--brand-500), var(--brand-600))' }}
              >
                Start Scoping
              </span>
              <span className="px-2.5 py-1 rounded-md text-[8px] sm:text-[9px] font-semibold text-slate-600 border border-slate-200">
                Architecture
              </span>
            </div>
          </div>

          {/* Architecture map */}
          <svg viewBox="0 0 170 140" className="w-[140px] sm:w-[170px] h-auto self-center overflow-visible">
            {links.map(([a, b], i) => (
              <line
                key={i}
                x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
                stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray={i === 4 ? '3 3' : undefined}
              />
            ))}
            {animate && links.map(([a, b], i) => (
              <motion.circle
                key={`p-${i}`}
                r={2.6}
                fill="var(--brand-500)"
                initial={{ cx: nodes[a].x, cy: nodes[a].y, opacity: 0 }}
                animate={{
                  cx: [nodes[a].x, nodes[b].x],
                  cy: [nodes[a].y, nodes[b].y],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.45, repeatDelay: 0.6 }}
              />
            ))}
            {nodes.map((n, i) => (
              <g key={n.id}>
                {animate && (
                  <motion.circle
                    cx={n.x} cy={n.y} r={15}
                    fill="var(--brand-500)"
                    initial={{ opacity: 0.18, scale: 1 }}
                    animate={{ opacity: [0.18, 0, 0.18], scale: [1, 1.5, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5 }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                )}
                <circle cx={n.x} cy={n.y} r={14} fill="white" stroke="var(--brand-500)" strokeWidth={1.5} />
                <foreignObject x={n.x - 7} y={n.y - 7} width={14} height={14}>
                  <n.Icon className="w-[14px] h-[14px] text-slate-700" strokeWidth={2} />
                </foreignObject>
                <text x={n.x} y={n.y + 26} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 8.5, fontWeight: 600 }}>
                  {n.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Lead captured toast */}
          <AnimatePresence>
            {(step === 1 || !animate) && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="absolute left-5 bottom-3 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg bg-slate-900 text-white shadow-lg"
              >
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                </span>
                <span className="text-[9px] font-medium">New lead saved to Firestore</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TiltStage>
  );
};

export default CorporateSiteVisual;
