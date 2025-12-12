// GameHUD.jsx
// Top header with patient info, week tracker, and dosage meter

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  // Avatar adjustment controls
  const [showAvatarControls, setShowAvatarControls] = useState(false)
  const [avatarSettings, setAvatarSettings] = useState({
    scale: 5.0,
    posX: 1,
    posY: 36
  })
  
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
      className="w-full px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/10 relative overflow-visible"
      style={{ zIndex: 50 }}
    >
      {/* Top row: Patient info, Week, Timeline button */}
      <div className="flex items-center justify-between mb-3 relative overflow-visible">
        {/* Patient info */}
        <div className="relative">
          <button 
            onClick={() => setShowAvatarControls(!showAvatarControls)}
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
                  transform: `scale(${avatarSettings.scale}) translate(${avatarSettings.posX}%, ${avatarSettings.posY}%)`
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
          
        </div>
        
        {/* Avatar Controls Panel - rendered via portal to avoid clipping */}
        {showAvatarControls && createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-4 left-4 z-[9999] bg-black/95 backdrop-blur-md rounded-lg p-4 text-[12px] text-white space-y-3 border border-cyan-500/40 shadow-2xl"
              style={{ width: '240px' }}
            >
              <div className="text-cyan-400 font-bold text-sm flex justify-between items-center">
                <span>🖼️ Avatar Controls</span>
                <button 
                  onClick={() => setShowAvatarControls(false)}
                  className="text-slate-400 hover:text-white text-lg leading-none"
                >×</button>
              </div>
              
              <label className="flex justify-between items-center gap-2">
                <span className="w-14 text-slate-300">Scale</span>
                <input 
                  type="range" min="100" max="500" 
                  value={avatarSettings.scale * 100}
                  onChange={(e) => setAvatarSettings(s => ({ ...s, scale: Number(e.target.value) / 100 }))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-12 text-right text-cyan-300 font-mono">{avatarSettings.scale.toFixed(1)}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="w-14 text-slate-300">X Pos</span>
                <input 
                  type="range" min="-50" max="50" 
                  value={avatarSettings.posX}
                  onChange={(e) => setAvatarSettings(s => ({ ...s, posX: Number(e.target.value) }))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-12 text-right text-cyan-300 font-mono">{avatarSettings.posX}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="w-14 text-slate-300">Y Pos</span>
                <input 
                  type="range" min="-50" max="50" 
                  value={avatarSettings.posY}
                  onChange={(e) => setAvatarSettings(s => ({ ...s, posY: Number(e.target.value) }))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-12 text-right text-cyan-300 font-mono">{avatarSettings.posY}%</span>
              </label>
              
              <button 
                onClick={() => console.log('Avatar Settings:', JSON.stringify(avatarSettings, null, 2))}
                className="w-full bg-cyan-600 hover:bg-cyan-500 rounded px-3 py-2 mt-2 text-xs font-medium"
              >
                📋 Log Settings
              </button>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
        
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

