import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useAnimationFrame, animate as animateValue } from 'framer-motion';
import { Lock, LockOpen, ShieldCheck, Globe, CreditCard, StickyNote } from 'lucide-react';
import TiltStage from './TiltStage';
import { useLoopStep } from './useLoopStep';

const items = [
  { Icon: Globe, name: 'github.com', detail: 'Login · ••••••••••••' },
  { Icon: CreditCard, name: 'Visa Platinum', detail: '•••• •••• •••• 4821' },
  { Icon: StickyNote, name: 'Recovery codes', detail: 'Secure note · 8 codes' },
];

const HEX = '0123456789abcdef';
const randomHex = (length: number) => Array.from({ length }, () => HEX[Math.floor(Math.random() * 16)]).join('');
const STATIC_CIPHER = ['9f3ac0e17b42d85e6a', '4be1907dfa2c63b8e0', 'c27d5a8e01f94b3d76'];

// Continuously re-rolls ciphertext strings while active
const useCiphertext = (active: boolean) => {
  const [cipher, setCipher] = useState(STATIC_CIPHER);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setCipher(STATIC_CIPHER.map(s => randomHex(s.length))), 90);
    return () => clearInterval(id);
  }, [active]);
  return cipher;
};

interface Props {
  active?: boolean;
}

const VaultVisual: React.FC<Props> = ({ active = true }) => {
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  // 0: unlocked (decrypted locally), 1: locked (ciphertext only)
  const { step } = useLoopStep([2800, 3400], animate);
  const unlocked = step === 0;
  const cipher = useCiphertext(animate && !unlocked);

  const ticks = Array.from({ length: 48 }, (_, i) => i);

  // Dial angle: drifts while locked, then springs forward to the next quarter turn when unlocking
  const angle = useMotionValue(0);
  const innerAngle = useTransform(angle, v => -v * 1.4);
  const springing = useRef(false);

  useAnimationFrame((_, delta) => {
    if (!animate || unlocked || springing.current) return;
    angle.set(angle.get() + delta * 0.018);
  });

  useEffect(() => {
    if (!animate || !unlocked) return;
    springing.current = true;
    const target = Math.ceil(angle.get() / 90) * 90 + 90;
    const controls = animateValue(angle, target, {
      type: 'spring', stiffness: 70, damping: 13,
      onComplete: () => { springing.current = false; },
    });
    return () => { controls.stop(); springing.current = false; };
  }, [unlocked, animate, angle]);

  return (
    <TiltStage disabled={!active}>
      <div className="relative w-[340px] h-[220px] sm:w-[420px] sm:h-[260px] rounded-2xl bg-slate-950 shadow-2xl overflow-hidden flex items-center gap-4 sm:gap-6 px-5 sm:px-7">
        {/* Ambient glow */}
        <div
          className="absolute -left-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'var(--brand-500)' }}
        />
        <div
          className="absolute -right-20 -bottom-24 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: 'var(--brand-600)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px' }}
        />

        {/* Vault dial */}
        <div className="relative w-[118px] h-[118px] sm:w-[150px] sm:h-[150px] shrink-0">
          <motion.svg
            viewBox="0 0 150 150"
            className="absolute inset-0 w-full h-full"
            style={{ rotate: angle }}
          >
            <circle cx="75" cy="75" r="72" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            {ticks.map(i => {
              const angle = (i / ticks.length) * Math.PI * 2;
              const long = i % 4 === 0;
              const r1 = long ? 60 : 64;
              return (
                <line
                  key={i}
                  x1={75 + Math.cos(angle) * r1} y1={75 + Math.sin(angle) * r1}
                  x2={75 + Math.cos(angle) * 69} y2={75 + Math.sin(angle) * 69}
                  stroke={long ? 'var(--brand-500)' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={long ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}
          </motion.svg>

          <motion.svg
            viewBox="0 0 150 150"
            className="absolute inset-0 w-full h-full"
            style={{ rotate: innerAngle }}
          >
            <circle cx="75" cy="75" r="50" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 5" />
            {[0, 1, 2, 3, 4, 5].map(i => {
              const angle = (i / 6) * Math.PI * 2;
              return <circle key={i} cx={75 + Math.cos(angle) * 50} cy={75 + Math.sin(angle) * 50} r={3} fill="rgba(255,255,255,0.55)" />;
            })}
          </motion.svg>

          {/* Core */}
          <motion.div
            className="absolute inset-[30%] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.4)]"
            style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-600))' }}
            animate={animate && unlocked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={unlocked ? 'open' : 'closed'}
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                transition={{ duration: 0.25 }}
              >
                {unlocked
                  ? <LockOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  : <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Vault items */}
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-white text-[12px] sm:text-[13px] font-semibold tracking-tight">Aegis Vault</span>
            </div>
            <span className={`text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors duration-500 ${
              unlocked ? 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10' : 'text-slate-300 border-white/15 bg-white/5'
            }`}>
              {unlocked ? 'Unlocked' : 'Encrypted'}
            </span>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {items.map(({ Icon, name, detail }, i) => (
              <div key={name} className="flex items-center gap-2.5 px-2.5 py-1.5 sm:py-2 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 text-white/80" />
                </span>
                <div className="min-w-0 flex-1 h-[24px] relative overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    {unlocked ? (
                      <motion.div
                        key="plain"
                        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        className="absolute inset-0"
                      >
                        <p className="text-[10px] sm:text-[11px] text-white font-medium leading-tight truncate">{name}</p>
                        <p className="text-[8.5px] sm:text-[9px] text-white/50 leading-tight truncate">{detail}</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cipher"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex items-center"
                      >
                        <p
                          className="font-mono text-[9.5px] sm:text-[10.5px] truncate tracking-tight"
                          style={{ color: 'color-mix(in oklab, var(--brand-500) 60%, white)' }}
                        >
                          {cipher[i]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 font-mono text-[8px] sm:text-[8.5px] text-white/40 tracking-tight">
            AES-256-GCM · PBKDF2 650k · zero-knowledge
          </p>
        </div>
      </div>
    </TiltStage>
  );
};

export default VaultVisual;
