// FanPanels.jsx
// Radial fan/wedge panels behind patient for displaying info

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Floating delta indicator that animates up/down
function FloatingDeltaIndicator({ delta, isLab }) {
  if (!delta || delta === 0) return null
  
  const isPositive = delta > 0
  // For labs, lower is usually better (improvement = negative delta)
  const isImprovement = isLab ? delta < 0 : delta > 0
  const color = isImprovement ? '#22c55e' : '#ef4444'
  const formattedDelta = (isPositive ? '+' : '') + delta.toFixed(1).replace(/\.0$/, '')
  
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 font-bold text-base pointer-events-none z-20 whitespace-nowrap"
      initial={{ opacity: 1, y: 0, scale: 1.2 }}
      animate={{ 
        opacity: 0, 
        y: isPositive ? -28 : 28,
        scale: 1
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: "easeOut" }}
      style={{
        color,
        textShadow: `0 0 12px ${color}, 0 0 24px ${color}`,
        top: '-20px',
      }}
    >
      {formattedDelta}
    </motion.div>
  )
}

export function FanPanels({ medications = [], labs = [], interpolate, memoryDeltas = {}, shouldAnimate = false }) {
  // Track previous values for change animation
  const prevValuesRef = useRef({})
  const [valueChanges, setValueChanges] = useState({}) // { key: 'up' | 'down' | null }
  const [floatingDeltas, setFloatingDeltas] = useState({}) // { key: number } - actual delta values
  
  // Detect value changes and trigger animations
  useEffect(() => {
    const newChanges = {}
    
    // Check medications
    medications.forEach((med, i) => {
      const key = `med_${i}`
      const currentValue = med?.value ? parseFloat(interpolate ? interpolate(med.value.toString()) : med.value) : null
      const prevValue = prevValuesRef.current[key]
      
      if (prevValue !== undefined && currentValue !== null && currentValue !== prevValue) {
        newChanges[key] = currentValue > prevValue ? 'up' : 'down'
      }
      if (currentValue !== null) {
        prevValuesRef.current[key] = currentValue
      }
    })
    
    // Check labs
    labs.forEach((lab, i) => {
      const key = `lab_${i}`
      const currentValue = lab?.value ? parseFloat(interpolate ? interpolate(lab.value.toString()) : lab.value) : null
      const prevValue = prevValuesRef.current[key]
      
      if (prevValue !== undefined && currentValue !== null && currentValue !== prevValue) {
        newChanges[key] = currentValue > prevValue ? 'up' : 'down'
      }
      if (currentValue !== null) {
        prevValuesRef.current[key] = currentValue
      }
    })
    
    if (Object.keys(newChanges).length > 0) {
      setValueChanges(newChanges)
      // Clear changes after animation
      const timer = setTimeout(() => setValueChanges({}), 2000)
      return () => clearTimeout(timer)
    }
  }, [medications, labs, interpolate])
  
  // Process explicit memoryDeltas from game state for floating indicators
  useEffect(() => {
    if (Object.keys(memoryDeltas).length > 0) {
      // Map memoryDeltas keys (Lab_1, Medication_1, etc.) to display indices
      const newFloatingDeltas = {}
      
      // Check labs - their value contains template like "[Lab_1]"
      labs.forEach((lab, i) => {
        if (lab?.value) {
          const match = lab.value.match(/\[(\w+)\]/)
          if (match && memoryDeltas[match[1]] !== undefined) {
            newFloatingDeltas[`lab_${i}`] = memoryDeltas[match[1]]
          }
        }
      })
      
      // Check medications
      medications.forEach((med, i) => {
        if (med?.value) {
          const match = med.value.match(/\[(\w+)\]/)
          if (match && memoryDeltas[match[1]] !== undefined) {
            newFloatingDeltas[`med_${i}`] = memoryDeltas[match[1]]
          }
        }
      })
      
      if (Object.keys(newFloatingDeltas).length > 0) {
        setFloatingDeltas(newFloatingDeltas)
        // Clear after animation
        const timer = setTimeout(() => setFloatingDeltas({}), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [memoryDeltas, labs, medications])
  const [showControls, setShowControls] = useState(false)
  const [blurSettings, setBlurSettings] = useState({
    enabled: true,
    blurAmount: 8,        // px
    maskWidth: 70,        // % of ellipse width
    maskHeight: 80,       // % of ellipse height
    fadeStart: 50,        // % where blur starts
  })
  
  const updateSetting = (key, value) => {
    setBlurSettings(prev => ({ ...prev, [key]: value }))
  }
  
  const centerX = 50 // percent
  const centerY = 38 // percent - positioned at Julia's chest level
  
  // Create wedge clip path from center with variable radius for animation
  const createWedgePath = (startAngle, endAngle, radius = 120) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = 50 + radius * Math.cos(startRad)
    const y1 = 50 + radius * Math.sin(startRad)
    const x2 = 50 + radius * Math.cos(endRad)
    const y2 = 50 + radius * Math.sin(endRad)
    
    return `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`
  }
  
  // Fan configuration - 6 wedges fanning outward
  const wedgeAngle = 25
  const gapAngle = 6
  
  // Left side wedges (medications) - shifted DOWN to be more horizontal
  // -195 = 15° below horizontal left (was -175 = 5° above)
  const leftWedges = [
    { start: -195, end: -195 + wedgeAngle, shade: 0.5 },
    { start: -195 + wedgeAngle + gapAngle, end: -195 + 2*wedgeAngle + gapAngle, shade: 0.4 },
    { start: -195 + 2*wedgeAngle + 2*gapAngle, end: -195 + 3*wedgeAngle + 2*gapAngle, shade: 0.35 },
  ]
  
  // Right side wedges (labs) - shifted DOWN to be more horizontal
  // +15 = 15° below horizontal right (was -5 = 5° above)
  const rightWedges = [
    { start: 15 - wedgeAngle, end: 15, shade: 0.5 },
    { start: 15 - 2*wedgeAngle - gapAngle, end: 15 - wedgeAngle - gapAngle, shade: 0.4 },
    { start: 15 - 3*wedgeAngle - 2*gapAngle, end: 15 - 2*wedgeAngle - 2*gapAngle, shade: 0.35 },
  ]
  
  // Calculate clockwise animation order for wedges
  // Order: right wedges top-to-bottom, then left wedges bottom-to-top
  const getClockwiseDelay = (side, index, totalPerSide) => {
    const baseDelay = 0.12 // seconds between each wedge
    if (side === 'right') {
      // Right side: start from top (index 2) going down to (index 0)
      return (totalPerSide - 1 - index) * baseDelay
    } else {
      // Left side: continue after right, from bottom (index 2) to top (index 0)
      return (totalPerSide + (totalPerSide - 1 - index)) * baseDelay
    }
  }

  // Get label position within wedge - balanced distance
  const getLabelPosition = (startAngle, endAngle, distance = 0.32) => {
    const midAngle = (startAngle + endAngle) / 2
    const rad = (midAngle * Math.PI) / 180
    // Use same center as clip path (50%, 50%) and scale by distance into the wedge
    const wedgeRadius = 120 // same as clip path
    return {
      left: `${50 + distance * wedgeRadius * Math.cos(rad)}%`,
      top: `${50 + distance * wedgeRadius * Math.sin(rad)}%`
    }
  }

  // Render controls outside phone frame via portal
  const devControlsContainer = document.getElementById('dev-controls')
  
  return (
    <>
      {/* Radial Controls - rendered outside phone frame */}
      {devControlsContainer && createPortal(
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
            aria-label="Radial settings"
            title="Radial/Blur"
          >
            📐
          </button>
          
          {showControls && (
            <div 
              className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl"
              style={{ width: '160px' }}
            >
              <div className="text-cyan-400 font-bold mb-2">Edge Blur</div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={blurSettings.enabled}
                  onChange={(e) => updateSetting('enabled', e.target.checked)}
                  className="w-3 h-3 accent-cyan-500"
                />
                <span className="text-slate-300">Enabled</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Blur</span>
                <input
                  type="range" min="0" max="20" value={blurSettings.blurAmount}
                  onChange={(e) => updateSetting('blurAmount', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-6 text-right text-cyan-300">{blurSettings.blurAmount}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Width</span>
                <input
                  type="range" min="30" max="100" value={blurSettings.maskWidth}
                  onChange={(e) => updateSetting('maskWidth', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-6 text-right text-cyan-300">{blurSettings.maskWidth}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Height</span>
                <input
                  type="range" min="30" max="100" value={blurSettings.maskHeight}
                  onChange={(e) => updateSetting('maskHeight', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-6 text-right text-cyan-300">{blurSettings.maskHeight}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Fade</span>
                <input
                  type="range" min="0" max="80" value={blurSettings.fadeStart}
                  onChange={(e) => updateSetting('fadeStart', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-6 text-right text-cyan-300">{blurSettings.fadeStart}</span>
              </label>
            </div>
          )}
        </div>,
        devControlsContainer
      )}
    
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {/* Edge blur overlay - blurs content near screen edges */}
      {blurSettings.enabled && (
        <div 
          className="absolute inset-0 pointer-events-none z-[6]"
          style={{
            backdropFilter: `blur(${blurSettings.blurAmount}px)`,
            WebkitBackdropFilter: `blur(${blurSettings.blurAmount}px)`,
            maskImage: `
              radial-gradient(ellipse ${blurSettings.maskWidth}% ${blurSettings.maskHeight}% at 50% 45%, transparent ${blurSettings.fadeStart}%, black 100%)
            `,
            WebkitMaskImage: `
              radial-gradient(ellipse ${blurSettings.maskWidth}% ${blurSettings.maskHeight}% at 50% 45%, transparent ${blurSettings.fadeStart}%, black 100%)
            `,
          }}
        />
      )}
      {/* Left wedges - Medications (glassmorphic card style) */}
      {leftWedges.map((wedge, i) => {
        const med = medications[i]
        const pos = getLabelPosition(wedge.start, wedge.end)
        const value = med?.value ? (interpolate ? interpolate(med.value.toString()) : med.value) : null
        const clockwiseDelay = getClockwiseDelay('left', i, leftWedges.length)
        
        return (
          <motion.div
            key={`left-${i}`}
            className="absolute inset-0"
            initial={{ 
              opacity: 0,
              clipPath: createWedgePath(wedge.start, wedge.end, 0)
            }}
            animate={shouldAnimate ? { 
              opacity: 1,
              clipPath: createWedgePath(wedge.start, wedge.end, 120)
            } : { 
              opacity: 0,
              clipPath: createWedgePath(wedge.start, wedge.end, 0)
            }}
            transition={{ 
              delay: clockwiseDelay, 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1] // smooth ease-out
            }}
          >
            {/* Wedge panel - lower opacity */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: createWedgePath(wedge.start, wedge.end),
                background: 'rgba(15, 23, 42, 0.45)',
              }}
            />
            {/* Thin border lines - fade toward center */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Gradient that fades FROM edge TO center */}
                <linearGradient id={`wedgeBorderLeft1_${i}`} gradientUnits="userSpaceOnUse"
                  x1={(() => { const r = 120; return 50 + r * Math.cos((wedge.start * Math.PI) / 180); })()}
                  y1={(() => { const r = 120; return 50 + r * Math.sin((wedge.start * Math.PI) / 180); })()}
                  x2="50" y2="50"
                >
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`wedgeBorderLeft2_${i}`} gradientUnits="userSpaceOnUse"
                  x1={(() => { const r = 120; return 50 + r * Math.cos((wedge.end * Math.PI) / 180); })()}
                  y1={(() => { const r = 120; return 50 + r * Math.sin((wedge.end * Math.PI) / 180); })()}
                  x2="50" y2="50"
                >
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Draw each edge line separately for proper gradient */}
              <line
                x1="50" y1="50"
                x2={(() => { const r = 120; return 50 + r * Math.cos((wedge.start * Math.PI) / 180); })()}
                y2={(() => { const r = 120; return 50 + r * Math.sin((wedge.start * Math.PI) / 180); })()}
                stroke={`url(#wedgeBorderLeft1_${i})`}
                strokeWidth="0.3"
              />
              <line
                x1="50" y1="50"
                x2={(() => { const r = 120; return 50 + r * Math.cos((wedge.end * Math.PI) / 180); })()}
                y2={(() => { const r = 120; return 50 + r * Math.sin((wedge.end * Math.PI) / 180); })()}
                stroke={`url(#wedgeBorderLeft2_${i})`}
                strokeWidth="0.3"
              />
            </svg>
            {/* Glowing accent effect - subtle */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: createWedgePath(wedge.start, wedge.end),
                boxShadow: 'inset 0 0 15px rgba(14, 165, 233, 0.1)',
                background: `linear-gradient(${wedge.start + 45}deg, rgba(14, 165, 233, 0.08) 0%, transparent 40%)`,
              }}
            />
            
            {/* Label content - compact with all info */}
            {med && value && (
              <div
                className="absolute text-center"
                style={{
                  ...pos,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="text-[8px] uppercase tracking-wider text-cyan-400/80 font-medium">
                  {med.shortName || med.name?.split(' ')[0]}
                </div>
                <div className="relative">
                  {/* Floating delta indicator */}
                  <AnimatePresence>
                    {floatingDeltas[`med_${i}`] && (
                      <FloatingDeltaIndicator 
                        key={`delta-med-${i}`}
                        delta={floatingDeltas[`med_${i}`]} 
                        isLab={false} 
                      />
                    )}
                  </AnimatePresence>
                  {/* Change indicator arrow */}
                  <AnimatePresence>
                    {valueChanges[`med_${i}`] && (
                      <motion.div
                        initial={{ opacity: 0, y: valueChanges[`med_${i}`] === 'up' ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 text-lg"
                        style={{ 
                          color: valueChanges[`med_${i}`] === 'up' ? '#22c55e' : '#ef4444',
                          textShadow: `0 0 10px ${valueChanges[`med_${i}`] === 'up' ? '#22c55e' : '#ef4444'}`
                        }}
                      >
                        {valueChanges[`med_${i}`] === 'up' ? '↑' : '↓'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div 
                    className="text-base font-bold text-white leading-tight" 
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
                    animate={(valueChanges[`med_${i}`] || floatingDeltas[`med_${i}`]) ? {
                      scale: [1, 1.2, 1],
                      color: (valueChanges[`med_${i}`] === 'up' || floatingDeltas[`med_${i}`] > 0) ? ['#ffffff', '#22c55e', '#ffffff'] : ['#ffffff', '#ef4444', '#ffffff']
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {value}
                    {med.unit && <span className="text-[9px] text-cyan-300/70 ml-0.5 font-normal">{med.unit}</span>}
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
      
      {/* Right wedges - Labs (glassmorphic card style) */}
      {rightWedges.map((wedge, i) => {
        const lab = labs[i]
        const pos = getLabelPosition(wedge.start, wedge.end)
        const value = lab?.value ? (interpolate ? interpolate(lab.value.toString()) : lab.value) : null
        const clockwiseDelay = getClockwiseDelay('right', i, rightWedges.length)
        
        // Determine status
        let status = 'default'
        let glowColor = 'rgba(34, 197, 94, 0.3)'
        let textColor = 'text-white'
        let accentColor = '#22c55e'
        
        if (lab?.ranges && value) {
          const num = parseFloat(value)
          if (lab.ranges.danger && num >= lab.ranges.danger[0]) {
            status = 'danger'
            glowColor = 'rgba(239, 68, 68, 0.4)'
            textColor = 'text-red-400'
            accentColor = '#ef4444'
          } else if (lab.ranges.elevated && num >= lab.ranges.elevated[0]) {
            status = 'elevated'
            glowColor = 'rgba(245, 158, 11, 0.4)'
            textColor = 'text-amber-400'
            accentColor = '#f59e0b'
          } else if (lab.ranges.normal && num >= lab.ranges.normal[0] && num <= lab.ranges.normal[1]) {
            status = 'normal'
            glowColor = 'rgba(34, 197, 94, 0.3)'
            textColor = 'text-green-400'
            accentColor = '#22c55e'
          }
        }
        
        return (
          <motion.div
            key={`right-${i}`}
            className="absolute inset-0"
            initial={{ 
              opacity: 0,
              clipPath: createWedgePath(wedge.start, wedge.end, 0)
            }}
            animate={shouldAnimate ? { 
              opacity: 1,
              clipPath: createWedgePath(wedge.start, wedge.end, 120)
            } : { 
              opacity: 0,
              clipPath: createWedgePath(wedge.start, wedge.end, 0)
            }}
            transition={{ 
              delay: clockwiseDelay, 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1] // smooth ease-out
            }}
          >
            {/* Wedge panel - lower opacity */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: createWedgePath(wedge.start, wedge.end),
                background: 'rgba(15, 23, 42, 0.45)',
              }}
            />
            {/* Thin border lines - fade toward center */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Gradient that fades FROM edge TO center */}
                <linearGradient id={`wedgeBorderRight1_${i}`} gradientUnits="userSpaceOnUse"
                  x1={(() => { const r = 120; return 50 + r * Math.cos((wedge.start * Math.PI) / 180); })()}
                  y1={(() => { const r = 120; return 50 + r * Math.sin((wedge.start * Math.PI) / 180); })()}
                  x2="50" y2="50"
                >
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
                  <stop offset="60%" stopColor={accentColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`wedgeBorderRight2_${i}`} gradientUnits="userSpaceOnUse"
                  x1={(() => { const r = 120; return 50 + r * Math.cos((wedge.end * Math.PI) / 180); })()}
                  y1={(() => { const r = 120; return 50 + r * Math.sin((wedge.end * Math.PI) / 180); })()}
                  x2="50" y2="50"
                >
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
                  <stop offset="60%" stopColor={accentColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Draw each edge line separately for proper gradient */}
              <line
                x1="50" y1="50"
                x2={(() => { const r = 120; return 50 + r * Math.cos((wedge.start * Math.PI) / 180); })()}
                y2={(() => { const r = 120; return 50 + r * Math.sin((wedge.start * Math.PI) / 180); })()}
                stroke={`url(#wedgeBorderRight1_${i})`}
                strokeWidth="0.3"
              />
              <line
                x1="50" y1="50"
                x2={(() => { const r = 120; return 50 + r * Math.cos((wedge.end * Math.PI) / 180); })()}
                y2={(() => { const r = 120; return 50 + r * Math.sin((wedge.end * Math.PI) / 180); })()}
                stroke={`url(#wedgeBorderRight2_${i})`}
                strokeWidth="0.3"
              />
            </svg>
            {/* Glowing accent effect based on status - subtle */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: createWedgePath(wedge.start, wedge.end),
                boxShadow: `inset 0 0 15px ${glowColor.replace('0.3', '0.15').replace('0.4', '0.2')}`,
                background: `linear-gradient(${wedge.end - 45}deg, ${glowColor.replace('0.3', '0.1').replace('0.4', '0.15')} 0%, transparent 40%)`,
              }}
            />
            
            {/* Label content - compact with all info */}
            {lab && value && (
              <div
                className="absolute text-center"
                style={{
                  ...pos,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  {status !== 'default' && (
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-pulse" 
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                  <span className="text-[8px] uppercase tracking-wider font-medium" style={{ color: accentColor, opacity: 0.9 }}>
                    {lab.shortName || lab.name}
                  </span>
                </div>
                <div className="relative">
                  {/* Floating delta indicator */}
                  <AnimatePresence>
                    {floatingDeltas[`lab_${i}`] && (
                      <FloatingDeltaIndicator 
                        key={`delta-lab-${i}`}
                        delta={floatingDeltas[`lab_${i}`]} 
                        isLab={true} 
                      />
                    )}
                  </AnimatePresence>
                  {/* Change indicator arrow */}
                  <AnimatePresence>
                    {valueChanges[`lab_${i}`] && (
                      <motion.div
                        initial={{ opacity: 0, y: valueChanges[`lab_${i}`] === 'up' ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 text-lg"
                        style={{ 
                          color: valueChanges[`lab_${i}`] === 'up' ? '#ef4444' : '#22c55e',
                          textShadow: `0 0 10px ${valueChanges[`lab_${i}`] === 'up' ? '#ef4444' : '#22c55e'}`
                        }}
                      >
                        {valueChanges[`lab_${i}`] === 'up' ? '↑' : '↓'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div 
                    className={`text-base font-bold ${textColor} leading-tight`} 
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
                    animate={(valueChanges[`lab_${i}`] || floatingDeltas[`lab_${i}`]) ? {
                      scale: [1, 1.2, 1],
                      color: (valueChanges[`lab_${i}`] === 'up' || floatingDeltas[`lab_${i}`] > 0) ? ['currentColor', '#ef4444', 'currentColor'] : ['currentColor', '#22c55e', 'currentColor']
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {value}
                    {lab.unit && <span className="text-[9px] opacity-70 ml-0.5 font-normal">{lab.unit}</span>}
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
    </>
  )
}

export default FanPanels

