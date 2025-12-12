// TimePassage.jsx
// Animated time progression display - In-game overlay (no portal)

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Progress } from '@heroui/react'

export function TimePassage({
  isOpen,
  startWeek,
  endWeek,
  headerText = 'Time Advancement',
  progressText = 'Monitoring patient response...',
  onComplete,
  alert = null // { triggerAt: number (0-100), message: string, onAcknowledge: () => void }
}) {
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertAcknowledged, setAlertAcknowledged] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0)
      setIsPaused(false)
      setShowAlert(false)
      setAlertAcknowledged(false)
    }
  }, [isOpen])

  // Auto-progress
  useEffect(() => {
    if (!isOpen || isPaused) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2

        // Check for alert trigger
        if (alert && !alertAcknowledged && next >= alert.triggerAt) {
          setIsPaused(true)
          setShowAlert(true)
          return prev
        }

        // Check for completion
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => onComplete?.(), 500)
          return 100
        }

        return next
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isOpen, isPaused, alert, alertAcknowledged, onComplete])

  // Handle alert acknowledgment
  const handleAlertAcknowledge = () => {
    setShowAlert(false)
    setAlertAcknowledged(true)
    setIsPaused(false)
    alert?.onAcknowledge?.()
  }

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
              border: '1px solid rgba(14, 165, 233, 0.4)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 text-center">
              <span className="text-white font-semibold text-sm">{headerText}</span>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Week labels */}
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Week {startWeek}</span>
                <span className="text-sky-400 font-medium">Week {endWeek}</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Animated marker */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky-400 shadow-lg"
                  style={{ left: `calc(${progress}% - 6px)` }}
                  animate={{ 
                    scale: isPaused ? [1, 1.3, 1] : 1,
                    boxShadow: isPaused 
                      ? '0 0 15px rgba(239, 68, 68, 0.8)'
                      : '0 0 10px rgba(14, 165, 233, 0.5)'
                  }}
                  transition={{ repeat: isPaused ? Infinity : 0, duration: 0.8 }}
                />
              </div>

              {/* Progress text */}
              <motion.p
                className="text-center text-xs text-slate-400 mt-3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {progressText}
              </motion.p>

              {/* Alert card (if triggered) */}
              {showAlert && alert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.5)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-lg"
                    >
                      ⚠️
                    </motion.span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-red-400 mb-1">
                        Patient Alert
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    className="w-full mt-2"
                    onPress={handleAlertAcknowledge}
                  >
                    Acknowledge
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Footer - Show complete button when done */}
            {progress >= 100 && (
              <div className="px-4 pb-4">
                <Button
                  color="primary"
                  variant="solid"
                  onPress={onComplete}
                  className="w-full font-medium"
                >
                  Continue
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TimePassage

