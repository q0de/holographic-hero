// DecisionCard.jsx
// Draggable treatment decision card with badge and shimmer effect

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Chip } from '@heroui/react'
import { useTheme } from '../../context/ThemeContext'

// Glass panel style from Figma - scaled for tile size (160x77px)
// Original uses inset shadows: white top edge, lavender mid, deep purple outer
const badgeConfig = {
  reduce: { 
    color: 'danger', 
    label: 'REDUCE', 
    icon: '↓',
    watermark: '↘',
    watermarkColor: 'rgba(255, 120, 120, 0.4)',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    // Glass panel inner shadows - red/rose tinted
    innerGlow: `
      inset 0px 1px 3px 0px rgba(255, 200, 200, 0.9),
      inset 0px 6px 12px 0px rgba(230, 140, 160, 0.6),
      inset 0px 20px 30px 0px rgba(180, 60, 90, 0.4)
    `,
    bgColor: 'rgba(25, 6, 10, 0.1)'
  },
  increase: { 
    color: 'success', 
    label: 'INCREASE', 
    icon: '↑',
    watermark: '↗',
    watermarkColor: 'rgba(120, 255, 150, 0.4)',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    // Glass panel inner shadows - green/teal tinted
    innerGlow: `
      inset 0px 1px 3px 0px rgba(200, 255, 220, 0.9),
      inset 0px 6px 12px 0px rgba(120, 220, 160, 0.6),
      inset 0px 20px 30px 0px rgba(40, 160, 100, 0.4)
    `,
    bgColor: 'rgba(6, 20, 12, 0.1)'
  },
  new: { 
    color: 'primary', 
    label: 'NEW', 
    icon: '✦',
    watermark: '✦',
    watermarkColor: 'rgba(140, 180, 255, 0.4)',
    glowColor: 'rgba(88, 59, 220, 0.5)',
    // Glass panel inner shadows - purple/indigo (from Figma)
    innerGlow: `
      inset 0px 1px 3px 0px rgba(255, 255, 255, 0.9),
      inset 0px 6px 12px 0px rgba(154, 137, 230, 0.6),
      inset 0px 20px 30px 0px rgba(88, 59, 220, 0.4)
    `,
    bgColor: 'rgba(6, 2, 19, 0.1)'
  },
  maintain: { 
    color: 'default', 
    label: 'MAINTAIN', 
    icon: '→',
    watermark: '⟷',
    watermarkColor: 'rgba(180, 180, 200, 0.4)',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    // Glass panel inner shadows - neutral/slate tinted
    innerGlow: `
      inset 0px 1px 3px 0px rgba(220, 220, 230, 0.9),
      inset 0px 6px 12px 0px rgba(160, 160, 190, 0.6),
      inset 0px 20px 30px 0px rgba(100, 100, 140, 0.4)
    `,
    bgColor: 'rgba(10, 10, 15, 0.1)'
  }
}

// Default watermark settings - can be adjusted via controls
const defaultWatermarkSettings = {
  size: 75,
  opacity: 0.1,
  rotation: -5,
  offsetX: -1,
  offsetY: -10
}

// Shared watermark settings state (outside component to persist)
let sharedWatermarkSettings = { ...defaultWatermarkSettings }

// Export functions to get/set watermark settings from outside
export const getWatermarkSettings = () => sharedWatermarkSettings
export const setWatermarkSettings = (settings) => {
  sharedWatermarkSettings = { ...sharedWatermarkSettings, ...settings }
}

// Default card background graphic settings - HARDCODED DEFAULTS (source of truth)
const defaultCardBgSettings = {
  enabled: true,
  opacity: 100,
  scale: 1.77,
  offsetX: 6,
  offsetY: 0,
  textMode: 'dark' // 'light' or 'dark'
}

// Load card background settings from localStorage (OPTIONAL - only for dev overrides)
const loadCardBgSettings = () => {
  // Only load from localStorage if explicitly enabled (for dev testing)
  const useLocalStorage = localStorage.getItem('useCardBgLocalStorage') === 'true'
  if (useLocalStorage) {
    try {
      const saved = localStorage.getItem('cardBgSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...defaultCardBgSettings, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load card bg settings:', e)
    }
  }
  return { ...defaultCardBgSettings }
}

// Save card background settings to localStorage (for dev/testing only)
const saveCardBgSettings = (settings) => {
  try {
    localStorage.setItem('cardBgSettings', JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save card bg settings:', e)
  }
}

// Shared card background settings state (outside component to persist)
let sharedCardBgSettings = loadCardBgSettings()

// Export functions to get/set card background settings from outside
export const getCardBgSettings = () => sharedCardBgSettings
export const setCardBgSettings = (settings) => {
  sharedCardBgSettings = { ...sharedCardBgSettings, ...settings }
  saveCardBgSettings(sharedCardBgSettings)
}

export function DecisionCard({
  title,
  description,
  duration,
  badge = 'maintain',
  optionKey,
  index = 0,
  onDragStart,
  onDragEnd,
  onTap
}) {
  const { theme } = useTheme()
  
  // Get config, but override "new" type with theme colors
  let config = badgeConfig[badge] || badgeConfig.maintain
  if (badge === 'new') {
    config = {
      ...config,
      watermarkColor: `rgba(${theme.primaryRgb}, 0.4)`,
      glowColor: `rgba(${theme.primaryRgb}, 0.5)`,
      innerGlow: `
        inset 0px 1px 3px 0px rgba(255, 255, 255, 0.9),
        inset 0px 6px 12px 0px rgba(${theme.primaryRgb}, 0.6),
        inset 0px 20px 30px 0px rgba(${theme.primaryRgb}, 0.4)
      `,
    }
  }
  const isDragging = useRef(false)
  const [shimmer, setShimmer] = useState(false)
  
  // Get current watermark settings from shared state
  const watermarkSettings = sharedWatermarkSettings
  
  // Get current card background settings from shared state
  const cardBgSettings = sharedCardBgSettings
  
  // Shimmer effect - once on entry, then rarely
  useEffect(() => {
    const entryDelay = 800 + index * 150 // Shimmer shortly after card appears
    
    const triggerShimmer = () => {
      setShimmer(true)
      setTimeout(() => setShimmer(false), 600)
    }
    
    // Initial shimmer after card enters
    const entryTimer = setTimeout(triggerShimmer, entryDelay)
    
    // Rare intermittent shimmer (every 15-25 seconds)
    const randomInterval = 15000 + Math.random() * 10000
    const intervalId = setInterval(triggerShimmer, randomInterval)
    
    return () => {
      clearTimeout(entryTimer)
      clearInterval(intervalId)
    }
  }, [index])

  const handleDragStart = () => {
    isDragging.current = true
    onDragStart?.()
  }

  const handleDragEnd = (e, info) => {
    // Keep dragging true for a moment to prevent tap from firing
    setTimeout(() => {
      isDragging.current = false
    }, 100)
    onDragEnd?.(optionKey, info)
  }

  // Framer Motion's onTap only fires if user didn't drag
  const handleTap = () => {
    if (!isDragging.current) {
      onTap?.(optionKey)
    }
  }

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragElastic={0.18}
      dragConstraints={{ left: -50, right: 50, top: -400, bottom: 0 }}
      dragTransition={{ 
        bounceStiffness: 300, 
        bounceDamping: 20 
      }}
      whileDrag={{ 
        scale: 1.1, 
        rotate: 5, 
        zIndex: 100,
        boxShadow: `${config.innerGlow}, 0 20px 40px rgba(0,0,0,0.4), 0 0 50px ${config.glowColor}`
      }}
      whileHover={{ 
        scale: 1.03,
        y: -2,
        boxShadow: `${config.innerGlow}, 0 12px 30px rgba(0,0,0,0.3), 0 0 30px ${config.glowColor}`
      }}
      whileTap={{ scale: 0.98 }}
      onTapStart={() => { isDragging.current = false }}
      onTap={handleTap}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={(e) => e.key === 'Enter' && onTap?.(optionKey)}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${description}. Duration: ${duration} weeks`}
      className="relative cursor-grab active:cursor-grabbing select-none w-full h-full overflow-clip"
      style={{
        background: config.bgColor,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: 'none',
        borderRadius: '20px',
        padding: '10px 8px 14px 8px',
        boxShadow: config.innerGlow,
        minHeight: '85px',
        touchAction: 'none'
      }}
    >
      {/* Background graphic - same as modal */}
      {cardBgSettings.enabled && (
        <img 
          alt="Background" 
          src="/CAH_modal.png"
          className="absolute inset-0 w-full h-full"
          style={{ 
            objectFit: 'cover',
            objectPosition: `calc(50% + ${cardBgSettings.offsetX}px) calc(50% + ${cardBgSettings.offsetY}px)`,
            opacity: cardBgSettings.opacity / 100,
            transform: `scale(${cardBgSettings.scale})`,
            zIndex: 0
          }}
          onError={(e) => {
            console.error('Failed to load card background image:', e.target.src)
          }}
        />
      )}
      
      {/* Glass panel glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[20px]"
        style={{
          boxShadow: config.innerGlow,
          zIndex: 1
        }}
      />
      
      {/* Watermark icon - large subtle background symbol */}
      <div 
        className="absolute pointer-events-none select-none"
        style={{
          right: `${watermarkSettings.offsetX}px`,
          bottom: `${watermarkSettings.offsetY}px`,
          fontSize: `${watermarkSettings.size}px`,
          fontWeight: 'bold',
          color: config.watermarkColor,
          opacity: watermarkSettings.opacity,
          lineHeight: 1,
          transform: `rotate(${watermarkSettings.rotation}deg)`,
          zIndex: 2
        }}
      >
        {config.watermark}
      </div>
      
      
      {/* Shimmer effect overlay */}
      {shimmer && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            transform: 'skewX(-20deg)',
          }}
        />
      )}
      {/* Badge - positioned inside */}
      <div className="absolute top-1 right-1 pointer-events-none">
        <Chip
          size="sm"
          color={config.color}
          variant="flat"
          classNames={{
            base: "h-4 px-1.5 min-w-0",
            content: "text-[8px] font-bold tracking-wide px-0"
          }}
        >
          {config.icon}
        </Chip>
      </div>

      {/* Title */}
      <div 
        className={`text-[11px] font-semibold mb-0.5 pr-6 leading-tight pointer-events-none line-clamp-2 relative`}
        style={{ 
          zIndex: 3,
          color: cardBgSettings.textMode === 'dark' ? '#330145' : '#ffffff'
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div 
        className="text-[10px] leading-tight mb-1.5 pointer-events-none line-clamp-2 relative"
        style={{ 
          zIndex: 3,
          color: cardBgSettings.textMode === 'dark' ? 'rgba(51, 1, 69, 0.8)' : 'rgb(148, 163, 184)'
        }}
      >
        {description}
      </div>

      {/* Duration */}
      {duration && (
        <div 
          className="flex items-center gap-1 text-[9px] pointer-events-none relative"
          style={{ 
            zIndex: 3,
            color: cardBgSettings.textMode === 'dark' ? 'rgba(51, 1, 69, 0.7)' : 'rgb(100, 116, 139)'
          }}
        >
          <span>⏱</span>
          <span>{duration}w</span>
        </div>
      )}

      {/* Tap to select button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onTap?.(optionKey)
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ zIndex: 10 }}
        aria-label={`Select: ${title}`}
      />
      
      {/* Drag hint */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
        <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
        <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
      </div>
    </motion.div>
  )
}

export default DecisionCard

