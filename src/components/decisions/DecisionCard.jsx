// DecisionCard.jsx
// Draggable treatment decision card with badge and shimmer effect

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Chip } from '@heroui/react'
import { useTheme } from '../../context/ThemeContext'

const badgeConfig = {
  reduce: { 
    color: 'danger', 
    label: 'REDUCE', 
    icon: '↓',
    watermark: '↘',
    watermarkColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    cardTint: 'rgba(239, 68, 68, 0.06)',
    borderAccent: 'rgba(239, 68, 68, 0.4)',
    // Red to dark maroon gradient
    cardGradient: `linear-gradient(180deg, 
      rgba(60, 20, 25, 1) 0%, 
      rgba(40, 12, 18, 1) 30%,
      rgba(25, 8, 12, 1) 70%,
      rgba(12, 4, 6, 1) 100%
    )`
  },
  increase: { 
    color: 'success', 
    label: 'INCREASE', 
    icon: '↑',
    watermark: '↗',
    watermarkColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    cardTint: 'rgba(34, 197, 94, 0.06)',
    borderAccent: 'rgba(34, 197, 94, 0.4)',
    // Green to dark forest gradient
    cardGradient: `linear-gradient(180deg, 
      rgba(20, 50, 30, 1) 0%, 
      rgba(12, 35, 20, 1) 30%,
      rgba(6, 20, 12, 1) 70%,
      rgba(3, 10, 6, 1) 100%
    )`
  },
  new: { 
    color: 'primary', 
    label: 'NEW', 
    icon: '✦',
    watermark: '✦',
    watermarkColor: '#0ea5e9',
    glowColor: 'rgba(14, 165, 233, 0.5)',
    cardTint: 'rgba(14, 165, 233, 0.08)',
    borderAccent: 'rgba(14, 165, 233, 0.4)',
    // Cyan to dark blue gradient (original)
    cardGradient: `linear-gradient(180deg, 
      rgba(25, 40, 65, 1) 0%, 
      rgba(12, 22, 40, 1) 30%,
      rgba(6, 12, 25, 1) 70%,
      rgba(2, 5, 12, 1) 100%
    )`
  },
  maintain: { 
    color: 'default', 
    label: 'MAINTAIN', 
    icon: '→',
    watermark: '⟷',
    watermarkColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    cardTint: 'rgba(148, 163, 184, 0.04)',
    borderAccent: 'rgba(148, 163, 184, 0.3)',
    // Gray to dark slate gradient
    cardGradient: `linear-gradient(180deg, 
      rgba(40, 45, 55, 1) 0%, 
      rgba(25, 28, 35, 1) 30%,
      rgba(15, 17, 22, 1) 70%,
      rgba(8, 9, 12, 1) 100%
    )`
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
      watermarkColor: theme.primary,
      glowColor: `rgba(${theme.primaryRgb}, 0.5)`,
      cardTint: `rgba(${theme.primaryRgb}, 0.08)`,
      borderAccent: `rgba(${theme.primaryRgb}, 0.4)`,
    }
  }
  const isDragging = useRef(false)
  const [shimmer, setShimmer] = useState(false)
  
  // Get current watermark settings from shared state
  const watermarkSettings = sharedWatermarkSettings
  
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
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 40px ${config.glowColor}`
      }}
      whileHover={{ 
        scale: 1.03,
        y: -2,
        boxShadow: `0 12px 30px rgba(0,0,0,0.3), 0 0 25px ${config.glowColor}`
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
      className="relative cursor-grab active:cursor-grabbing select-none w-full h-full overflow-hidden"
      style={{
        background: config.cardGradient,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${config.borderAccent}`,
        borderTop: `2px solid ${config.borderAccent}`,
        borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        padding: '10px 8px 14px 8px',
        boxShadow: `
          0 6px 30px rgba(0,0,0,0.7),
          0 2px 8px rgba(0,0,0,0.5),
          0 0 20px ${config.glowColor.replace('0.5', '0.15')},
          inset 0 1px 1px rgba(255,255,255,0.12),
          inset 0 -1px 2px rgba(0,0,0,0.5)
        `,
        minHeight: '85px',
        touchAction: 'none'
      }}
    >
      {/* Color tint overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${config.cardTint} 0%, transparent 60%)`,
          borderRadius: '12px',
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
      <div className="text-[11px] font-semibold text-white mb-0.5 pr-6 leading-tight pointer-events-none line-clamp-2">
        {title}
      </div>

      {/* Description */}
      <div className="text-[10px] text-slate-400 leading-tight mb-1.5 pointer-events-none line-clamp-2">
        {description}
      </div>

      {/* Duration */}
      {duration && (
        <div className="flex items-center gap-1 text-[9px] text-slate-500 pointer-events-none">
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label={`Select: ${title}`}
      />
      
      {/* Drag hint */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
        <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
        <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
        <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
      </div>
    </motion.div>
  )
}

export default DecisionCard

