// GameHUD.jsx
// Top header with patient info, week tracker, and dosage meter

import { motion } from 'framer-motion'
import { Progress, Chip, Button } from '@heroui/react'

export function GameHUD({
  patient,
  currentWeek,
  currentDosage,
  targetDosage,
  initialDosage,
  showMeter = true,
  onTimelineClick,
  onPatientClick
}) {
  // Calculate progress (inverted - we want to go DOWN to target)
  const progress = ((initialDosage - currentDosage) / (initialDosage - targetDosage)) * 100
  const clampedProgress = Math.min(100, Math.max(0, progress))
  
  // Determine meter color based on progress
  const getMeterColor = () => {
    if (clampedProgress >= 80) return 'success'
    if (clampedProgress >= 40) return 'warning'
    return 'danger'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/10"
    >
      {/* Top row: Patient info, Week, Timeline button */}
      <div className="flex items-center justify-between mb-3">
        {/* Patient info */}
        <button 
          onClick={onPatientClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {/* Circular avatar with Julia's face */}
          <div 
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/60 flex-shrink-0"
            style={{
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.4)'
            }}
          >
            <img 
              src="/julia.png" 
              alt={patient?.name || 'Julia'}
              className="w-full h-auto object-cover object-top"
              style={{
                marginTop: '-4px', // Adjust to show face
                transform: 'scale(1.2)'
              }}
            />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">
              {patient?.name || 'Julia'}
            </div>
            <div className="text-xs text-slate-400">
              {patient?.age || 21} {patient?.gender || 'F'}
            </div>
          </div>
        </button>
        
        {/* Week indicator */}
        <Chip
          size="sm"
          variant="flat"
          aria-label={`Current week: ${currentWeek}`}
          classNames={{
            base: "bg-primary-500/20 border border-primary-500/30",
            content: "text-primary-400 font-medium"
          }}
        >
          Week {currentWeek}
        </Chip>
        
        {/* Timeline button */}
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="bg-slate-800 text-slate-300"
          onPress={onTimelineClick}
        >
          📊
        </Button>
      </div>
      
      {/* Bottom row: Dosage meter */}
      {showMeter && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{initialDosage}mg</span>
            <span className="text-white font-medium">{currentDosage}mg</span>
            <span className="text-success-400">&lt;{targetDosage}mg</span>
          </div>
          <Progress
            size="sm"
            value={clampedProgress}
            color={getMeterColor()}
            aria-label="Glucocorticoid reduction progress"
            classNames={{
              base: "h-2",
              track: "bg-slate-700",
              indicator: "transition-all duration-500"
            }}
          />
          <div className="text-center text-xs text-slate-500">
            Glucocorticoid Reduction Progress
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default GameHUD

