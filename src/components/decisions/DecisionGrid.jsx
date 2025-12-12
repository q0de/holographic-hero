// DecisionGrid.jsx
// 2x2 grid layout for decision cards with dealt-in animation

import { useState } from 'react'
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

  return (
    <div className="space-y-2 relative">
      {/* Watermark settings button */}
      <button
        onClick={() => setShowWatermarkControls(!showWatermarkControls)}
        className="absolute -top-6 right-2 z-50 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-[10px] text-slate-400 hover:text-white transition-colors"
        aria-label="Card settings"
      >
        💧
      </button>
      
      {/* Watermark Controls Panel */}
      {showWatermarkControls && (
        <div 
          className="absolute -top-4 right-10 z-[200] bg-black/95 rounded-lg p-2 text-[9px] text-white space-y-1"
          style={{ width: '130px' }}
        >
          <div className="text-cyan-400 font-bold mb-1">Card Watermark</div>
          
          <label className="flex justify-between items-center">
            <span>Size</span>
            <input
              type="range" min="40" max="150" value={watermarkSettings.size}
              onChange={(e) => updateWatermark('size', Number(e.target.value))}
              className="w-14 h-2"
            />
            <span className="w-5 text-right">{watermarkSettings.size}</span>
          </label>
          
          <label className="flex justify-between items-center">
            <span>Opacity</span>
            <input
              type="range" min="0" max="50" step="1" value={watermarkSettings.opacity * 100}
              onChange={(e) => updateWatermark('opacity', Number(e.target.value) / 100)}
              className="w-14 h-2"
            />
            <span className="w-5 text-right">{Math.round(watermarkSettings.opacity * 100)}</span>
          </label>
          
          <label className="flex justify-between items-center">
            <span>Rotate</span>
            <input
              type="range" min="-45" max="45" value={watermarkSettings.rotation}
              onChange={(e) => updateWatermark('rotation', Number(e.target.value))}
              className="w-14 h-2"
            />
            <span className="w-5 text-right">{watermarkSettings.rotation}°</span>
          </label>
          
          <label className="flex justify-between items-center">
            <span>X Pos</span>
            <input
              type="range" min="-50" max="50" value={watermarkSettings.offsetX}
              onChange={(e) => updateWatermark('offsetX', Number(e.target.value))}
              className="w-14 h-2"
            />
            <span className="w-5 text-right">{watermarkSettings.offsetX}</span>
          </label>
          
          <label className="flex justify-between items-center">
            <span>Y Pos</span>
            <input
              type="range" min="-50" max="50" value={watermarkSettings.offsetY}
              onChange={(e) => updateWatermark('offsetY', Number(e.target.value))}
              className="w-14 h-2"
            />
            <span className="w-5 text-right">{watermarkSettings.offsetY}</span>
          </label>
          
          <button 
            onClick={() => console.log('Watermark:', JSON.stringify(watermarkSettings, null, 2))}
            className="w-full bg-cyan-600 hover:bg-cyan-500 rounded px-2 py-1 mt-1"
          >
            Log Settings
          </button>
        </div>
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

