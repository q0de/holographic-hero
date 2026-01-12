// DecisionGrid.jsx
// 2x2 grid layout for decision cards with dealt-in animation

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DecisionCard, { getWatermarkSettings, setWatermarkSettings, getCardBgSettings, setCardBgSettings } from './DecisionCard'

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
  const [cardBgSettings, setLocalCardBgSettings] = useState(getCardBgSettings())
  
  const updateWatermark = (key, value) => {
    const newSettings = { ...watermarkSettings, [key]: value }
    setLocalWatermarkSettings(newSettings)
    setWatermarkSettings(newSettings)
  }
  
  const updateCardBg = (key, value) => {
    const newSettings = { ...cardBgSettings, [key]: value }
    setLocalCardBgSettings(newSettings)
    setCardBgSettings(newSettings)
  }
  
  // Get portal container after mount
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])
  
  if (optionEntries.length === 0) return null
  
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
              
              <div className="text-cyan-400 font-bold mt-3 mb-2">Background Graphic</div>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Text Mode</span>
                <select
                  value={cardBgSettings.textMode}
                  onChange={(e) => updateCardBg('textMode', e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-[9px] text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Enabled</span>
                <input
                  type="checkbox"
                  checked={cardBgSettings.enabled}
                  onChange={(e) => updateCardBg('enabled', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
              </label>
              
              {cardBgSettings.enabled && (
                <>
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input
                      type="range" min="0" max="100" step="1" value={cardBgSettings.opacity}
                      onChange={(e) => updateCardBg('opacity', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-8 text-right text-cyan-300">{cardBgSettings.opacity}%</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input
                      type="range" min="50" max="200" value={cardBgSettings.scale * 100}
                      onChange={(e) => updateCardBg('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-8 text-right text-cyan-300">{Math.round(cardBgSettings.scale * 100)}%</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Offset X</span>
                    <input
                      type="range" min="-50" max="50" value={cardBgSettings.offsetX}
                      onChange={(e) => updateCardBg('offsetX', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-8 text-right text-cyan-300">{cardBgSettings.offsetX}px</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Offset Y</span>
                    <input
                      type="range" min="-50" max="50" value={cardBgSettings.offsetY}
                      onChange={(e) => updateCardBg('offsetY', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-8 text-right text-cyan-300">{cardBgSettings.offsetY}px</span>
                  </label>
                </>
              )}
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

