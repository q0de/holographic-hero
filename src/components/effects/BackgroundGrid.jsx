// BackgroundGrid.jsx
// Deep layered background with depth effects

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

// Floating particle component - MORE VISIBLE
function FloatingParticles({ count = 20 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4, // Bigger particles
    duration: 12 + Math.random() * 15,
    delay: Math.random() * 8,
    opacity: 0.4 + Math.random() * 0.5 // Higher opacity
  }))
  
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
            background: `rgba(14, 165, 233, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 4}px rgba(14, 165, 233, ${p.opacity * 0.8})`
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
  const [showControls, setShowControls] = useState(false)
  const [effects, setEffects] = useState({
    particles: true,
    ambientGlow: true,
    groundShadow: true,
    fogLayers: true,
    lightRays: true
  })
  
  const toggleEffect = (key) => {
    setEffects(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  // Render controls outside phone frame via portal
  const devControlsContainer = document.getElementById('dev-controls')
  
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
            🎨
          </button>
          
          {showControls && (
            <div 
              className="absolute top-0 left-10 bg-slate-900 rounded-lg p-3 text-[11px] text-white space-y-2 border border-slate-600 shadow-xl"
              style={{ width: '140px' }}
            >
              <div className="text-purple-400 font-bold mb-2">Depth Effects</div>
              
              {Object.entries(effects).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleEffect(key)}
                    className="w-3 h-3 accent-purple-500"
                  />
                  <span className="capitalize text-slate-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          )}
        </div>,
        devControlsContainer
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Deep space gradient - creates depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 100%, rgba(10, 15, 30, 1) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20, 30, 50, 0.8) 0%, transparent 70%),
              linear-gradient(180deg, rgba(8, 12, 24, 1) 0%, rgba(15, 23, 42, 1) 50%, rgba(10, 18, 35, 1) 100%)
            `
          }}
        />
        
        {/* Distant stars */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 80% 25%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 35% 8%, rgba(14, 165, 233, 0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 65% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 10% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 90% 18%, rgba(14, 165, 233, 0.6) 0%, transparent 100%)
            `
          }}
        />
        
        {/* Floating Particles - MORE VISIBLE */}
        {effects.particles && <FloatingParticles count={30} />}
        
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
                radial-gradient(circle at 20% 25%, rgba(14, 165, 233, 0.25) 0%, transparent 35%),
                radial-gradient(circle at 80% 35%, rgba(99, 102, 241, 0.2) 0%, transparent 30%),
                radial-gradient(circle at 50% 75%, rgba(14, 165, 233, 0.15) 0%, transparent 40%)
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
                background: 'linear-gradient(0deg, rgba(14, 165, 233, 0.15) 0%, transparent 40%)'
              }}
            />
            <motion.div 
              className="absolute inset-0"
              animate={{ x: ['-5%', '5%', '-5%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'radial-gradient(ellipse 100% 40% at 50% 90%, rgba(100, 150, 200, 0.25) 0%, transparent 70%)'
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
                linear-gradient(170deg, transparent 35%, rgba(14, 165, 233, 0.4) 50%, transparent 65%),
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
              radial-gradient(ellipse 60% 40% at 50% 40%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 50% 45%, rgba(30, 64, 100, 0.2) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Ground Shadow - STRONGER */}
        {effects.groundShadow && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-[50%]"
            style={{
              background: `
                radial-gradient(ellipse 90% 50% at 50% 100%, rgba(0, 0, 0, 0.7) 0%, transparent 70%),
                linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, transparent 60%)
              `
            }}
          />
        )}
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14, 165, 233, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14, 165, 233, 0.4) 1px, transparent 1px)
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
        
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(5, 10, 20, 0.7) 100%)'
          }}
        />
      </div>
    </>
  )
}

export default BackgroundGrid

