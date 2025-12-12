// DecisionGrid.jsx
// 2x2 grid layout for decision cards with dealt-in animation

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DecisionCard, { getWatermarkSettings, setWatermarkSettings } from './DecisionCard'

// Card dealing animation - slides in from below with rotation
const cardVariants = {
  hidden: (index) => ({
    opacity: 0,
    y: 150,
    x: index % 2 === 0 ? -30 : 30,
    rotateZ: index % 2 === 0 ? -15 : 15,
    scale: 0.8
  }),
  visible: (index) => ({
    opacity: 1,
    y: 0,
    x: 0,
    rotateZ: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.1 + index * 0.12
    }
  })
}

export function DecisionGrid({ 
  options = {}, 
  onDragStart, 
  onDragEnd,
  onTap,
  interpolate,
  animationKey = 0 // Changes to trigger re-deal animation
}) {
  const optionEntries = Object.entries(options)
  const [showWatermarkControls, setShowWatermarkControls] = useState(false)
  const [watermarkSettings, setLocalWatermarkSettings] = useState(getWatermarkSettings())
  
  const updateWatermark = (key, value) => {
    const newSettings = { ...watermarkSettings, [key]: value }
    setLocalWatermarkSettings(newSettings)
    setWatermarkSettings(newSettings)
  }
  
  if (optionEntries.length === 0) return null

  // Render controls outside phone frame via portal
  const devControlsContainer = document.getElementById('dev-controls')
  
  return (
    <div className="space-y-2 relative">
      {/* Card Watermark Controls - rendered outside phone frame */}
      {devControlsContainer && createPortal(
        <div className="relative">
          <button
            onClick={() => setShowWatermarkControls(!showWatermarkControls)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
            aria-label="Card settings"
            title="Card Watermark"
          >
            💧
          </button>
          
          {showWatermarkControls && (
            <div 
              className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl"
              style={{ width: '160px' }}
            >
              <div className="text-cyan-400 font-bold mb-2">Card Watermark</div>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Size</span>
                <input
                  type="range" min="40" max="150" value={watermarkSettings.size}
                  onChange={(e) => updateWatermark('size', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{watermarkSettings.size}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Opacity</span>
                <input
                  type="range" min="0" max="50" step="1" value={watermarkSettings.opacity * 100}
                  onChange={(e) => updateWatermark('opacity', Number(e.target.value) / 100)}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{Math.round(watermarkSettings.opacity * 100)}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Rotate</span>
                <input
                  type="range" min="-45" max="45" value={watermarkSettings.rotation}
                  onChange={(e) => updateWatermark('rotation', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{watermarkSettings.rotation}°</span>
              </label>
            </div>
          )}
        </div>,
        devControlsContainer
      )}
      
      {/* Instruction text */}
      <motion.div 
        className="text-center text-[10px] text-slate-500 uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Tap card or drag to patient
      </motion.div>
      
      {/* 2x2 Grid with dealt-in cards */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={animationKey}
          className="grid grid-cols-2 gap-2 px-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {optionEntries.map(([key, option], index) => (
            <motion.div
              key={key}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="relative"
              style={{ zIndex: 10 - index, perspective: '1000px' }}
            >
              <DecisionCard
                title={interpolate ? interpolate(option.title) : option.title}
                description={interpolate ? interpolate(option.description) : option.description}
                duration={option.duration}
                badge={option.badge}
                optionKey={key}
                index={index}
                onDragStart={() => onDragStart?.(key)}
                onDragEnd={onDragEnd}
                onTap={onTap}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default DecisionGrid

