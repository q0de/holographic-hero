// TimePassage.jsx
// Animated time progression display - In-game overlay (no portal)

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Progress } from '@heroui/react'
import { getBlurSettings } from './FeedbackModal'

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
  const blurSettings = getBlurSettings()

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
            backgroundColor: 'rgba(0, 0, 0, 0.3)', 
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999 
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full rounded-[24px] overflow-hidden relative"
            style={{ maxWidth: `${blurSettings.modalWidth}px` }}
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%),
                linear-gradient(90deg, rgba(243, 245, 255, 0.3) 0%, rgba(243, 245, 255, 0.3) 100%)
              `,
              backdropFilter: `blur(${blurSettings.backdropBlur}px)`,
              WebkitBackdropFilter: `blur(${blurSettings.backdropBlur}px)`,
              border: `${blurSettings.borderWidth}px solid white`,
              boxShadow: '0px 16px 30px 0px #061124'
            }}
          >
            {/* Outer blur border overlay - from Figma */}
            {blurSettings.outerBorderWidth > 0 && (
              <div 
                className="absolute inset-0 pointer-events-none rounded-[24px]"
                style={{
                  border: `${blurSettings.outerBorderWidth}px solid white`,
                  filter: `blur(${blurSettings.borderBlur}px)`,
                  opacity: blurSettings.borderOpacity
                }}
              />
            )}
            {/* Header */}
            <div className="px-4 border-b border-white/10 text-center relative z-10" style={{ paddingTop: `${blurSettings.headerPadding}px`, paddingBottom: `${blurSettings.headerPadding}px` }}>
              <span 
                className="relative uppercase"
                style={{
                  color: '#330145',
                  fontFamily: "'Rift', 'Arial Black', 'Impact', sans-serif",
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '0.1em',
                  filter: 'blur(0.5px)',
                  opacity: 0.9,
                  textShadow: '0 0 8px rgba(51, 1, 69, 0.5), 0 0 16px rgba(139, 92, 246, 0.3)',
                  fontSize: `${blurSettings.headerTextSize}px`
                }}
              >
                {headerText}
              </span>
            </div>

            {/* Body */}
            <div className="p-4 relative z-10">
              {/* Week labels */}
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: '#330145', opacity: 0.7 }}>Week {startWeek}</span>
                <span className="font-medium" style={{ color: '#330145' }}>Week {endWeek}</span>
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
                className="text-center text-xs mt-3"
                style={{ color: '#330145', opacity: 0.7 }}
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
                      <div className="text-xs font-medium mb-1" style={{ color: '#330145' }}>
                        Patient Alert
                      </div>
                      <p className="text-[11px]" style={{ color: '#330145' }}>
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
              <div className="px-4 pb-4 relative z-10">
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

