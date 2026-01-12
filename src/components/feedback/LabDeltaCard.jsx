// LabDeltaCard.jsx
// Before -> After lab value comparison card

import { motion } from 'framer-motion'

export function LabDeltaCard({ name, before, after, unit, bgColor = 'rgba(255, 255, 255, 1.0)', bgOpacity = 0.3 }) {
  const beforeNum = parseFloat(before)
  const afterNum = parseFloat(after)
  
  // Determine if improved (lower is generally better for CAH labs)
  const improved = !isNaN(beforeNum) && !isNaN(afterNum) && afterNum < beforeNum
  const worsened = !isNaN(beforeNum) && !isNaN(afterNum) && afterNum > beforeNum
  
  const borderColor = improved ? 'rgba(34, 197, 94, 0.5)' : 
                      worsened ? 'rgba(239, 68, 68, 0.5)' : 
                      'rgba(255, 255, 255, 0.1)'
  
  const glowColor = improved ? 'rgba(34, 197, 94, 0.2)' :
                    worsened ? 'rgba(239, 68, 68, 0.2)' :
                    'transparent'

  // Extract RGB from bgColor and apply opacity
  const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  const backgroundColor = rgbMatch 
    ? `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${bgOpacity})`
    : `rgba(255, 255, 255, ${bgOpacity})`

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{
        background: backgroundColor,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 15px ${glowColor}`
      }}
    >
      {/* Name */}
      <div className="text-sm font-medium" style={{ color: '#330145' }}>
        {name}
      </div>

      {/* Values */}
      <div className="flex items-center gap-2 text-sm">
        {/* Before value */}
        <span className="font-mono" style={{ color: '#330145', opacity: 0.7 }}>
          {before}
        </span>

        {/* Arrow */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-base ${improved ? 'text-success-400' : worsened ? 'text-danger-400' : 'text-slate-500'}`}
        >
          →
        </motion.span>

        {/* After value */}
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          className="font-mono font-bold"
          style={{ color: '#330145' }}
        >
          {after}
        </motion.span>

        {/* Unit */}
        {unit && (
          <span className="text-xs" style={{ color: '#330145', opacity: 0.7 }}>
            {unit}
          </span>
        )}

        {/* Indicator */}
        {improved && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-success-400 text-xs"
          >
            ↓
          </motion.span>
        )}
        {worsened && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-danger-400 text-xs"
          >
            ↑
          </motion.span>
        )}
      </div>
    </div>
  )
}

export default LabDeltaCard



