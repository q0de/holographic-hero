// SpiderGraph.jsx
// Radar/Spider chart overlay for patient vitals

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
            className="fixed left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 z-[201]"
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
  )
}

export default SpiderGraph

