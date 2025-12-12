// TimePassageEffects.jsx
// Alternative time passage visualizations

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Effect 1: Particle Flow - particles flow from card position to Julia
function ParticleFlow({ isActive, onComplete, duration = 2000 }) {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }
    
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      startX: 50 + (Math.random() - 0.5) * 60, // Start from card area
      startY: 85, // Bottom of screen (cards area)
      endX: 50 + (Math.random() - 0.5) * 20, // End near Julia
      endY: 40 + (Math.random() - 0.5) * 10,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 0.4,
      size: 3 + Math.random() * 4,
      color: `hsl(${190 + Math.random() * 30}, 80%, 60%)`
    }))
    
    setParticles(newParticles)
    
    const timer = setTimeout(onComplete, duration)
    return () => clearTimeout(timer)
  }, [isActive, duration, onComplete])
  
  if (!isActive) return null
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          initial={{ 
            left: `${p.startX}%`, 
            top: `${p.startY}%`,
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            left: `${p.endX}%`, 
            top: `${p.endY}%`,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay,
            ease: 'easeInOut'
          }}
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`
          }}
        />
      ))}
      
      {/* Glow burst at Julia when particles arrive */}
      <motion.div
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 2.5], opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.2, delay: 0.8 }}
        style={{
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.6) 0%, transparent 70%)',
          filter: 'blur(10px)'
        }}
      />
    </div>
  )
}

// Effect 2: Progress Ring - ring around Julia fills up
function ProgressRing({ isActive, onComplete, duration = 2000, weeks = 2 }) {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      return
    }
    
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(elapsed / duration, 1)
      setProgress(newProgress)
      
      if (newProgress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }
    
    requestAnimationFrame(animate)
  }, [isActive, duration, onComplete])
  
  if (!isActive) return null
  
  const radius = 100
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] flex items-center justify-center">
      {/* Background blur + dim */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      />
      
      {/* Centered container */}
      <div className="relative flex items-center justify-center">
        {/* Progress ring */}
        <svg 
          className="absolute"
          style={{ transform: 'rotate(-90deg)' }}
          width={radius * 2 + 20} 
          height={radius * 2 + 20}
        >
          {/* Background ring */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="rgba(14, 165, 233, 0.15)"
            strokeWidth="3"
          />
          {/* Progress ring */}
          <motion.circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: 'drop-shadow(0 0 15px rgba(14, 165, 233, 0.9))' }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Week counter - centered */}
        <motion.div 
          className="text-white text-center z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="text-5xl font-bold"
            style={{ 
              color: '#0ea5e9',
              textShadow: '0 0 20px rgba(14, 165, 233, 0.8)'
            }}
            key={Math.floor(progress * weeks)}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {Math.floor(progress * weeks)}
          </motion.div>
          <div className="text-sm text-slate-300 uppercase tracking-widest mt-1">
            weeks
          </div>
        </motion.div>
      </div>
      
      {/* Completion pulse */}
      {progress >= 1 && (
        <motion.div
          className="absolute rounded-full"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: radius * 2,
            height: radius * 2,
            border: '3px solid rgba(14, 165, 233, 0.9)',
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.7), inset 0 0 20px rgba(14, 165, 233, 0.3)'
          }}
        />
      )}
    </div>
  )
}

// Effect 3: Timeline Animation - week counter animates through
function TimelineAnimation({ isActive, onComplete, duration = 2000, startWeek = 0, endWeek = 2 }) {
  const [currentWeek, setCurrentWeek] = useState(startWeek)
  
  useEffect(() => {
    if (!isActive) {
      setCurrentWeek(startWeek)
      return
    }
    
    const totalWeeks = endWeek - startWeek
    const weekDuration = duration / totalWeeks
    let week = startWeek
    
    const interval = setInterval(() => {
      week++
      setCurrentWeek(week)
      
      if (week >= endWeek) {
        clearInterval(interval)
        setTimeout(onComplete, 300)
      }
    }, weekDuration)
    
    return () => clearInterval(interval)
  }, [isActive, startWeek, endWeek, duration, onComplete])
  
  if (!isActive) return null
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {/* Dim overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      {/* Large week display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWeek}
            initial={{ scale: 2, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-7xl font-bold text-white" style={{ textShadow: '0 0 30px rgba(14, 165, 233, 0.8)' }}>
              Week {currentWeek}
            </div>
            <motion.div 
              className="h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mt-4 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Tick marks */}
      <div className="absolute bottom-[55%] left-1/2 -translate-x-1/2 flex gap-3">
        {Array.from({ length: endWeek - startWeek + 1 }, (_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full ${i <= currentWeek - startWeek ? 'bg-cyan-400' : 'bg-slate-600'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            style={i <= currentWeek - startWeek ? { boxShadow: '0 0 10px rgba(14, 165, 233, 0.8)' } : {}}
          />
        ))}
      </div>
    </div>
  )
}

// Effect 4: VHS Fast-Forward Effect
function VHSEffect({ isActive, onComplete, duration = 1500 }) {
  const [phase, setPhase] = useState('forward') // 'forward' | 'settle'
  
  useEffect(() => {
    if (!isActive) {
      setPhase('forward')
      return
    }
    
    // Fast forward phase
    const settleTimer = setTimeout(() => {
      setPhase('settle')
    }, duration * 0.7)
    
    const completeTimer = setTimeout(onComplete, duration)
    
    return () => {
      clearTimeout(settleTimer)
      clearTimeout(completeTimer)
    }
  }, [isActive, duration, onComplete])
  
  if (!isActive) return null
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
      {/* Scan lines */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'forward' ? 0.3 : 0 }}
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`
        }}
      />
      
      {/* RGB shift / glitch effect */}
      {phase === 'forward' && (
        <>
          <motion.div 
            className="absolute inset-0 mix-blend-screen"
            animate={{ x: [-2, 2, -2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            style={{ background: 'rgba(255, 0, 0, 0.1)' }}
          />
          <motion.div 
            className="absolute inset-0 mix-blend-screen"
            animate={{ x: [2, -2, 2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            style={{ background: 'rgba(0, 255, 255, 0.1)' }}
          />
        </>
      )}
      
      {/* Fast forward indicator */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: phase === 'forward' ? 1 : 0, 
          scale: phase === 'forward' ? 1 : 1.5 
        }}
      >
        <div className="flex items-center gap-1 text-white text-4xl font-bold" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
          <span>▶▶</span>
        </div>
      </motion.div>
      
      {/* Horizontal noise bars */}
      {phase === 'forward' && Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-2 bg-white/20"
          animate={{ 
            y: ['-100%', '1000%'],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: 0.3, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: 'linear'
          }}
          style={{ top: `${i * 20}%` }}
        />
      ))}
      
      {/* Settle flash */}
      {phase === 'settle' && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  )
}

// Main controller component with effect selection
export function TimePassageEffects({ 
  isActive, 
  onComplete, 
  duration = 2000,
  startWeek = 0,
  endWeek = 2,
  effectType = 'ring' // 'particles' | 'ring' | 'timeline' | 'vhs'
}) {
  const handleComplete = () => {
    onComplete?.()
  }
  
  return (
    <AnimatePresence>
      {effectType === 'particles' && (
        <ParticleFlow isActive={isActive} onComplete={handleComplete} duration={duration} />
      )}
      {effectType === 'ring' && (
        <ProgressRing isActive={isActive} onComplete={handleComplete} duration={duration} weeks={endWeek - startWeek} />
      )}
      {effectType === 'timeline' && (
        <TimelineAnimation isActive={isActive} onComplete={handleComplete} duration={duration} startWeek={startWeek} endWeek={endWeek} />
      )}
      {effectType === 'vhs' && (
        <VHSEffect isActive={isActive} onComplete={handleComplete} duration={duration} />
      )}
    </AnimatePresence>
  )
}

// Control panel for testing effects
export function TimeEffectsControl({ currentEffect, onEffectChange }) {
  const [showPanel, setShowPanel] = useState(false)
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])
  
  const effects = [
    { id: 'particles', name: 'Particles', icon: '✨' },
    { id: 'ring', name: 'Ring', icon: '⭕' },
    { id: 'timeline', name: 'Timeline', icon: '📅' },
    { id: 'vhs', name: 'VHS', icon: '📼' },
  ]
  
  if (!devControlsContainer) return null
  
  return createPortal(
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
        aria-label="Time effect settings"
        title="Time Effect"
      >
        ⏱️
      </button>
      
      {showPanel && (
        <div 
          className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl"
          style={{ width: '130px' }}
        >
          <div className="text-purple-400 font-bold mb-2">Time Effect</div>
          
          {effects.map(effect => (
            <button
              key={effect.id}
              onClick={() => onEffectChange(effect.id)}
              className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentEffect === effect.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>,
    devControlsContainer
  )
}

export default TimePassageEffects

