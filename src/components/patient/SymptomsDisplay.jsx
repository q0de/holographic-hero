// SymptomsDisplay.jsx
// Truncated symptoms bar - tap to expand

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SymptomsDisplay({ symptoms = [], interpolate, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasAlert = symptoms.some(s => s.isAlert)
  const hasSymptoms = symptoms.length > 0
  
  // Process symptoms to handle both string and object formats
  const processedSymptoms = symptoms.map(s => {
    const text = typeof s === 'string' ? s : s.text
    const isAlert = typeof s === 'object' ? s.isAlert : false
    return { 
      text: interpolate ? interpolate(text) : text, 
      isAlert 
    }
  })

  if (processedSymptoms.length === 0) return null

  // Truncated view: show first symptom + count
  const displaySymptoms = isExpanded ? processedSymptoms : processedSymptoms.slice(0, 1)
  const hiddenCount = processedSymptoms.length - 1

  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          background: hasAlert 
            ? 'rgba(239, 68, 68, 0.15)' 
            : 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${hasAlert ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.2)'}`,
          borderRadius: '10px',
          padding: '6px 10px',
          boxShadow: hasSymptoms 
            ? '0 0 20px rgba(239, 68, 68, 0.2)' 
            : 'none',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 100,
          isolation: 'isolate'
        }}
      >
        {/* Horizontal layout */}
        <div className="flex items-center gap-2">
          {/* Warning icon */}
          <motion.span
            animate={hasAlert ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xs shrink-0"
          >
            ⚠️
          </motion.span>
          
          {/* Label */}
          <span className="text-[9px] uppercase tracking-wider text-red-400/80 font-medium shrink-0">
            Symptoms
          </span>
          
          {/* Symptoms */}
          <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
            <AnimatePresence mode="sync">
              {displaySymptoms.map((symptom, i) => (
                <motion.span 
                  key={symptom.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-[10px] px-2 py-0.5 rounded-full truncate ${
                    symptom.isAlert 
                      ? 'bg-red-500/30 text-red-200 border border-red-500/40' 
                      : 'bg-red-900/30 text-red-300/90 border border-red-700/30'
                  }`}
                  style={{ maxWidth: isExpanded ? 'none' : '140px' }}
                >
                  {symptom.text}
                </motion.span>
              ))}
            </AnimatePresence>
            
            {/* Show count when truncated */}
            {!isExpanded && hiddenCount > 0 && (
              <span className="text-[10px] text-red-400/70 shrink-0">
                +{hiddenCount} more
              </span>
            )}
          </div>
          
          {/* Expand/collapse indicator */}
          <motion.span 
            className="text-red-400/60 text-[10px] shrink-0"
            animate={{ rotate: isExpanded ? 180 : 0 }}
          >
            ▼
          </motion.span>
        </div>
        
        {/* Expanded view - show all symptoms */}
        <AnimatePresence>
          {isExpanded && processedSymptoms.length > 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-red-500/20">
                {processedSymptoms.slice(1).map((symptom, i) => (
                  <span 
                    key={i}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      symptom.isAlert 
                        ? 'bg-red-500/30 text-red-200 border border-red-500/40' 
                        : 'bg-red-900/30 text-red-300/90 border border-red-700/30'
                    }`}
                  >
                    {symptom.text}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

export default SymptomsDisplay

