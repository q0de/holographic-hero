// HolographicHeader.jsx
// Futuristic header with polygon glow effects, patient info, week tracker, and dosage meter
// Based on Figma design - merges visual effects with GameHUD content

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress, Chip, Button } from '@heroui/react'

// Header particles component - flowing horizontal particles
function HeaderParticles({ count = 10 }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: -10 + Math.random() * 10, // Start off-screen left (some variation)
    endX: 110, // End off-screen right
    y: Math.random() * 100, // Random vertical position
    size: 2 + Math.random() * 3, // 2-5px diameter
    duration: 8 + Math.random() * 8, // 8-16 seconds
    delay: Math.random() * 5, // Stagger start times
    opacity: 0.5 + Math.random() * 0.4 // 0.5-0.9 opacity
  })), [count])
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 2.1 }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(255, 255, 255, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(255, 255, 255, ${p.opacity * 0.8})`
          }}
          animate={{
            x: [`${p.startX}vw`, `${p.endX}vw`],
            opacity: [0, p.opacity, p.opacity, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

export function HolographicHeader({
  patient,
  currentWeek = 0,
  currentDosage = 60,
  targetDosage = 25,
  initialDosage = 60,
  showMeter = true,
  onTimelineClick,
  onPatientClick,
  theme = { primaryRgb: '14, 165, 233' },
  gameAreaTopMargin = 0,
  onGameAreaTopMarginChange
}) {
  // Header asset controls
  const [showHeaderControls, setShowHeaderControls] = useState(false)
  const [backgroundLayerZIndex, setBackgroundLayerZIndex] = useState(0)
  const [backgroundType, setBackgroundType] = useState('gradient') // 'gradient' or 'image'
  const [bgSettings, setBgSettings] = useState({
    left: -21,
    top: -51,
    scale: 1.32,
    opacity: 1,
    zIndex: 2
  })
  const [componentsSettings, setComponentsSettings] = useState({
    left: 0,
    top: 0,
    scale: 1.2,
    opacity: 1,
    zIndex: 3
  })
  const [leftSettings, setLeftSettings] = useState({
    left: -7,
    top: -42,
    baseWidth: 160,
    baseHeight: 128,
    scale: 0.92,
    opacity: 1,
    zIndex: 4
  })

  const updateBgSetting = (key, value) => {
    setBgSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateComponentsSetting = (key, value) => {
    setComponentsSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateLeftSetting = (key, value) => {
    setLeftSettings(prev => ({ ...prev, [key]: value }))
  }

  // Calculate actual dimensions from base size and scale
  const actualWidth = leftSettings.baseWidth * leftSettings.scale
  const actualHeight = leftSettings.baseHeight * leftSettings.scale

  // Info element controls
  const [patientInfoSettings, setPatientInfoSettings] = useState({
    left: -1,
    top: -61,
    avatarScale: 4.77,
    opacity: 1
  })

  const [weekTrackerSettings, setWeekTrackerSettings] = useState({
    left: -145,
    top: -27,
    scale: 0.9,
    opacity: 1
  })

  const [dosageMeterSettings, setDosageMeterSettings] = useState({
    left: 44,
    top: -73,
    scale: 0.71,
    opacity: 1,
    fontSize: 14, // text-sm = 14px
    labelFontSize: 14, // text-sm = 14px
    gap: 8 // gap-2 = 8px
  })

  const [timelineButtonSettings, setTimelineButtonSettings] = useState({
    left: -18,
    top: -72,
    scale: 1.08,
    opacity: 1
  })

  const updateTimelineButtonSetting = (key, value) => {
    setTimelineButtonSettings(prev => ({ ...prev, [key]: value }))
  }

  const [separatorLineSettings, setSeparatorLineSettings] = useState({
    top: 133,
    opacity: 1,
    leftOffset: 80
  })

  const updateSeparatorLineSetting = (key, value) => {
    setSeparatorLineSettings(prev => ({ ...prev, [key]: value }))
  }

  const updatePatientInfoSetting = (key, value) => {
    setPatientInfoSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateWeekTrackerSetting = (key, value) => {
    setWeekTrackerSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateDosageMeterSetting = (key, value) => {
    setDosageMeterSettings(prev => ({ ...prev, [key]: value }))
  }

  // Load settings from localStorage on mount (OPTIONAL - only for dev overrides)
  // The code defaults above are the source of truth for production
  useEffect(() => {
    try {
      const saved = localStorage.getItem('holographicHeaderSettings')
      // Only load if explicitly enabled via a flag (for dev testing)
      const useLocalStorage = localStorage.getItem('useHeaderLocalStorage') === 'true'
      if (saved && useLocalStorage) {
        const settings = JSON.parse(saved)
        if (settings.assets) {
          if (settings.assets.backgroundLayerZIndex !== undefined) {
            setBackgroundLayerZIndex(settings.assets.backgroundLayerZIndex)
          }
          if (settings.assets.backgroundType) {
            setBackgroundType(settings.assets.backgroundType)
          }
          if (settings.assets.bg) setBgSettings(settings.assets.bg)
          if (settings.assets.components) setComponentsSettings(settings.assets.components)
          if (settings.assets.left) setLeftSettings(settings.assets.left)
        }
        if (settings.info) {
          if (settings.info.patientInfo) setPatientInfoSettings(settings.info.patientInfo)
          if (settings.info.weekTracker) setWeekTrackerSettings(settings.info.weekTracker)
          if (settings.info.dosageMeter) setDosageMeterSettings(settings.info.dosageMeter)
          if (settings.info.timelineButton) setTimelineButtonSettings(settings.info.timelineButton)
          if (settings.info.separatorLine) setSeparatorLineSettings(settings.info.separatorLine)
        }
        if (settings.gameArea && settings.gameArea.topMargin !== undefined && onGameAreaTopMarginChange) {
          onGameAreaTopMarginChange(settings.gameArea.topMargin)
        }
      }
    } catch (e) {
      console.error('Failed to load header settings:', e)
    }
  }, [onGameAreaTopMarginChange])

  // Get portal container after mount
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])


  // Calculate progress (inverted - we want to go DOWN to target)
  const progress = ((initialDosage - currentDosage) / (initialDosage - targetDosage)) * 100
  const clampedProgress = Math.min(100, Math.max(0, progress))
  
  // Determine meter color based on progress
  const getMeterColor = () => {
    // Fixed dark purple color
    return 'default' // We'll override with custom styling
  }

  return (
    <>
      {/* Background layer - positioned absolutely behind content, doesn't affect header height */}
      <div 
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ 
          marginTop: '24px',
          zIndex: backgroundLayerZIndex,
          height: '250px' // Fixed height for background assets
        }}
      >
        {/* Background - gradient or image */}
        {backgroundType === 'gradient' ? (
          <div 
            className="absolute inset-0 -bottom-4"
            style={{
              background: 'linear-gradient(180deg, rgba(138, 100, 220, 0.95) 0%, rgba(100, 70, 200, 0.8) 40%, rgba(80, 50, 180, 0.5) 70%, transparent 100%)',
              zIndex: 1
            }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 -bottom-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              zIndex: 1,
              backgroundImage: 'url(/header-assets/CAH_background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
        
        {/* Header particles - flowing white glowing particles */}
        <HeaderParticles count={10} />
        
        {/* Header assets - sequential reveal */}
        {/* 1. Background - fades in first */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: bgSettings.opacity,
            x: bgSettings.left,
            y: bgSettings.top,
            scale: bgSettings.scale
          }}
          transition={{ duration: 0.6, delay: 0 }}
          style={{
            transformOrigin: 'center center',
            zIndex: bgSettings.zIndex
          }}
        >
          <img 
            alt="" 
            className="block w-full h-full object-contain"
            src="/header-assets/CAH_header-bg-asset.png"
          />
        </motion.div>

        {/* 2. Components - fades in second */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: componentsSettings.opacity,
            x: componentsSettings.left,
            y: componentsSettings.top,
            scale: componentsSettings.scale
          }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            transformOrigin: 'center center',
            zIndex: componentsSettings.zIndex
          }}
        >
          <img 
            alt="" 
            className="block w-full h-full object-contain"
            src="/header-assets/CAH_header-components-asset.png"
          />
        </motion.div>

        {/* 3. Left asset - slides in from left */}
        <motion.div 
          className="absolute pointer-events-none"
          initial={{ opacity: 0, x: -200 }}
          animate={{ 
            opacity: leftSettings.opacity,
            x: 0
          }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          style={{
            left: `${leftSettings.left}px`,
            top: `${leftSettings.top}px`,
            width: `${actualWidth}px`,
            height: `${actualHeight}px`,
            zIndex: leftSettings.zIndex
          }}
        >
          <img 
            alt="" 
            className="block w-full h-full max-w-none object-contain"
            src="/header-assets/CAH_header-left-asset.png"
          />
        </motion.div>

        {/* Light streak effect - top right */}
        <motion.div 
          className="absolute right-4 top-2 w-32 h-0.5 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent 100%)',
            filter: 'blur(0.5px)',
            boxShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(200,180,255,0.4)',
            zIndex: 5
          }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            scaleX: [0.9, 1.1, 0.9]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Content layer - this determines the header height */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full"
        style={{ 
          marginTop: '12px', 
          zIndex: 50
        }}
      >
        <div className="relative z-10 px-4 py-1.5">
        {/* Top row: Patient info, Week, Timeline button */}
        <div className="flex items-center justify-between mb-1" style={{ position: 'relative' }}>
          {/* Patient info */}
          <div
            style={{
              opacity: patientInfoSettings.opacity,
              transform: `translate(${patientInfoSettings.left}px, ${patientInfoSettings.top}px)`
            }}
          >
            <button 
              onClick={onPatientClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {/* Circular avatar with Julia's face */}
              <div 
                className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{
                  borderColor: `rgba(${theme.primaryRgb}, 0.6)`,
                  boxShadow: `0 0 12px rgba(${theme.primaryRgb}, 0.4)`
                }}
              >
                <img 
                  src="/julia.png" 
                  alt={patient?.name || 'Julia'}
                  className="w-full h-auto object-cover object-top"
                  style={{
                    transform: `scale(${patientInfoSettings.avatarScale}) translate(1%, 36%)`
                  }}
                />
              </div>
              <div className="text-left">
                <div 
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: "'Rift', 'Arial Black', 'Impact', sans-serif" }}
                >
                  {patient?.name || 'Julia'}
                </div>
                <div className="text-xs text-white/60">
                  {patient?.age || 21} {patient?.gender || 'F'}
                </div>
              </div>
            </button>
          </div>
          
          {/* Week indicator - glowing style */}
          <div 
            className="relative"
            style={{
              position: 'absolute',
              left: '50%',
              transform: `translateX(-50%) translateX(${weekTrackerSettings.left}px) translateY(${weekTrackerSettings.top}px) scale(${weekTrackerSettings.scale})`,
              opacity: weekTrackerSettings.opacity
            }}
          >
            {/* Glow layer */}
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
            <Chip
              size="sm"
              variant="flat"
              aria-label={`Current week: ${currentWeek}`}
              classNames={{
                base: "bg-white/10 border border-white/30 backdrop-blur-sm",
                content: "text-white font-semibold text-base"
              }}
              style={{
                fontFamily: "'Rift', 'Arial Black', 'Impact', sans-serif"
              }}
            >
              Week {currentWeek}
            </Chip>
          </div>
          
          {/* Timeline button */}
          <div
            style={{
              opacity: timelineButtonSettings.opacity,
              transform: `translate(${timelineButtonSettings.left}px, ${timelineButtonSettings.top}px) scale(${timelineButtonSettings.scale})`
            }}
          >
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-white/10 border border-white/20 backdrop-blur-sm"
              onPress={onTimelineClick}
            >
              <span className="text-purple-400" style={{ filter: 'hue-rotate(0deg) saturate(1.5) brightness(1.2)' }}>📊</span>
            </Button>
          </div>
        </div>
        
        {/* Bottom row: Dosage meter */}
        {showMeter && (
          <div 
            className="space-y-1"
            style={{
              position: 'relative',
              left: `${dosageMeterSettings.left}px`,
              top: `${dosageMeterSettings.top}px`,
              opacity: dosageMeterSettings.opacity,
              transform: `scale(${dosageMeterSettings.scale})`
            }}
          >
            <div 
              className="flex justify-between" 
              style={{ 
                color: '#6B21A8',
                fontSize: `${dosageMeterSettings.fontSize}px`,
                gap: `${dosageMeterSettings.gap}px`
              }}
            >
              <span>{initialDosage}mg</span>
              <span className="font-medium">{currentDosage}mg</span>
              <span>&lt;{targetDosage}mg</span>
            </div>
            <Progress
              size="sm"
              value={clampedProgress}
              color={getMeterColor()}
              aria-label="Glucocorticoid reduction progress"
              classNames={{
                base: "h-2",
                track: "!bg-[#6B21A8]/20",
                indicator: "transition-all duration-500 !bg-[#6B21A8]"
              }}
            />
            <div 
              className="text-center" 
              style={{ 
                color: '#6B21A8',
                fontSize: `${dosageMeterSettings.labelFontSize}px`
              }}
            >
              Glucocorticoid Reduction Progress
            </div>
          </div>
        )}
      </div>
      
        {/* Bottom separator line with gradient */}
        <div 
          className="absolute left-0 right-0 h-[2px]"
          style={{
            bottom: `${separatorLineSettings.top}px`,
            opacity: separatorLineSettings.opacity,
            left: `${separatorLineSettings.leftOffset}px`
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #0f033d 15%, #0f033d 100%)'
            }}
          />
          <div 
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(192, 185, 255, 0.6) 15%, rgba(192, 185, 255, 0.6) 100%)'
            }}
          />
        </div>
      </motion.div>

            {/* Header Controls - rendered outside phone frame */}
            {devControlsContainer && createPortal(
              <>
                <button
                  onClick={() => setShowHeaderControls(!showHeaderControls)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
                  aria-label="Header asset settings"
                  title="Header Assets"
                >
                  🔷
                </button>
                
                <AnimatePresence>
                  {showHeaderControls && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="fixed bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl"
                      style={{ 
                        top: '16px',
                        left: '48px',
                        width: '240px', 
                        maxHeight: 'calc(100vh - 32px)',
                        zIndex: 10000,
                        overflowY: 'auto',
                        overflowX: 'visible',
                        overscrollBehavior: 'contain'
                      }}
                    >
                <div className="text-purple-400 font-bold mb-2 flex justify-between items-center sticky top-0 bg-slate-900 pb-2">
                  <span>Header Assets</span>
                  <button 
                    onClick={() => setShowHeaderControls(false)}
                    className="text-slate-400 hover:text-white text-lg leading-none"
                  >×</button>
                </div>
                
                {/* Background Layer Z-Index Control */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-purple-300 font-semibold mb-2 text-xs">Background Layer</div>
                  
                  <label className="flex justify-between items-center gap-2 mb-2">
                    <span className="text-slate-300">Type</span>
                    <select
                      value={backgroundType}
                      onChange={(e) => setBackgroundType(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white flex-1"
                    >
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                    </select>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Z-Index</span>
                    <input 
                      type="range" min="0" max="100" value={backgroundLayerZIndex}
                      onChange={(e) => setBackgroundLayerZIndex(Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{backgroundLayerZIndex}</span>
                  </label>
                  <div className="text-xs text-slate-400 mt-1 px-1">
                    Lower = behind game space
                  </div>
                </div>
                
                {/* Background Asset */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-purple-300 font-semibold mb-2 text-xs">Background</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input 
                      type="range" min="10" max="300" value={bgSettings.scale * 100}
                      onChange={(e) => updateBgSetting('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{(bgSettings.scale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">X Position</span>
                    <input 
                      type="range" min="-500" max="500" value={bgSettings.left}
                      onChange={(e) => updateBgSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{bgSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-200" max="200" value={bgSettings.top}
                      onChange={(e) => updateBgSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{bgSettings.top}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Z-Index</span>
                    <input 
                      type="range" min="0" max="100" value={bgSettings.zIndex}
                      onChange={(e) => updateBgSetting('zIndex', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{bgSettings.zIndex}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={bgSettings.opacity * 100}
                      onChange={(e) => updateBgSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{(bgSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>

                {/* Components Asset */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-purple-300 font-semibold mb-2 text-xs">Components</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input 
                      type="range" min="10" max="300" value={componentsSettings.scale * 100}
                      onChange={(e) => updateComponentsSetting('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{(componentsSettings.scale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">X Position</span>
                    <input 
                      type="range" min="-500" max="500" value={componentsSettings.left}
                      onChange={(e) => updateComponentsSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{componentsSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-200" max="200" value={componentsSettings.top}
                      onChange={(e) => updateComponentsSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{componentsSettings.top}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Z-Index</span>
                    <input 
                      type="range" min="0" max="100" value={componentsSettings.zIndex}
                      onChange={(e) => updateComponentsSetting('zIndex', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{componentsSettings.zIndex}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={componentsSettings.opacity * 100}
                      onChange={(e) => updateComponentsSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{(componentsSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>

                {/* Left Asset */}
                <div>
                  <div className="text-purple-300 font-semibold mb-2 text-xs">Left Asset</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input 
                      type="range" min="10" max="300" value={leftSettings.scale * 100}
                      onChange={(e) => updateLeftSetting('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{(leftSettings.scale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <div className="text-xs text-slate-400 mb-2 px-1">
                    Size: {actualWidth.toFixed(0)} × {actualHeight.toFixed(0)}px
                  </div>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">X Position</span>
                    <input 
                      type="range" min="-500" max="500" value={leftSettings.left}
                      onChange={(e) => updateLeftSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{leftSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-200" max="200" value={leftSettings.top}
                      onChange={(e) => updateLeftSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{leftSettings.top}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Base Width</span>
                    <input 
                      type="range" min="50" max="500" value={leftSettings.baseWidth}
                      onChange={(e) => updateLeftSetting('baseWidth', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{leftSettings.baseWidth}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Base Height</span>
                    <input 
                      type="range" min="50" max="500" value={leftSettings.baseHeight}
                      onChange={(e) => updateLeftSetting('baseHeight', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{leftSettings.baseHeight}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Z-Index</span>
                    <input 
                      type="range" min="0" max="100" value={leftSettings.zIndex}
                      onChange={(e) => updateLeftSetting('zIndex', Number(e.target.value))}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{leftSettings.zIndex}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={leftSettings.opacity * 100}
                      onChange={(e) => updateLeftSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-purple-500"
                    />
                    <span className="w-12 text-right text-purple-300 font-mono">{(leftSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>
                
                <div className="border-t border-slate-700 my-3"></div>

                {/* Game Area Controls */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-yellow-300 font-semibold mb-2 text-xs">Game Area</div>
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top Margin</span>
                    <input 
                      type="range" min="-100" max="200" value={gameAreaTopMargin || 0}
                      onChange={(e) => onGameAreaTopMarginChange && onGameAreaTopMarginChange(Number(e.target.value))}
                      className="flex-1 h-2 accent-yellow-500"
                    />
                    <span className="w-12 text-right text-yellow-300 font-mono">{gameAreaTopMargin || 0}</span>
                  </label>
                  <div className="text-xs text-slate-400 mt-1 px-1">
                    Adjust game area height position
                  </div>
                </div>

                {/* Header Info Controls */}
                <div className="text-cyan-400 font-bold mb-2 text-xs">Header Info</div>

                {/* Patient Info */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-cyan-300 font-semibold mb-2 text-xs">Patient Info</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Left</span>
                    <input 
                      type="range" min="-100" max="100" value={patientInfoSettings.left}
                      onChange={(e) => updatePatientInfoSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{patientInfoSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-150" max="50" value={patientInfoSettings.top}
                      onChange={(e) => updatePatientInfoSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{patientInfoSettings.top}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Avatar Scale</span>
                    <input 
                      type="range" min="100" max="1000" value={patientInfoSettings.avatarScale * 100}
                      onChange={(e) => updatePatientInfoSetting('avatarScale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(patientInfoSettings.avatarScale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={patientInfoSettings.opacity * 100}
                      onChange={(e) => updatePatientInfoSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(patientInfoSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>

                {/* Week Tracker */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-cyan-300 font-semibold mb-2 text-xs">Week Tracker</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Left</span>
                    <input 
                      type="range" min="-200" max="200" value={weekTrackerSettings.left}
                      onChange={(e) => updateWeekTrackerSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{weekTrackerSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-150" max="50" value={weekTrackerSettings.top}
                      onChange={(e) => updateWeekTrackerSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{weekTrackerSettings.top}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input 
                      type="range" min="50" max="200" value={weekTrackerSettings.scale * 100}
                      onChange={(e) => updateWeekTrackerSetting('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(weekTrackerSettings.scale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={weekTrackerSettings.opacity * 100}
                      onChange={(e) => updateWeekTrackerSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(weekTrackerSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>

                {/* Timeline Button */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-cyan-300 font-semibold mb-2 text-xs">Timeline Button</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Left</span>
                    <input 
                      type="range" min="-100" max="100" value={timelineButtonSettings.left}
                      onChange={(e) => updateTimelineButtonSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{timelineButtonSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-150" max="50" value={timelineButtonSettings.top}
                      onChange={(e) => updateTimelineButtonSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{timelineButtonSettings.top}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input 
                      type="range" min="50" max="200" value={timelineButtonSettings.scale * 100}
                      onChange={(e) => updateTimelineButtonSetting('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(timelineButtonSettings.scale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={timelineButtonSettings.opacity * 100}
                      onChange={(e) => updateTimelineButtonSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(timelineButtonSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>

                {/* Separator Line */}
                <div className="border-b border-slate-700 pb-3 mb-3">
                  <div className="text-cyan-300 font-semibold mb-2 text-xs">Separator Line</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top Position</span>
                    <input 
                      type="range" min="-200" max="200" value={separatorLineSettings.top}
                      onChange={(e) => updateSeparatorLineSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{separatorLineSettings.top}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Left Offset</span>
                    <input 
                      type="range" min="0" max="200" value={separatorLineSettings.leftOffset}
                      onChange={(e) => updateSeparatorLineSetting('leftOffset', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{separatorLineSettings.leftOffset}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={separatorLineSettings.opacity * 100}
                      onChange={(e) => updateSeparatorLineSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(separatorLineSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                </div>

                {/* Dosage Meter */}
                <div className="pb-3 mb-3">
                  <div className="text-cyan-300 font-semibold mb-2 text-xs">Dosage Meter</div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Left</span>
                    <input 
                      type="range" min="-100" max="100" value={dosageMeterSettings.left}
                      onChange={(e) => updateDosageMeterSetting('left', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{dosageMeterSettings.left}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Top</span>
                    <input 
                      type="range" min="-150" max="50" value={dosageMeterSettings.top}
                      onChange={(e) => updateDosageMeterSetting('top', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{dosageMeterSettings.top}</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Scale</span>
                    <input 
                      type="range" min="50" max="200" value={dosageMeterSettings.scale * 100}
                      onChange={(e) => updateDosageMeterSetting('scale', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(dosageMeterSettings.scale * 100).toFixed(0)}%</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Opacity</span>
                    <input 
                      type="range" min="0" max="100" value={dosageMeterSettings.opacity * 100}
                      onChange={(e) => updateDosageMeterSetting('opacity', Number(e.target.value) / 100)}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{(dosageMeterSettings.opacity * 100).toFixed(0)}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2"></div>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Font Size</span>
                    <input 
                      type="range" min="8" max="24" value={dosageMeterSettings.fontSize}
                      onChange={(e) => updateDosageMeterSetting('fontSize', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{dosageMeterSettings.fontSize}px</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Label Font Size</span>
                    <input 
                      type="range" min="8" max="24" value={dosageMeterSettings.labelFontSize}
                      onChange={(e) => updateDosageMeterSetting('labelFontSize', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{dosageMeterSettings.labelFontSize}px</span>
                  </label>
                  
                  <label className="flex justify-between items-center gap-2">
                    <span className="text-slate-300">Gap</span>
                    <input 
                      type="range" min="0" max="40" value={dosageMeterSettings.gap}
                      onChange={(e) => updateDosageMeterSetting('gap', Number(e.target.value))}
                      className="flex-1 h-2 accent-cyan-500"
                    />
                    <span className="w-12 text-right text-cyan-300 font-mono">{dosageMeterSettings.gap}px</span>
                  </label>
                </div>

                <button 
                  onClick={() => {
                    const saved = localStorage.getItem('holographicHeaderSettings')
                    if (saved) {
                      console.log('Current saved settings:', saved)
                      alert('Current settings logged to console. Check browser console (F12) to see them.')
                    } else {
                      alert('No settings found in localStorage. Your previous arrangement may have been cleared.')
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 mt-3 text-xs font-medium"
                >
                  🔍 Check Saved Settings
                </button>

                <button 
                  onClick={() => {
                    const allSettings = {
                      assets: { 
                        backgroundLayerZIndex,
                        backgroundType,
                        bg: bgSettings, 
                        components: componentsSettings, 
                        left: leftSettings 
                      },
                      info: { 
                        patientInfo: patientInfoSettings, 
                        weekTracker: weekTrackerSettings,
                        timelineButton: timelineButtonSettings,
                        separatorLine: separatorLineSettings,
                        dosageMeter: dosageMeterSettings 
                      },
                      gameArea: {
                        topMargin: gameAreaTopMargin || 0
                      }
                    }
                    console.log('All Header Settings:', JSON.stringify(allSettings, null, 2))
                    localStorage.setItem('holographicHeaderSettings', JSON.stringify(allSettings))
                    alert('Settings saved to localStorage and console!')
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 rounded px-3 py-2 mt-2 text-xs font-medium"
                >
                  💾 Save Settings
                </button>
                
                <button 
                  onClick={() => {
                    // Generate code-ready format for useState defaults
                    const code = `// Copy these values to replace the useState defaults in HolographicHeader.jsx

const [backgroundLayerZIndex, setBackgroundLayerZIndex] = useState(${backgroundLayerZIndex})
const [backgroundType, setBackgroundType] = useState('${backgroundType}')

const [bgSettings, setBgSettings] = useState(${JSON.stringify(bgSettings, null, 2).replace(/\n/g, '\n    ')})

const [componentsSettings, setComponentsSettings] = useState(${JSON.stringify(componentsSettings, null, 2).replace(/\n/g, '\n    ')})

const [leftSettings, setLeftSettings] = useState(${JSON.stringify(leftSettings, null, 2).replace(/\n/g, '\n    ')})

const [patientInfoSettings, setPatientInfoSettings] = useState(${JSON.stringify(patientInfoSettings, null, 2).replace(/\n/g, '\n    ')})

const [weekTrackerSettings, setWeekTrackerSettings] = useState(${JSON.stringify(weekTrackerSettings, null, 2).replace(/\n/g, '\n    ')})

const [timelineButtonSettings, setTimelineButtonSettings] = useState(${JSON.stringify(timelineButtonSettings, null, 2).replace(/\n/g, '\n    ')})

const [separatorLineSettings, setSeparatorLineSettings] = useState(${JSON.stringify(separatorLineSettings, null, 2).replace(/\n/g, '\n    ')})

const [dosageMeterSettings, setDosageMeterSettings] = useState(${JSON.stringify(dosageMeterSettings, null, 2).replace(/\n/g, '\n    ')})`
                    
                    console.log('=== COPY THESE VALUES TO CODE ===')
                    console.log(code)
                    navigator.clipboard.writeText(code)
                    alert('Code defaults copied to clipboard! Paste them to replace the useState defaults in the file.')
                  }}
                  className="w-full bg-green-700 hover:bg-green-600 rounded px-3 py-2 mt-2 text-xs font-medium"
                >
                  💻 Copy as Code Defaults
                </button>

                <button 
                  onClick={() => {
                    const allSettings = {
                      assets: { 
                        backgroundLayerZIndex,
                        backgroundType,
                        bg: bgSettings, 
                        components: componentsSettings, 
                        left: leftSettings 
                      },
                      info: { 
                        patientInfo: patientInfoSettings, 
                        weekTracker: weekTrackerSettings,
                        timelineButton: timelineButtonSettings,
                        separatorLine: separatorLineSettings,
                        dosageMeter: dosageMeterSettings 
                      },
                      gameArea: {
                        topMargin: gameAreaTopMargin || 0
                      }
                    }
                    console.log('All Header Settings (JSON):', JSON.stringify(allSettings, null, 2))
                    navigator.clipboard.writeText(JSON.stringify(allSettings, null, 2))
                    alert('Settings copied to clipboard as JSON!')
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 mt-2 text-xs font-medium"
                >
                  📋 Copy as JSON
                </button>

                <button 
                  onClick={async () => {
                    try {
                      const jsonString = await navigator.clipboard.readText()
                      const settings = JSON.parse(jsonString)
                      
                      // Restore all settings
                      if (settings.assets) {
                        if (settings.assets.backgroundLayerZIndex !== undefined) {
                          setBackgroundLayerZIndex(settings.assets.backgroundLayerZIndex)
                        }
                        if (settings.assets.backgroundType) {
                          setBackgroundType(settings.assets.backgroundType)
                        }
                        if (settings.assets.bg) setBgSettings(settings.assets.bg)
                        if (settings.assets.components) setComponentsSettings(settings.assets.components)
                        if (settings.assets.left) setLeftSettings(settings.assets.left)
                      }
                      if (settings.info) {
                        if (settings.info.patientInfo) setPatientInfoSettings(settings.info.patientInfo)
                        if (settings.info.weekTracker) setWeekTrackerSettings(settings.info.weekTracker)
                        if (settings.info.dosageMeter) setDosageMeterSettings(settings.info.dosageMeter)
                        if (settings.info.timelineButton) setTimelineButtonSettings(settings.info.timelineButton)
                        if (settings.info.separatorLine) setSeparatorLineSettings(settings.info.separatorLine)
                      }
                      if (settings.gameArea && settings.gameArea.topMargin !== undefined && onGameAreaTopMarginChange) {
                        onGameAreaTopMarginChange(settings.gameArea.topMargin)
                      }
                      
                      // Save to localStorage
                      localStorage.setItem('holographicHeaderSettings', JSON.stringify(settings))
                      alert('Settings restored from clipboard and saved!')
                    } catch (e) {
                      alert('Failed to restore settings. Make sure you have valid JSON in your clipboard.')
                      console.error('Restore error:', e)
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-500 rounded px-3 py-2 mt-2 text-xs font-medium"
                >
                  🔄 Restore from Clipboard
                </button>
              </motion.div>
                  )}
                </AnimatePresence>
              </>,
              devControlsContainer
            )}
    </>
  )
}

export default HolographicHeader
