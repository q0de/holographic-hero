// ConnectionLines.jsx
// Simple decorative connection lines from patient center

import { motion } from 'framer-motion'

export function ConnectionLines({ medCount = 3, labCount = 3, isActive }) {
  const centerX = 196
  const centerY = 180

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 393 420"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradient for left lines (medications - cyan) */}
        <linearGradient id="lineGradientLeft" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
        </linearGradient>
        
        {/* Gradient for right lines (labs - green) */}
        <linearGradient id="lineGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
        </linearGradient>

        {/* Center glow */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>

        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Center glow */}
      <circle cx={centerX} cy={centerY} r="60" fill="url(#centerGlow)" />

      {/* Inner ring */}
      <motion.circle
        cx={centerX}
        cy={centerY}
        r="50"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="1"
        strokeOpacity="0.3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Connection lines to left (medications) */}
      {[...Array(medCount)].map((_, i) => {
        const spacing = 45
        const startY = centerY - ((medCount - 1) * spacing) / 2 + i * spacing
        return (
          <motion.line
            key={`med-line-${i}`}
            x1={centerX - 50}
            y1={startY}
            x2={95}
            y2={startY}
            stroke="url(#lineGradientLeft)"
            strokeWidth="1"
            strokeDasharray="4 2"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: isActive ? [0.4, 0.8, 0.4] : 0.6 
            }}
            transition={{ 
              pathLength: { duration: 0.5, delay: i * 0.1 },
              opacity: isActive ? { duration: 1.5, repeat: Infinity } : {}
            }}
          />
        )
      })}

      {/* Connection lines to right (labs) */}
      {[...Array(labCount)].map((_, i) => {
        const spacing = 45
        const startY = centerY - ((labCount - 1) * spacing) / 2 + i * spacing
        return (
          <motion.line
            key={`lab-line-${i}`}
            x1={centerX + 50}
            y1={startY}
            x2={298}
            y2={startY}
            stroke="url(#lineGradientRight)"
            strokeWidth="1"
            strokeDasharray="4 2"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: isActive ? [0.4, 0.8, 0.4] : 0.6 
            }}
            transition={{ 
              pathLength: { duration: 0.5, delay: i * 0.1 },
              opacity: isActive ? { duration: 1.5, repeat: Infinity } : {}
            }}
          />
        )
      })}
    </svg>
  )
}

export default ConnectionLines

