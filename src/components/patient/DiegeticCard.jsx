// DiegeticCard.jsx
// Glassmorphic info card for medications and lab values

import { motion } from 'framer-motion'

// Helper: Get lab status from value + ranges
function getLabStatus(value, ranges) {
  if (!ranges || value === null || value === undefined) return 'default'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'default'

  if (ranges.danger && num >= ranges.danger[0]) return 'danger'
  if (ranges.elevated && num >= ranges.elevated[0]) return 'elevated'
  if (ranges.normal && num >= ranges.normal[0] && num <= ranges.normal[1]) return 'normal'
  
  return 'default'
}

export function DiegeticCard({ type, data, delay = 0, interpolate, compact = false }) {
  const isLab = type === 'lab'
  
  // Interpolate the value if it contains memory keys
  const rawValue = interpolate ? interpolate(data.value?.toString() || '') : data.value
  const displayValue = rawValue
  
  // Parse numeric value for status calculation
  const numericValue = parseFloat(rawValue)
  const status = isLab ? getLabStatus(numericValue, data.ranges) : 'default'
  
  const glowColors = {
    default: 'rgba(14, 165, 233, 0.3)',
    normal: 'rgba(34, 197, 94, 0.4)',
    elevated: 'rgba(245, 158, 11, 0.4)',
    danger: 'rgba(239, 68, 68, 0.5)'
  }

  const borderColors = {
    default: 'rgba(14, 165, 233, 0.3)',
    normal: 'rgba(34, 197, 94, 0.5)',
    elevated: 'rgba(245, 158, 11, 0.5)',
    danger: 'rgba(239, 68, 68, 0.6)'
  }

  const textColors = {
    default: '#ffffff',
    normal: '#22c55e',
    elevated: '#f59e0b',
    danger: '#ef4444'
  }

  // Don't render if no value
  if (!displayValue && displayValue !== 0) return null

  // Compact mode for pizza slices
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay, duration: 0.3 }}
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${borderColors[status]}`,
          borderRadius: '8px',
          padding: '6px 8px',
          minWidth: '70px',
          maxWidth: '85px',
          boxShadow: `0 0 15px ${glowColors[status]}`
        }}
      >
        {/* Label */}
        <div className="text-[8px] uppercase tracking-wider text-slate-500 truncate flex items-center gap-1">
          {!isLab && <span>{data.icon || '💊'}</span>}
          <span className="truncate">{data.shortName || data.name?.slice(0, 8)}</span>
        </div>
        
        {/* Value */}
        <div 
          className="text-sm font-bold leading-none mt-0.5"
          style={{ 
            color: textColors[status],
            textShadow: status !== 'default' ? `0 0 8px ${glowColors[status]}` : 'none'
          }}
        >
          {displayValue}
          {data.unit && (
            <span className="text-[8px] font-normal text-slate-500 ml-0.5">
              {data.unit}
            </span>
          )}
        </div>

        {/* Status indicator for labs */}
        {isLab && status !== 'default' && (
          <div 
            className="text-[7px] uppercase font-medium"
            style={{ color: borderColors[status] }}
          >
            {status === 'danger' && '⚠ CRIT'}
            {status === 'elevated' && '↑ ELEV'}
            {status === 'normal' && '✓ OK'}
          </div>
        )}
      </motion.div>
    )
  }

  // Standard mode
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: isLab ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: isLab ? 20 : -20 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${borderColors[status]}`,
        borderRadius: '10px',
        padding: '8px 12px',
        minWidth: '85px',
        maxWidth: '100px',
        boxShadow: `
          0 0 20px ${glowColors[status]},
          inset 0 1px 0 rgba(255,255,255,0.1)
        `
      }}
    >
      {/* Icon and Label */}
      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 truncate">
        {!isLab && <span className="mr-1">{data.icon || '💊'}</span>}
        {data.name}
      </div>
      
      {/* Value */}
      <div 
        className="text-base font-bold leading-tight"
        style={{ 
          color: textColors[status],
          textShadow: status !== 'default' ? `0 0 10px ${glowColors[status]}` : 'none'
        }}
      >
        {displayValue}
        {data.unit && (
          <span className="text-[10px] font-normal text-slate-400 ml-1">
            {data.unit}
          </span>
        )}
      </div>

      {/* Status indicator for labs */}
      {isLab && status !== 'default' && (
        <div 
          className="text-[9px] uppercase mt-1 font-medium"
          style={{ color: borderColors[status] }}
        >
          {status === 'danger' && '⚠ CRITICAL'}
          {status === 'elevated' && '↑ ELEVATED'}
          {status === 'normal' && '✓ NORMAL'}
        </div>
      )}
    </motion.div>
  )
}

export default DiegeticCard

