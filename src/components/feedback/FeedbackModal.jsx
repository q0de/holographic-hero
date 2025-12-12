// FeedbackModal.jsx
// Post-decision feedback display - In-game overlay (no portal)

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@heroui/react'
import LabDeltaCard from './LabDeltaCard'

const typeConfig = {
  success: { icon: '✅', color: 'success', borderColor: 'rgba(34, 197, 94, 0.5)' },
  warning: { icon: '⚠️', color: 'warning', borderColor: 'rgba(245, 158, 11, 0.5)' },
  alert: { icon: '🚨', color: 'danger', borderColor: 'rgba(239, 68, 68, 0.5)' },
  info: { icon: 'ℹ️', color: 'primary', borderColor: 'rgba(14, 165, 233, 0.5)' }
}

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  description,
  type = 'success',
  labDeltas = [],
  interpolate
}) {
  const config = typeConfig[type] || typeConfig.success

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            backdropFilter: 'blur(12px)',
            zIndex: 9999 
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-[320px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${config.borderColor}`,
              boxShadow: `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px ${config.borderColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-xl"
              >
                {config.icon}
              </motion.span>
              <span className="text-white font-semibold text-sm">
                {interpolate ? interpolate(title) : title}
              </span>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-300 text-xs leading-relaxed mb-3"
              >
                {interpolate ? interpolate(description) : description}
              </motion.p>

              {/* Lab Deltas */}
              {labDeltas && labDeltas.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    Lab Value Changes
                  </div>
                  {labDeltas.map((delta, index) => (
                    <motion.div
                      key={delta.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LabDeltaCard
                        name={delta.name}
                        before={interpolate ? interpolate(delta.before?.toString()) : delta.before}
                        after={interpolate ? interpolate(delta.after?.toString()) : delta.after}
                        unit={delta.unit}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <Button
                color={config.color}
                variant="solid"
                onPress={onClose}
                className="w-full font-medium"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FeedbackModal

