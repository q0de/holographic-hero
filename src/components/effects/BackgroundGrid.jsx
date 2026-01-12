// BackgroundGrid.jsx
// Deep layered background with depth effects

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

// Default background image settings - HARDCODED DEFAULTS (source of truth)
const defaultBgImageSettings = {
  imagePath: '/LUX_Game-Sort_Version2.png',
  offsetX: -10,
  offsetY: -54,
  scale: 1.45,
  opacity: 0.87,
  hue: 0,
  saturation: 100,
  brightness: 100
}

// Load background image settings from localStorage (OPTIONAL - only for dev overrides)
const loadBgImageSettings = () => {
  // Only load from localStorage if explicitly enabled (for dev testing)
  const useLocalStorage = localStorage.getItem('useBgImageLocalStorage') === 'true'
  if (useLocalStorage) {
    try {
      const saved = localStorage.getItem('bgImageSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...defaultBgImageSettings, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load bg image settings:', e)
    }
  }
  return { ...defaultBgImageSettings }
}

// Save background image settings to localStorage
const saveBgImageSettings = (settings) => {
  try {
    localStorage.setItem('bgImageSettings', JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save bg image settings:', e)
  }
}

// Floating particle component - MORE VISIBLE
// OPTIMIZED: Reduced default count for better performance
function FloatingParticles({ count = 20, primaryRgb }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 12 + Math.random() * 15,
    delay: Math.random() * 8,
    opacity: 0.4 + Math.random() * 0.5
  })), [count, primaryRgb])
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `rgba(${primaryRgb}, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 4}px rgba(${primaryRgb}, ${p.opacity * 0.8})`
          }}
          animate={{
            y: ['-10%', '110%'],
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

export function BackgroundGrid() {
  const { theme } = useTheme()
  const [showControls, setShowControls] = useState(false)
  const [effects, setEffects] = useState({
    particles: true,
    ambientGlow: true,
    groundShadow: true,
    fogLayers: true,
    lightRays: true
  })
  
  // Background image settings
  const [bgImageSettings, setBgImageSettings] = useState(() => loadBgImageSettings())
  
  // FanPanels (Star Burst Graphic) settings
  // Default FanPanels settings - HARDCODED DEFAULTS (source of truth)
  const defaultFanPanelsSettings = {
    opacity: 1,
    backgroundOpacity: 0.14,
    blur: 0,
    borderIntensity: 0.8,
    glowIntensity: 0.1,
    glowOpacity: 0.08
  }

  const [fanPanelsSettings, setFanPanelsSettings] = useState(defaultFanPanelsSettings)
  
  useEffect(() => {
    const saved = loadBgImageSettings()
    setBgImageSettings(saved)
    // FanPanels settings are now hardcoded - no localStorage loading
  }, [])
  
  const updateBgImage = (key, value) => {
    const newSettings = { ...bgImageSettings, [key]: value }
    setBgImageSettings(newSettings)
    saveBgImageSettings(newSettings)
  }
  
  const updateFanPanels = (key, value) => {
    const newSettings = { ...fanPanelsSettings, [key]: value }
    setFanPanelsSettings(newSettings)
    // Dispatch custom event to notify FanPanels of the update (for real-time preview)
    window.dispatchEvent(new CustomEvent('fanPanelsSettingsUpdated', { detail: newSettings }))
    // Note: Settings are hardcoded - changes are for preview only, not persisted
  }
  
  const toggleEffect = (key) => {
    setEffects(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  // Get portal container after mount
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])
  
  // Use purple for radial graphics instead of theme blue
  const c = '139, 92, 246' // violet-500
  const c2 = '168, 85, 247' // purple-500
  
  return (
    <>
      {/* Effects Control Panel - rendered outside phone frame */}
      {devControlsContainer && createPortal(
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
            aria-label="Effects settings"
            title="Effects"
          >
            ✨
          </button>
          
          {showControls && (
            <div 
              className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[10px] text-white border border-slate-600 shadow-xl overflow-y-auto"
              style={{ width: '200px', maxHeight: 'calc(100vh - 40px)', padding: '8px' }}
            >
              <div className="text-purple-400 font-bold mb-1 text-[11px]">Depth Effects</div>
              
              {Object.entries(effects).map(([key, value]) => (
                <label key={key} className="flex items-center gap-1 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleEffect(key)}
                    className="w-3 h-3 accent-purple-500"
                  />
                  <span className="capitalize text-slate-300 text-[10px]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
              
              <div className="text-purple-400 font-bold mt-3 mb-1 text-[11px]">Background Image</div>
              
              <label className="flex justify-between items-center gap-1 mb-2">
                <span className="text-slate-300 text-[10px]">Image</span>
                <select
                  value={bgImageSettings.imagePath || '/LUX_Game-Sort_Version2.png'}
                  onChange={(e) => updateBgImage('imagePath', e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-[9px] text-white flex-1"
                >
                  <option value="/LUX_Game-Sort_Version2.png">Default</option>
                  <option value="/header-assets/CAH_background.png">CAH Background</option>
                </select>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">X Offset</span>
                <input
                  type="range" min="-200" max="200" value={bgImageSettings.offsetX}
                  onChange={(e) => updateBgImage('offsetX', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{bgImageSettings.offsetX}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Y Offset</span>
                <input
                  type="range" min="-200" max="200" value={bgImageSettings.offsetY}
                  onChange={(e) => updateBgImage('offsetY', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{bgImageSettings.offsetY}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Scale</span>
                <input
                  type="range" min="50" max="300" value={bgImageSettings.scale * 100}
                  onChange={(e) => updateBgImage('scale', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(bgImageSettings.scale * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Opacity</span>
                <input
                  type="range" min="0" max="100" value={bgImageSettings.opacity * 100}
                  onChange={(e) => updateBgImage('opacity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(bgImageSettings.opacity * 100)}%</span>
              </label>
              
              <div className="text-purple-400 font-bold mt-2 mb-1 text-[11px]">Color Adjust</div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Hue</span>
                <input
                  type="range" min="0" max="360" value={bgImageSettings.hue}
                  onChange={(e) => updateBgImage('hue', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{bgImageSettings.hue}°</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Saturation</span>
                <input
                  type="range" min="0" max="200" value={bgImageSettings.saturation}
                  onChange={(e) => updateBgImage('saturation', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{bgImageSettings.saturation}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Brightness</span>
                <input
                  type="range" min="0" max="200" value={bgImageSettings.brightness}
                  onChange={(e) => updateBgImage('brightness', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{bgImageSettings.brightness}%</span>
              </label>
              
              <div className="text-purple-400 font-bold mt-3 mb-1 text-[11px]">Star Burst Graphic (FanPanels)</div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Opacity</span>
                <input
                  type="range" min="0" max="100" value={fanPanelsSettings.opacity * 100}
                  onChange={(e) => updateFanPanels('opacity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(fanPanelsSettings.opacity * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Background Opacity</span>
                <input
                  type="range" min="0" max="100" value={fanPanelsSettings.backgroundOpacity * 100}
                  onChange={(e) => updateFanPanels('backgroundOpacity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(fanPanelsSettings.backgroundOpacity * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Blur</span>
                <input
                  type="range" min="0" max="20" step="0.5" value={fanPanelsSettings.blur}
                  onChange={(e) => updateFanPanels('blur', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{fanPanelsSettings.blur}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Border Intensity</span>
                <input
                  type="range" min="0" max="100" value={fanPanelsSettings.borderIntensity * 100}
                  onChange={(e) => updateFanPanels('borderIntensity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(fanPanelsSettings.borderIntensity * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Glow Intensity</span>
                <input
                  type="range" min="0" max="100" value={fanPanelsSettings.glowIntensity * 100}
                  onChange={(e) => updateFanPanels('glowIntensity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(fanPanelsSettings.glowIntensity * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-0">
                <span className="text-slate-300 text-[10px]">Glow Opacity</span>
                <input
                  type="range" min="0" max="100" value={fanPanelsSettings.glowOpacity * 100}
                  onChange={(e) => updateFanPanels('glowOpacity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(fanPanelsSettings.glowOpacity * 100)}%</span>
              </label>
              
              <button 
                onClick={() => {
                  const code = `// Copy these values to replace the defaultBgImageSettings in BackgroundGrid.jsx

const defaultBgImageSettings = {
  imagePath: '${bgImageSettings.imagePath}',
  offsetX: ${bgImageSettings.offsetX},
  offsetY: ${bgImageSettings.offsetY},
  scale: ${bgImageSettings.scale},
  opacity: ${bgImageSettings.opacity},
  hue: ${bgImageSettings.hue},
  saturation: ${bgImageSettings.saturation},
  brightness: ${bgImageSettings.brightness}
}`
                  console.log('=== COPY THESE VALUES TO CODE ===')
                  console.log(code)
                  navigator.clipboard.writeText(code)
                  alert('Background image settings copied to clipboard!')
                }}
                className="w-full bg-green-600 hover:bg-green-500 rounded px-2 py-1.5 mt-2 text-[10px] font-medium"
              >
                💻 Copy Bg Image as Code
              </button>
              
              <button 
                onClick={() => {
                  const code = `// Copy these values to replace the defaultFanPanelsSettings in BackgroundGrid.jsx

const defaultFanPanelsSettings = {
  opacity: ${fanPanelsSettings.opacity},
  backgroundOpacity: ${fanPanelsSettings.backgroundOpacity},
  blur: ${fanPanelsSettings.blur},
  borderIntensity: ${fanPanelsSettings.borderIntensity},
  glowIntensity: ${fanPanelsSettings.glowIntensity},
  glowOpacity: ${fanPanelsSettings.glowOpacity}
}`
                  console.log('=== COPY THESE VALUES TO CODE ===')
                  console.log(code)
                  navigator.clipboard.writeText(code)
                  alert('FanPanels settings copied to clipboard!')
                }}
                className="w-full bg-green-600 hover:bg-green-500 rounded px-2 py-1.5 mt-1 text-[10px] font-medium"
              >
                💻 Copy FanPanels as Code
              </button>
            </div>
          )}
        </div>,
        devControlsContainer
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main background image - LUX_Game-Sort_Version2.png */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImageSettings.imagePath || '/LUX_Game-Sort_Version2.png'})`,
            backgroundSize: `${bgImageSettings.scale * 100}%`,
            backgroundPosition: `calc(50% + ${bgImageSettings.offsetX}px) calc(50% + ${bgImageSettings.offsetY}px)`,
            backgroundRepeat: 'no-repeat',
            opacity: bgImageSettings.opacity,
            filter: `
              hue-rotate(${bgImageSettings.hue}deg)
              saturate(${bgImageSettings.saturation}%)
              brightness(${bgImageSettings.brightness}%)
            `,
            WebkitFilter: `
              hue-rotate(${bgImageSettings.hue}deg)
              saturate(${bgImageSettings.saturation}%)
              brightness(${bgImageSettings.brightness}%)
            `
          }}
        />
        
        {/* Figma Glass Panel Background overlay - dark purple with inner glow (reduced opacity so background image shows through) */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'rgba(6, 2, 19, 0.4)',
            boxShadow: `
              inset 0px 3px 9px 0px rgba(255, 255, 255, 0.6),
              inset 0px 24px 36px 0px #9a89e6,
              inset 0px 72px 96px 0px #583bdc
            `
          }}
        />
        
        {/* Distant stars - keep original simple version */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 80% 25%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 35% 8%, rgba(${c}, 0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 65% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 10% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 90% 18%, rgba(${c}, 0.6) 0%, transparent 100%)
            `
          }}
        />
        
        {/* Floating Particles - MORE VISIBLE */}
        {/* OPTIMIZED: Reduced from 30 to 20 particles for better performance */}
        {effects.particles && <FloatingParticles count={20} primaryRgb={c} />}
        
        {/* Animated Ambient Glow - STRONGER */}
        {effects.ambientGlow && (
          <motion.div 
            className="absolute inset-0"
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              background: `
                radial-gradient(circle at 20% 25%, rgba(${c}, 0.25) 0%, transparent 35%),
                radial-gradient(circle at 80% 35%, rgba(${c2}, 0.2) 0%, transparent 30%),
                radial-gradient(circle at 50% 75%, rgba(${c}, 0.15) 0%, transparent 40%)
              `
            }}
          />
        )}
        
        {/* Fog Layers - MORE VISIBLE */}
        {effects.fogLayers && (
          <>
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(0deg, rgba(${c}, 0.15) 0%, transparent 40%)`
              }}
            />
            <motion.div 
              className="absolute inset-0"
              animate={{ x: ['-5%', '5%', '-5%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(ellipse 100% 40% at 50% 90%, rgba(${c}, 0.2) 0%, transparent 70%)`
              }}
            />
          </>
        )}
        
        {/* Light Rays - STRONGER */}
        {effects.lightRays && (
          <motion.div 
            className="absolute inset-0"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `
                linear-gradient(170deg, transparent 35%, rgba(${c}, 0.4) 50%, transparent 65%),
                linear-gradient(190deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)
              `,
              transformOrigin: '50% 40%'
            }}
          />
        )}
        
        {/* Spotlight behind Julia */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 50% 40%, rgba(${c}, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 50% 45%, rgba(${c2}, 0.15) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Ground Shadow - STRONGER - Lighter purple */}
        {effects.groundShadow && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-[50%]"
            style={{
              background: `
                radial-gradient(ellipse 90% 50% at 50% 100%, rgba(60, 40, 100, 0.7) 0%, transparent 70%),
                linear-gradient(0deg, rgba(50, 35, 85, 0.6) 0%, transparent 60%)
              `
            }}
          />
        )}
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(${c}, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(${c}, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)'
          }}
        />
        
        {/* Scan lines */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.04) 2px,
              rgba(255, 255, 255, 0.04) 4px
            )`
          }}
        />
        
        {/* Vignette - Lighter purple */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(45, 30, 80, 0.5) 100%)'
          }}
        />
      </div>
    </>
  )
}

export default BackgroundGrid

