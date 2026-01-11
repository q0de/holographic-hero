// SpiderGraph.jsx
// Radar/Spider chart overlay for patient vitals

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export function SpiderGraph({ 
  isOpen, 
  onClose, 
  labs = [], 
  medications = [],
  patient,
  currentWeek = 0,
  interpolate,
  memory = {}
}) {
  const { theme } = useTheme()
  
  // Spider graph controls
  const [showControls, setShowControls] = useState(false)
  const [spiderSettings, setSpiderSettings] = useState({
    top: 38, // percentage
    left: 50, // percentage
    scale: 1.0,
    opacity: 1
  })
  
  const updateSpiderSetting = (key, value) => {
    setSpiderSettings(prev => ({ ...prev, [key]: value }))
  }
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spiderGraphSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        setSpiderSettings(settings)
      }
    } catch (e) {
      console.error('Failed to load spider graph settings:', e)
    }
  }, [])

  // Get portal container after mount
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])
  
  // Helper to get interpolated value
  const getValue = (template) => {
    if (!template) return 0
    if (interpolate) {
      const interpolated = interpolate(template.toString())
      return parseFloat(interpolated) || 0
    }
    return parseFloat(template) || 0
  }
  
  // Get color based on value and ranges
  const getValueColor = (value, ranges) => {
    if (!ranges) return '#64748b'
    if (ranges.danger && value >= ranges.danger[0]) return '#ef4444'
    if (ranges.elevated && value >= ranges.elevated[0]) return '#f59e0b'
    if (ranges.normal && value >= ranges.normal[0] && value <= ranges.normal[1]) return '#22c55e'
    return '#64748b'
  }
  
  // Combine data points for the spider graph
  const dataPoints = [
    ...labs.map(lab => {
      const value = getValue(lab.value)
      return {
        label: lab.shortName || lab.name,
        value: value,
        max: lab.ranges?.danger?.[0] * 1.5 || 300,
        color: getValueColor(value, lab.ranges),
        unit: lab.unit
      }
    }),
    ...medications.slice(0, 3).map(med => {
      const value = getValue(med.value)
      return {
        label: med.shortName || med.name?.split(' ')[0],
        value: value,
        max: 15,
        color: 'rgb(139, 92, 246)', // violet-500
        unit: med.unit
      }
    })
  ].slice(0, 6) // Max 6 points for the spider

  // Fill with placeholder if less than 3 points
  while (dataPoints.length < 3) {
    dataPoints.push({ label: '—', value: 0, max: 100, color: '#64748b' })
  }

  const numPoints = dataPoints.length
  const angleStep = (2 * Math.PI) / numPoints
  const centerX = 200
  const centerY = 200
  const maxRadius = 140

  // Calculate polygon points for the data
  const getPoint = (index, value, max) => {
    const angle = (index * angleStep) - Math.PI / 2 // Start from top
    const normalizedValue = Math.min(value / max, 1)
    const radius = normalizedValue * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  // Create polygon path for data
  const dataPath = dataPoints
    .map((point, i) => {
      const { x, y } = getPoint(i, point.value, point.max)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ') + ' Z'

  // Create grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <>
      {/* Spider Graph Controls - rendered outside phone frame, always visible */}
      {devControlsContainer && createPortal(
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
            aria-label="Spider graph settings"
            title="Spider Graph"
          >
            🕸️
          </button>
          
          {showControls && (
            <div 
              className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl"
              style={{ width: '200px', maxHeight: '80vh', overflowY: 'auto', zIndex: 10000 }}
            >
              <div className="text-purple-400 font-bold mb-2 flex justify-between items-center sticky top-0 bg-slate-900 pb-2">
                <span>Spider Graph</span>
                <button 
                  onClick={() => setShowControls(false)}
                  className="text-slate-400 hover:text-white text-lg leading-none"
                >×</button>
              </div>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Top %</span>
                <input 
                  type="range" min="0" max="100" value={spiderSettings.top}
                  onChange={(e) => updateSpiderSetting('top', Number(e.target.value))}
                  className="flex-1 h-2 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 font-mono">{spiderSettings.top}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Left %</span>
                <input 
                  type="range" min="0" max="100" value={spiderSettings.left}
                  onChange={(e) => updateSpiderSetting('left', Number(e.target.value))}
                  className="flex-1 h-2 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 font-mono">{spiderSettings.left}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Scale</span>
                <input 
                  type="range" min="50" max="200" value={spiderSettings.scale * 100}
                  onChange={(e) => updateSpiderSetting('scale', Number(e.target.value) / 100)}
                  className="flex-1 h-2 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 font-mono">{(spiderSettings.scale * 100).toFixed(0)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Opacity</span>
                <input 
                  type="range" min="0" max="100" value={spiderSettings.opacity * 100}
                  onChange={(e) => updateSpiderSetting('opacity', Number(e.target.value) / 100)}
                  className="flex-1 h-2 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 font-mono">{(spiderSettings.opacity * 100).toFixed(0)}</span>
              </label>
              
              <button 
                onClick={() => {
                  console.log('Spider Graph Settings:', JSON.stringify(spiderSettings, null, 2))
                  localStorage.setItem('spiderGraphSettings', JSON.stringify(spiderSettings))
                  alert('Spider Graph settings saved!')
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 rounded px-3 py-2 mt-2 text-xs font-medium"
              >
                💾 Save Settings
              </button>
            </div>
          )}
        </div>,
        devControlsContainer
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200]"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
              onClick={onClose}
            />

            {/* Spider Graph Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed -translate-x-1/2 -translate-y-1/2 z-[201]"
              style={{
                left: `${spiderSettings.left}%`,
                top: `${spiderSettings.top}%`,
                transform: `translateX(-50%) translateY(-50%) scale(${spiderSettings.scale})`,
                opacity: spiderSettings.opacity
              }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Title */}
            <motion.div 
              className="text-center mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-cyan-400 text-sm font-bold uppercase tracking-wider">
                {patient?.name || 'Patient'} Vitals
              </div>
              <div className="text-slate-500 text-[10px]">
                Week {currentWeek} • Status Overview
              </div>
            </motion.div>

            {/* SVG Spider Graph */}
            <svg width="400" height="400" viewBox="0 0 400 400">
              {/* Glow filter */}
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="spiderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid circles */}
              {gridLevels.map((level, i) => (
                <motion.polygon
                  key={`grid-${i}`}
                  points={dataPoints
                    .map((_, idx) => {
                      const angle = (idx * angleStep) - Math.PI / 2
                      const radius = level * maxRadius
                      return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.15)"
                  strokeWidth="1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                />
              ))}

              {/* Axis lines */}
              {dataPoints.map((_, i) => {
                const angle = (i * angleStep) - Math.PI / 2
                const endX = centerX + maxRadius * Math.cos(angle)
                const endY = centerY + maxRadius * Math.sin(angle)
                return (
                  <motion.line
                    key={`axis-${i}`}
                    x1={centerX}
                    y1={centerY}
                    x2={endX}
                    y2={endY}
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  />
                )
              })}

              {/* Data polygon */}
              <motion.path
                d={dataPath}
                fill="url(#spiderGradient)"
                stroke="#0ea5e9"
                strokeWidth="2"
                filter="url(#glow)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              />

              {/* Data points */}
              {dataPoints.map((point, i) => {
                const { x, y } = getPoint(i, point.value, point.max)
                return (
                  <motion.circle
                    key={`point-${i}`}
                    cx={x}
                    cy={y}
                    r="7"
                    fill={point.color}
                    stroke="white"
                    strokeWidth="2"
                    filter="url(#glow)"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
                    style={{ 
                      filter: `drop-shadow(0 0 6px ${point.color})` 
                    }}
                  />
                )
              })}

              {/* Labels */}
              {dataPoints.map((point, i) => {
                const angle = (i * angleStep) - Math.PI / 2
                const labelRadius = maxRadius + 40
                const x = centerX + labelRadius * Math.cos(angle)
                const y = centerY + labelRadius * Math.sin(angle)
                
                return (
                  <motion.g
                    key={`label-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fill={point.color}
                      fontSize="12"
                      fontWeight="bold"
                      className="uppercase"
                    >
                      {point.label}
                    </text>
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {point.value}{point.unit ? ` ${point.unit}` : ''}
                    </text>
                  </motion.g>
                )
              })}

              {/* Center dot */}
              <circle
                cx={centerX}
                cy={centerY}
                r="6"
                fill="#0ea5e9"
                opacity="0.6"
                filter="url(#glow)"
              />
            </svg>

            {/* Close hint */}
            <motion.div 
              className="text-center text-slate-500 text-[10px] mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Tap anywhere to close
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}

export default SpiderGraph

