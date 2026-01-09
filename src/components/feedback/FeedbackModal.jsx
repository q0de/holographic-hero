// FeedbackModal.jsx
// Post-decision feedback display - In-game overlay (no portal)

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@heroui/react'
import LabDeltaCard from './LabDeltaCard'

const typeConfig = {
  success: { icon: '', color: 'success', borderColor: 'rgba(34, 197, 94, 0.5)' },
  warning: { icon: '⚠️', color: 'warning', borderColor: 'rgba(245, 158, 11, 0.5)' },
  alert: { icon: '🚨', color: 'danger', borderColor: 'rgba(239, 68, 68, 0.5)' },
  info: { icon: 'ℹ️', color: 'primary', borderColor: 'rgba(14, 165, 233, 0.5)' }
}

// Shared modal blur bevel settings - standard values from design (matching current controls)
const defaultBlurSettings = {
  backdropBlur: 12,
  borderWidth: 1,
  borderBlur: 4,
  borderOpacity: 0.73,
  outerBorderWidth: 3,
  // Background image positioning
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageScale: 1.0,
  // White layer gradient
  whiteLayerOpacity: 0, // Start at 0 so image is visible, can be adjusted
  whiteGradientDirection: 36,
  whiteGradientColor1: 'rgba(255, 192, 203, 1.0)', // light pink/magenta
  whiteGradientColor2: 'rgba(255, 255, 255, 0)',
  whiteGradientStop1: 0,
  whiteGradientStop2: 100,
  // Background image color adjustments
  imageHue: 360,
  imageSaturation: 100,
  imageBrightness: 100,
  imageOpacity: 100,
  imageColorOverlay: 'rgba(0, 0, 0, 0)',
  // Purple tint adjustment
  purpleTintColor: 'rgba(139, 92, 246, 1.0)', // purple-500
  purpleTintOpacity: 0
}

// Load settings from localStorage or use defaults
const loadBlurSettings = () => {
  try {
    const saved = localStorage.getItem('modalBlurSettings')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultBlurSettings, ...parsed }
    }
  } catch (e) {
    console.warn('Failed to load modal settings from localStorage:', e)
  }
  return { ...defaultBlurSettings }
}

// Save settings to localStorage
const saveBlurSettings = (settings) => {
  try {
    localStorage.setItem('modalBlurSettings', JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save modal settings to localStorage:', e)
  }
}

let sharedBlurSettings = loadBlurSettings()

export const getBlurSettings = () => sharedBlurSettings
export const setBlurSettings = (settings) => {
  sharedBlurSettings = { ...sharedBlurSettings, ...settings }
  // Note: saveBlurSettings is called in updateBlur, so we don't need to save here to avoid duplicate saves
}

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  description,
  type = 'success',
  labDeltas = [],
  interpolate
}) {
  const config = typeConfig[type] || typeConfig.success
  const [showControls, setShowControls] = useState(false)
  const [blurSettings, setLocalBlurSettings] = useState(() => loadBlurSettings())
  const [devControlsContainer, setDevControlsContainer] = useState(null)
  const [saveIndicator, setSaveIndicator] = useState(false)
  
  useEffect(() => {
    setDevControlsContainer(document.getElementById('dev-controls'))
  }, [])
  
  // Load saved settings on mount and sync with shared settings
  useEffect(() => {
    const saved = loadBlurSettings()
    setLocalBlurSettings(saved)
    sharedBlurSettings = saved
  }, [])
  
  const updateBlur = (key, value) => {
    const newSettings = { ...blurSettings, [key]: value }
    setLocalBlurSettings(newSettings)
    setBlurSettings(newSettings)
    saveBlurSettings(newSettings) // Save to localStorage immediately
    
    // Show save indicator briefly
    setSaveIndicator(true)
    setTimeout(() => setSaveIndicator(false), 500)
  }

  return (
    <>
      {/* Modal Blur Controls - rendered outside phone frame - only when modal is open */}
      {devControlsContainer && isOpen && createPortal(
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-600 transition-colors"
            aria-label="Modal blur settings"
            title="Modal Blur"
          >
            🔲
          </button>
          
          {showControls && (
            <div 
              className="absolute left-10 bg-slate-900 rounded-lg text-[10px] text-white border border-slate-600 shadow-xl overflow-y-auto"
              style={{ 
                width: '200px', 
                padding: '8px',
                top: '20px',
                maxHeight: 'calc(100vh - 40px)'
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="text-purple-400 font-bold text-[11px]">Modal Blur Bevel</div>
                <div className="flex items-center gap-1">
                  {saveIndicator && (
                    <span className="text-green-400 text-[9px] animate-pulse">✓ Saved</span>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem('modalBlurSettings')
                      const reset = loadBlurSettings()
                      setLocalBlurSettings(reset)
                      sharedBlurSettings = reset
                    }}
                    className="text-[9px] text-purple-400 hover:text-purple-300 px-1"
                    title="Reset to defaults"
                  >
                    ↻
                  </button>
                </div>
              </div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Backdrop Blur</span>
                <input
                  type="range" min="0" max="120" value={blurSettings.backdropBlur}
                  onChange={(e) => updateBlur('backdropBlur', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-10 text-right text-purple-300 text-[9px]">{blurSettings.backdropBlur}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Border Width</span>
                <input
                  type="range" min="0" max="8" value={blurSettings.borderWidth}
                  onChange={(e) => updateBlur('borderWidth', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-10 text-right text-purple-300 text-[9px]">{blurSettings.borderWidth}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Border Blur</span>
                <input
                  type="range" min="0" max="10" step="0.5" value={blurSettings.borderBlur}
                  onChange={(e) => updateBlur('borderBlur', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-10 text-right text-purple-300 text-[9px]">{blurSettings.borderBlur}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Border Opacity</span>
                <input
                  type="range" min="0" max="100" value={blurSettings.borderOpacity * 100}
                  onChange={(e) => updateBlur('borderOpacity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-10 text-right text-purple-300 text-[9px]">{Math.round(blurSettings.borderOpacity * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Outer Border</span>
                <input
                  type="range" min="0" max="8" value={blurSettings.outerBorderWidth}
                  onChange={(e) => updateBlur('outerBorderWidth', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-10 text-right text-purple-300 text-[9px]">{blurSettings.outerBorderWidth}px</span>
              </label>
              
              <div className="text-purple-400 font-bold mt-2 mb-1 text-[11px]">Background Image</div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Image X</span>
                <input
                  type="range" min="-200" max="200" value={blurSettings.imageOffsetX}
                  onChange={(e) => updateBlur('imageOffsetX', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.imageOffsetX}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Image Y</span>
                <input
                  type="range" min="-200" max="200" value={blurSettings.imageOffsetY}
                  onChange={(e) => updateBlur('imageOffsetY', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.imageOffsetY}px</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Image Scale</span>
                <input
                  type="range" min="50" max="200" value={blurSettings.imageScale * 100}
                  onChange={(e) => updateBlur('imageScale', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(blurSettings.imageScale * 100)}%</span>
              </label>
              
              <div className="text-purple-400 font-bold mt-2 mb-1 text-[11px]">White Layer Gradient</div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Direction</span>
                <input
                  type="range" min="0" max="360" value={blurSettings.whiteGradientDirection}
                  onChange={(e) => updateBlur('whiteGradientDirection', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.whiteGradientDirection}°</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Color 1</span>
                <input
                  type="color"
                  value={blurSettings.whiteGradientColor1.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)? 
                    `#${parseInt(blurSettings.whiteGradientColor1.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[1]).toString(16).padStart(2,'0')}${parseInt(blurSettings.whiteGradientColor1.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[2]).toString(16).padStart(2,'0')}${parseInt(blurSettings.whiteGradientColor1.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[3]).toString(16).padStart(2,'0')}` : '#ffffff'}
                  onChange={(e) => {
                    const hex = e.target.value
                    const r = parseInt(hex.slice(1, 3), 16)
                    const g = parseInt(hex.slice(3, 5), 16)
                    const b = parseInt(hex.slice(5, 7), 16)
                    const opacity = blurSettings.whiteGradientColor1.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.3'
                    updateBlur('whiteGradientColor1', `rgba(${r}, ${g}, ${b}, ${opacity})`)
                  }}
                  className="w-7 h-5 rounded border border-slate-600"
                />
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Color 1 Opacity</span>
                <input
                  type="range" min="0" max="100" value={parseFloat(blurSettings.whiteGradientColor1.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.3') * 100}
                  onChange={(e) => {
                    const match = blurSettings.whiteGradientColor1.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                    if (match) {
                      updateBlur('whiteGradientColor1', `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Number(e.target.value) / 100})`)
                    }
                  }}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(parseFloat(blurSettings.whiteGradientColor1.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.3') * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Stop 1</span>
                <input
                  type="range" min="0" max="100" value={blurSettings.whiteGradientStop1}
                  onChange={(e) => updateBlur('whiteGradientStop1', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.whiteGradientStop1}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Color 2</span>
                <input
                  type="color"
                  value={blurSettings.whiteGradientColor2.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)? 
                    `#${parseInt(blurSettings.whiteGradientColor2.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[1]).toString(16).padStart(2,'0')}${parseInt(blurSettings.whiteGradientColor2.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[2]).toString(16).padStart(2,'0')}${parseInt(blurSettings.whiteGradientColor2.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[3]).toString(16).padStart(2,'0')}` : '#ffffff'}
                  onChange={(e) => {
                    const hex = e.target.value
                    const r = parseInt(hex.slice(1, 3), 16)
                    const g = parseInt(hex.slice(3, 5), 16)
                    const b = parseInt(hex.slice(5, 7), 16)
                    const opacity = blurSettings.whiteGradientColor2.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0'
                    updateBlur('whiteGradientColor2', `rgba(${r}, ${g}, ${b}, ${opacity})`)
                  }}
                  className="w-7 h-5 rounded border border-slate-600"
                />
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Color 2 Opacity</span>
                <input
                  type="range" min="0" max="100" value={parseFloat(blurSettings.whiteGradientColor2.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0') * 100}
                  onChange={(e) => {
                    const match = blurSettings.whiteGradientColor2.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                    if (match) {
                      updateBlur('whiteGradientColor2', `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Number(e.target.value) / 100})`)
                    }
                  }}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(parseFloat(blurSettings.whiteGradientColor2.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0') * 100)}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Stop 2</span>
                <input
                  type="range" min="0" max="100" value={blurSettings.whiteGradientStop2}
                  onChange={(e) => updateBlur('whiteGradientStop2', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.whiteGradientStop2}%</span>
              </label>
              
              <div className="text-purple-400 font-bold mt-2 mb-1 text-[11px]">Image Color</div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Hue</span>
                <input
                  type="range" min="0" max="360" value={blurSettings.imageHue}
                  onChange={(e) => updateBlur('imageHue', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.imageHue}°</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Saturation</span>
                <input
                  type="range" min="0" max="200" value={blurSettings.imageSaturation}
                  onChange={(e) => updateBlur('imageSaturation', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.imageSaturation}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Brightness</span>
                <input
                  type="range" min="0" max="500" value={blurSettings.imageBrightness}
                  onChange={(e) => updateBlur('imageBrightness', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.imageBrightness}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Opacity</span>
                <input
                  type="range" min="0" max="100" value={blurSettings.imageOpacity}
                  onChange={(e) => updateBlur('imageOpacity', Number(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{blurSettings.imageOpacity}%</span>
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Color Overlay</span>
                <input
                  type="color"
                  value={blurSettings.imageColorOverlay === 'rgba(0, 0, 0, 0)' ? '#000000' : blurSettings.imageColorOverlay}
                  onChange={(e) => {
                    const hex = e.target.value
                    const r = parseInt(hex.slice(1, 3), 16)
                    const g = parseInt(hex.slice(3, 5), 16)
                    const b = parseInt(hex.slice(5, 7), 16)
                    updateBlur('imageColorOverlay', `rgba(${r}, ${g}, ${b}, 0.3)`)
                  }}
                  className="w-7 h-5 rounded border border-slate-600"
                />
              </label>
              
              <div className="text-purple-400 font-bold mt-2 mb-1 text-[11px]">Purple Tint</div>
              
              <label className="flex justify-between items-center gap-1 mb-1">
                <span className="text-slate-300 text-[10px]">Purple Color</span>
                <input
                  type="color"
                  value={blurSettings.purpleTintColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)? 
                    `#${parseInt(blurSettings.purpleTintColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[1]).toString(16).padStart(2,'0')}${parseInt(blurSettings.purpleTintColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[2]).toString(16).padStart(2,'0')}${parseInt(blurSettings.purpleTintColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)[3]).toString(16).padStart(2,'0')}` : '#8b5cf6'}
                  onChange={(e) => {
                    const hex = e.target.value
                    const r = parseInt(hex.slice(1, 3), 16)
                    const g = parseInt(hex.slice(3, 5), 16)
                    const b = parseInt(hex.slice(5, 7), 16)
                    updateBlur('purpleTintColor', `rgba(${r}, ${g}, ${b}, 1.0)`)
                  }}
                  className="w-7 h-5 rounded border border-slate-600"
                />
              </label>
              
              <label className="flex justify-between items-center gap-1 mb-0">
                <span className="text-slate-300 text-[10px]">Purple Opacity</span>
                <input
                  type="range" min="0" max="100" value={blurSettings.purpleTintOpacity * 100}
                  onChange={(e) => updateBlur('purpleTintOpacity', Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-purple-500"
                />
                <span className="w-12 text-right text-purple-300 text-[9px]">{Math.round(blurSettings.purpleTintOpacity * 100)}%</span>
              </label>
            </div>
          )}
        </div>,
        devControlsContainer
      )}
      
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
            className="w-full max-w-[320px] rounded-[24px] overflow-hidden relative"
            style={{
              background: 'transparent', // Transparent so background image shows through
              backdropFilter: `blur(${blurSettings.backdropBlur}px)`,
              WebkitBackdropFilter: `blur(${blurSettings.backdropBlur}px)`,
              border: `${blurSettings.borderWidth}px solid white`,
              boxShadow: '0px 16px 30px 0px #061124',
              zIndex: 10
            }}
          >
            {/* Blurred background image - behind modal content, cropped by modal */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px]"
              style={{
                zIndex: 0,
                filter: `
                  blur(${blurSettings.backdropBlur * 0.3}px)
                  hue-rotate(${blurSettings.imageHue}deg)
                  saturate(${blurSettings.imageSaturation}%)
                  brightness(${blurSettings.imageBrightness}%)
                `,
                WebkitFilter: `
                  blur(${blurSettings.backdropBlur * 0.3}px)
                  hue-rotate(${blurSettings.imageHue}deg)
                  saturate(${blurSettings.imageSaturation}%)
                  brightness(${blurSettings.imageBrightness}%)
                `
              }}
            >
              <img 
                alt="Background" 
                src="/LUX_Game-Sort_Version2.png"
                className="absolute"
                style={{ 
                  width: `${100 * blurSettings.imageScale}%`,
                  height: `${100 * blurSettings.imageScale}%`,
                  minWidth: '100%',
                  minHeight: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  left: `calc(50% + ${blurSettings.imageOffsetX}px)`,
                  top: `calc(50% + ${blurSettings.imageOffsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: blurSettings.imageOpacity / 100
                }}
                onError={(e) => {
                  console.error('Failed to load background image:', e.target.src)
                  console.error('Full path attempted:', window.location.origin + e.target.src)
                }}
                onLoad={() => {
                  console.log('Background image loaded successfully:', '/LUX_Game-Sort_Version2.png')
                }}
              />
            </div>
            
            {/* Color overlay on top of image */}
            {blurSettings.imageColorOverlay !== 'rgba(0, 0, 0, 0)' && (
              <div 
                className="absolute inset-0 pointer-events-none rounded-[24px]"
                style={{
                  zIndex: 0.3,
                  backgroundColor: blurSettings.imageColorOverlay
                }}
              />
            )}
            
            {/* Purple tint overlay on top of image */}
            {blurSettings.purpleTintOpacity > 0 && (
              <div 
                className="absolute inset-0 pointer-events-none rounded-[24px]"
                style={{
                  zIndex: 0.4,
                  backgroundColor: blurSettings.purpleTintColor.replace(/[\d.]+\)$/, `${blurSettings.purpleTintOpacity})`)
                }}
              />
            )}
            
            {/* White gradient overlay layer on top of image */}
            {blurSettings.whiteLayerOpacity > 0 && (
              <div 
                className="absolute inset-0 pointer-events-none rounded-[24px]"
                style={{
                  zIndex: 0.5,
                  background: `linear-gradient(${blurSettings.whiteGradientDirection}deg, ${blurSettings.whiteGradientColor1} ${blurSettings.whiteGradientStop1}%, ${blurSettings.whiteGradientColor2} ${blurSettings.whiteGradientStop2}%)`,
                  opacity: blurSettings.whiteLayerOpacity,
                  mixBlendMode: 'normal'
                }}
              />
            )}
            
            {/* Background Glow from Figma - magenta/purple radial glow - behind modal content */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                zIndex: 1,
                width: '200%',
                height: '200%',
                margin: '-50%'
              }}
            >
              <img 
                alt="" 
                src="http://localhost:3845/assets/77f632c1db581629939fe7cdbcddd9bcacd739c9.svg"
                className="block max-w-none w-full h-full"
                style={{ 
                  objectFit: 'contain',
                  opacity: 0.5,
                  mixBlendMode: 'screen'
                }}
              />
            </div>
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
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 relative z-10">
              {config.icon && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="text-xl"
                >
                  {config.icon}
                </motion.span>
              )}
              <span 
                className="text-sm relative uppercase"
                style={{
                  color: '#330145',
                  fontFamily: "'Rift', 'Rift Bold Italic', 'Arial Black', 'Impact', sans-serif",
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '0.1em',
                  filter: 'blur(0.5px)',
                  opacity: 0.9,
                  textShadow: '0 0 8px rgba(51, 1, 69, 0.5), 0 0 16px rgba(139, 92, 246, 0.3)'
                }}
              >
                {interpolate ? interpolate(title) : title}
              </span>
            </div>

            {/* Body */}
            <div className="p-4 relative z-10">
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs leading-relaxed mb-3"
                style={{ color: '#330145' }}
              >
                {interpolate ? interpolate(description) : description}
              </motion.p>

              {/* Lab Deltas */}
              {labDeltas && labDeltas.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#330145', opacity: 0.7 }}>
                    Lab Value Changes
                  </div>
                  {labDeltas.map((delta, index) => (
                    <motion.div
                      key={delta.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LabDeltaCard
                        name={delta.name}
                        before={interpolate ? interpolate(delta.before?.toString()) : delta.before}
                        after={interpolate ? interpolate(delta.after?.toString()) : delta.after}
                        unit={delta.unit}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 relative z-10">
              <Button
                color={config.color}
                variant="solid"
                onPress={onClose}
                className="w-full font-medium"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

export default FeedbackModal

