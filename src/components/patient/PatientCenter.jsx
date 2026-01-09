// PatientCenter.jsx
// Central patient image with fade effect

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export function PatientCenter({ patient, isActive, dropEffect, onDrop, onEntranceComplete }) {
  const { theme } = useTheme()
  const [showControls, setShowControls] = useState(false)
  const video1Ref = useRef(null)
  const video2Ref = useRef(null)
  const [showSecondVideo, setShowSecondVideo] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  
  // When intro ends, fade to video 2 and ensure it's playing
  useEffect(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    if (!video1 || !video2) return
    
    const handleEnded = () => {
      setShowSecondVideo(true)
      // Ensure video 2 is playing
      video2.currentTime = 0
      video2.play().catch(err => console.log('Video 2 play error:', err))
    }
    
    // Also ensure video2 keeps looping
    const handleVideo2Ended = () => {
      video2.currentTime = 0
      video2.play().catch(() => {})
    }
    
    video1.addEventListener('ended', handleEnded)
    video2.addEventListener('ended', handleVideo2Ended)
    
    return () => {
      video1.removeEventListener('ended', handleEnded)
      video2.removeEventListener('ended', handleVideo2Ended)
    }
  }, [])
  
  // Avatar adjustment controls (saved settings)
  const [settings, setSettings] = useState({
    top: 46,           // % from top
    width: 300,        // px
    height: 264,       // px
    fadeStart: 44,     // % where fade begins
    scale: 1.85,       // scale multiplier
    offsetY: 10,       // px - shift image within container
    blendMode: 'normal', // CSS mix-blend-mode
    brightness: 100,   // %
    contrast: 100,     // %
    saturate: 100,     // %
    gradientType: 'none', // none, top-bottom, radial, bottom-top
    gradientColor1: '#0ea5e9', // cyan
    gradientColor2: '#8b5cf6', // purple
    gradientOpacity: 30, // %
    gradientBlend: 'color', // blend mode for gradient
  })
  
  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
  ]
  
  const gradientTypes = ['none', 'top-bottom', 'bottom-top', 'left-right', 'radial']
  
  const gradientPresets = [
    { name: 'Cyan-Purple', c1: '#0ea5e9', c2: '#8b5cf6' },
    { name: 'Blue-Pink', c1: '#3b82f6', c2: '#ec4899' },
    { name: 'Green-Blue', c1: '#22c55e', c2: '#0ea5e9' },
    { name: 'Orange-Red', c1: '#f59e0b', c2: '#ef4444' },
    { name: 'Purple-Pink', c1: '#a855f7', c2: '#f472b6' },
    { name: 'Teal-Cyan', c1: '#14b8a6', c2: '#06b6d4' },
  ]
  
  const getGradientStyle = () => {
    if (settings.gradientType === 'none') return 'transparent'
    const c1 = settings.gradientColor1
    const c2 = settings.gradientColor2
    switch (settings.gradientType) {
      case 'top-bottom': return `linear-gradient(180deg, ${c1}, ${c2})`
      case 'bottom-top': return `linear-gradient(0deg, ${c1}, ${c2})`
      case 'left-right': return `linear-gradient(90deg, ${c1}, ${c2})`
      case 'radial': return `radial-gradient(circle at 50% 30%, ${c1}, ${c2})`
      default: return 'transparent'
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Get portal container after mount
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])
  
  return (
    <>
      {/* Avatar Controls - rendered outside phone frame */}
      {devControlsContainer && createPortal(
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
            aria-label="Avatar settings"
            title="Video Avatar"
          >
            🎬
          </button>
          
          {showControls && (
            <div 
              className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl max-h-[80vh] overflow-y-auto"
              style={{ width: '180px' }}
            >
              <div className="text-cyan-400 font-bold mb-2">Video Avatar</div>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Top %</span>
                <input 
                  type="range" min="10" max="50" value={settings.top}
                  onChange={(e) => updateSetting('top', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{settings.top}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Scale</span>
                <input 
                  type="range" min="20" max="200" value={settings.scale * 100}
                  onChange={(e) => updateSetting('scale', Number(e.target.value) / 100)}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{settings.scale.toFixed(1)}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Width</span>
                <input 
                  type="range" min="50" max="400" value={settings.width}
                  onChange={(e) => updateSetting('width', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{settings.width}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Height</span>
                <input 
                  type="range" min="50" max="500" value={settings.height}
                  onChange={(e) => updateSetting('height', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{settings.height}</span>
              </label>
              
              <div className="text-cyan-400 font-bold mt-3 mb-2">Filters</div>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Bright</span>
                <input 
                  type="range" min="0" max="200" value={settings.brightness}
                  onChange={(e) => updateSetting('brightness', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{settings.brightness}</span>
              </label>
              
              <label className="flex justify-between items-center gap-2">
                <span className="text-slate-300">Contrast</span>
                <input 
                  type="range" min="0" max="200" value={settings.contrast}
                  onChange={(e) => updateSetting('contrast', Number(e.target.value))}
                  className="flex-1 h-2 accent-cyan-500"
                />
                <span className="w-8 text-right text-cyan-300">{settings.contrast}</span>
              </label>
            </div>
          )}
        </div>,
        devControlsContainer
      )}

      <div 
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ top: `${settings.top}%` }}
      >
        {/* Glow effect behind patient */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={isActive ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          } : {
            scale: 1,
            opacity: 0.2
          }}
          transition={{ repeat: isActive ? Infinity : 0, duration: 2, ease: "easeInOut" }}
          style={{
            width: settings.width + 40,
            height: settings.height + 40,
            background: `radial-gradient(ellipse, ${isActive ? `rgba(139, 92, 246, 0.4)` : `rgba(139, 92, 246, 0.2)`} 0%, transparent 70%)`,
            filter: 'blur(20px)'
          }}
        />
        
        {/* Drop effect - flash/pulse when card is applied */}
        <AnimatePresence>
          {dropEffect && (
            <motion.div
              key="drop-flash"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                width: settings.width,
                height: settings.height,
                background: `radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.4) 30%, transparent 70%)`,
                filter: 'blur(10px)'
              }}
            />
          )}
        </AnimatePresence>
        
        {/* Drop effect - ring pulse */}
        <AnimatePresence>
          {dropEffect && (
            <motion.div
              key="drop-ring"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 rounded-full"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                width: 150,
                height: 150,
                border: `3px solid rgba(139, 92, 246, 0.9)`,
                boxShadow: `0 0 30px rgba(139, 92, 246, 0.8), inset 0 0 20px rgba(139, 92, 246, 0.4)`
              }}
            />
          )}
        </AnimatePresence>

        {/* Patient image container with fade */}
        <motion.div
          className="relative cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: settings.scale }}
          whileHover={{ scale: settings.scale * 1.02 }}
          whileTap={{ scale: settings.scale * 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={onDrop}
          onAnimationComplete={() => {
            if (!hasEntered) {
              setHasEntered(true)
              onEntranceComplete?.()
            }
          }}
          style={{
            width: `${settings.width}px`,
            height: `${settings.height}px`,
            overflow: 'hidden',
          }}
        >
          {/* Video 1 - Intro */}
          <video
            ref={video1Ref}
            src="/julia3.webm"
            autoPlay
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full object-cover object-top transition-opacity duration-700 ease-in-out"
            style={{
              height: '100%',
              transform: `translateY(${settings.offsetY}px)`,
              opacity: showSecondVideo ? 0 : 1,
              mixBlendMode: settings.blendMode,
              filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturate}%)`,
              maskImage: `linear-gradient(to bottom, black 0%, black ${settings.fadeStart}%, transparent 100%)`,
              WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${settings.fadeStart}%, transparent 100%)`
            }}
          />
          
          {/* Video 2 - Loop */}
          <video
            ref={video2Ref}
            src="/julia3.webm"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full object-cover object-top transition-opacity duration-700 ease-in-out"
            style={{
              height: '100%',
              transform: `translateY(${settings.offsetY}px)`,
              opacity: showSecondVideo ? 1 : 0,
              mixBlendMode: settings.blendMode,
              filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturate}%)`,
              maskImage: `linear-gradient(to bottom, black 0%, black ${settings.fadeStart}%, transparent 100%)`,
              WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${settings.fadeStart}%, transparent 100%)`
            }}
          />
          
          {/* Color gradient overlay - matches video exactly */}
          {settings.gradientType !== 'none' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translateY(${settings.offsetY}px)`,
                background: getGradientStyle(),
                opacity: settings.gradientOpacity / 100,
                mixBlendMode: settings.gradientBlend,
                maskImage: `linear-gradient(to bottom, black 0%, black ${settings.fadeStart}%, transparent 100%)`,
                WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${settings.fadeStart}%, transparent 100%)`
              }}
            />
          )}
          
          {/* Active state glow overlay */}
          {isActive && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                background: `linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 0%, transparent 100%)`,
                mixBlendMode: 'overlay'
              }}
            />
          )}
        </motion.div>

        {/* Drop hint text */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-center"
          animate={{ 
            opacity: isActive ? 1 : 0.5,
            y: isActive ? [0, -2, 0] : 0
          }}
          transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
          style={{ color: isActive ? '#0ea5e9' : '#64748b' }}
        >
          {isActive ? '↓ Drop here' : 'Tap card or drag to patient'}
        </motion.div>
      </div>
    </>
  )
}

export default PatientCenter

