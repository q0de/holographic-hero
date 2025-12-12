// ThemeContext.jsx
// Color theme system for the app

import { createContext, useContext, useState } from 'react'

// Theme definitions with primary accent colors
export const themes = {
  cyan: {
    name: 'Cyan',
    emoji: '🔵',
    primary: 'rgb(14, 165, 233)',      // sky-500
    primaryRgb: '14, 165, 233',
    secondary: 'rgb(6, 182, 212)',     // cyan-500
    secondaryRgb: '6, 182, 212',
    accent: 'rgb(34, 211, 238)',       // cyan-400
    accentRgb: '34, 211, 238',
    glow: 'rgba(14, 165, 233, 0.5)',
    bg: 'from-slate-950 via-slate-900 to-cyan-950/30',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    hover: 'hover:border-cyan-400/50',
  },
  violet: {
    name: 'Violet',
    emoji: '🟣',
    primary: 'rgb(139, 92, 246)',      // violet-500
    primaryRgb: '139, 92, 246',
    secondary: 'rgb(168, 85, 247)',    // purple-500
    secondaryRgb: '168, 85, 247',
    accent: 'rgb(196, 181, 253)',      // violet-300
    accentRgb: '196, 181, 253',
    glow: 'rgba(139, 92, 246, 0.5)',
    bg: 'from-slate-950 via-purple-950/40 to-violet-950/30',
    cardBg: 'rgba(30, 20, 50, 0.85)',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    hover: 'hover:border-violet-400/50',
  },
  emerald: {
    name: 'Emerald',
    emoji: '🟢',
    primary: 'rgb(16, 185, 129)',      // emerald-500
    primaryRgb: '16, 185, 129',
    secondary: 'rgb(20, 184, 166)',    // teal-500
    secondaryRgb: '20, 184, 166',
    accent: 'rgb(110, 231, 183)',      // emerald-300
    accentRgb: '110, 231, 183',
    glow: 'rgba(16, 185, 129, 0.5)',
    bg: 'from-slate-950 via-emerald-950/30 to-teal-950/20',
    cardBg: 'rgba(15, 30, 25, 0.85)',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-400/50',
  },
  rose: {
    name: 'Rose',
    emoji: '🌸',
    primary: 'rgb(244, 63, 94)',       // rose-500
    primaryRgb: '244, 63, 94',
    secondary: 'rgb(236, 72, 153)',    // pink-500
    secondaryRgb: '236, 72, 153',
    accent: 'rgb(253, 164, 175)',      // rose-300
    accentRgb: '253, 164, 175',
    glow: 'rgba(244, 63, 94, 0.5)',
    bg: 'from-slate-950 via-rose-950/30 to-pink-950/20',
    cardBg: 'rgba(40, 15, 25, 0.85)',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    hover: 'hover:border-rose-400/50',
  },
  amber: {
    name: 'Amber',
    emoji: '🟡',
    primary: 'rgb(245, 158, 11)',      // amber-500
    primaryRgb: '245, 158, 11',
    secondary: 'rgb(234, 179, 8)',     // yellow-500
    secondaryRgb: '234, 179, 8',
    accent: 'rgb(252, 211, 77)',       // amber-300
    accentRgb: '252, 211, 77',
    glow: 'rgba(245, 158, 11, 0.5)',
    bg: 'from-slate-950 via-amber-950/20 to-orange-950/20',
    cardBg: 'rgba(35, 25, 15, 0.85)',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    hover: 'hover:border-amber-400/50',
  },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('cyan')
  
  const theme = themes[currentTheme]
  
  const cycleTheme = () => {
    const themeKeys = Object.keys(themes)
    const currentIndex = themeKeys.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeKeys.length
    setCurrentTheme(themeKeys[nextIndex])
  }
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme, 
      setCurrentTheme, 
      cycleTheme,
      themes 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

