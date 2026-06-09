import React, { createContext, useContext, useEffect, useState } from 'react';

export type TimeOfDay = 'auto' | 'pre-dawn' | 'sunrise' | 'daytime' | 'sunset' | 'dusk' | 'night';

export interface ThemePalette {
  primary: string;
  secondary: string;
  isDark: boolean;
  ambientIntensity: number;
}

export const palettes: Record<Exclude<TimeOfDay, 'auto'>, ThemePalette> = {
  'pre-dawn': { primary: '#8b5cf6', secondary: '#f43f5e', isDark: true, ambientIntensity: 0.15 }, // Vibrant Violet to Rose
  'sunrise': { primary: '#f97316', secondary: '#fcd34d', isDark: false, ambientIntensity: 0.6 },
  'daytime': { primary: '#0ea5e9', secondary: '#0284c7', isDark: false, ambientIntensity: 1.0 },
  'sunset': { primary: '#f43f5e', secondary: '#ea580c', isDark: false, ambientIntensity: 0.7 },
  'dusk': { primary: '#9333ea', secondary: '#c026d3', isDark: true, ambientIntensity: 0.35 },
  'night': { primary: '#4f46e5', secondary: '#2dd4bf', isDark: true, ambientIntensity: 0.1 }, // Electric Indigo to Teal
};

export const getTimeOfDayFromDate = (date: Date): Exclude<TimeOfDay, 'auto'> => {
  const hour = date.getHours();
  if (hour >= 0 && hour < 6) return 'pre-dawn';
  if (hour >= 6 && hour < 9) return 'sunrise';
  if (hour >= 9 && hour < 16) return 'daytime';
  if (hour >= 16 && hour < 19) return 'sunset';
  if (hour >= 19 && hour < 21) return 'dusk';
  return 'night'; // 21 to 24
};

export const getTimeDisplayName = (time: TimeOfDay): string => {
  switch (time) {
    case 'auto': return 'Auto (Real-time)';
    case 'pre-dawn': return 'Pre-Dawn';
    case 'sunrise': return 'Sunrise';
    case 'daytime': return 'Daytime';
    case 'sunset': return 'Sunset';
    case 'dusk': return 'Dusk';
    case 'night': return 'Night';
  }
};

interface ThemeContextType {
  mode: TimeOfDay;
  setMode: (mode: TimeOfDay) => void;
  activeTimeOfDay: Exclude<TimeOfDay, 'auto'>;
  palette: ThemePalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TimeOfDay>(() => {
    return (localStorage.getItem('theme_mode') as TimeOfDay) || 'auto';
  });

  const [activeTimeOfDay, setActiveTimeOfDay] = useState<Exclude<TimeOfDay, 'auto'>>(() => {
    if (mode === 'auto') return getTimeOfDayFromDate(new Date());
    return mode as Exclude<TimeOfDay, 'auto'>;
  });

  // Automatically check the time every 60 seconds if in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;
    
    const calculateTime = () => {
      setActiveTimeOfDay(getTimeOfDayFromDate(new Date()));
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 60000); 
    return () => clearInterval(interval);
  }, [mode]);

  // Handle manual override
  const setMode = (newMode: TimeOfDay) => {
    setModeState(newMode);
    localStorage.setItem('theme_mode', newMode);
    if (newMode !== 'auto') {
      setActiveTimeOfDay(newMode as Exclude<TimeOfDay, 'auto'>);
    } else {
      setActiveTimeOfDay(getTimeOfDayFromDate(new Date()));
    }
  };

  const palette = palettes[activeTimeOfDay];

  // Apply base CSS variables and light/dark class
  useEffect(() => {
    const root = document.documentElement;
    
    // Inject dynamic brand colors
    root.style.setProperty('--brand-500', palette.primary);
    root.style.setProperty('--brand-600', palette.secondary);
    
    // Handle light/dark mode root class
    if (palette.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [palette]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, activeTimeOfDay, palette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
