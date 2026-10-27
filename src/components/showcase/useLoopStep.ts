import { useEffect, useState } from 'react';

// Cycles through steps 0..durations.length-1, holding each for its duration (ms).
// When inactive it rests on the last step, so paused visuals show their "finished" state.
// `cycle` increments on every loop so children can be re-keyed to replay entrance animations.
export const useLoopStep = (durations: number[], active: boolean) => {
  const [state, setState] = useState({ step: 0, cycle: 0 });
  const key = durations.join(',');

  useEffect(() => {
    if (!active) return;
    const steps = key.split(',').map(Number);
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        current = (current + 1) % steps.length;
        setState(prev => ({ step: current, cycle: current === 0 ? prev.cycle + 1 : prev.cycle }));
        tick();
      }, steps[current]);
    };
    tick();
    return () => {
      clearTimeout(timer);
      setState(prev => ({ step: 0, cycle: prev.cycle + 1 }));
    };
  }, [active, key]);

  return active ? state : { step: durations.length - 1, cycle: state.cycle };
};
