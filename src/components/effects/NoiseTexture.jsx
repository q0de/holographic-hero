// NoiseTexture.jsx
// Animated film grain / noise overlay for cinematic effect
// OPTIMIZED: Uses smaller resolution (1/3 scale) with CSS scaling for ~9x performance boost

import { useEffect, useRef, memo } from 'react'

function NoiseTexture({ opacity = 0.15, speed = 30 }) {
  const canvasRef = useRef(null)
  const noiseDataRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // OPTIMIZATION: Render at 1/3 resolution, then scale up with CSS
    // This reduces pixel operations by ~9x (3x width × 3x height)
    const scale = 0.33
    
    // State variables
    let renderWidth = Math.max(Math.ceil(window.innerWidth * scale), 320)
    let renderHeight = Math.max(Math.ceil(window.innerHeight * scale), 240)
    let imageData = ctx.createImageData(renderWidth, renderHeight)
    let pixelCount = renderWidth * renderHeight

    // Set canvas internal size (smaller)
    canvas.width = renderWidth
    canvas.height = renderHeight
    // CSS will scale it up via the fixed inset-0 class

    // Pre-generate noise data buffer for faster updates
    noiseDataRef.current = new Uint8Array(pixelCount * 4)

    let animationId
    let lastTime = 0

    // Generate initial noise pattern
    const generateInitialNoise = () => {
      const count = noiseDataRef.current.length / 4
      for (let i = 0; i < count; i++) {
        const idx = i * 4
        const noise = Math.floor(Math.random() * 255)
        const alpha = Math.floor(Math.random() * 120)
        noiseDataRef.current[idx] = noise     // Red
        noiseDataRef.current[idx + 1] = noise // Green
        noiseDataRef.current[idx + 2] = noise // Blue
        noiseDataRef.current[idx + 3] = alpha // Alpha
      }
    }

    // Draw noise to canvas
    const drawNoise = () => {
      // Copy to ImageData and draw
      imageData.data.set(noiseDataRef.current)
      ctx.putImageData(imageData, 0, 0)
    }

    // Scroll/shift noise pattern (much faster than regenerating)
    const updateNoise = () => {
      frameRef.current++
      
      // Every few frames, update some pixels to keep it animated
      // Only update ~10% of pixels per frame for performance
      const currentPixelCount = noiseDataRef.current.length / 4
      const updateRate = Math.max(1, Math.floor(speed / 10))
      if (frameRef.current % updateRate === 0) {
        // Randomly update a small percentage of pixels
        const pixelsToUpdate = Math.floor(currentPixelCount * 0.1)
        for (let i = 0; i < pixelsToUpdate; i++) {
          const randomIdx = Math.floor(Math.random() * currentPixelCount) * 4
          const noise = Math.floor(Math.random() * 255)
          const alpha = Math.floor(Math.random() * 120)
          noiseDataRef.current[randomIdx] = noise
          noiseDataRef.current[randomIdx + 1] = noise
          noiseDataRef.current[randomIdx + 2] = noise
          noiseDataRef.current[randomIdx + 3] = alpha
        }
      }

      // Always draw on every frame to ensure animation
      drawNoise()
    }

    // Resize handler
    const resizeCanvas = () => {
      const newWidth = Math.max(Math.ceil(window.innerWidth * scale), 320)
      const newHeight = Math.max(Math.ceil(window.innerHeight * scale), 240)
      
      if (newWidth !== renderWidth || newHeight !== renderHeight) {
        renderWidth = newWidth
        renderHeight = newHeight
        pixelCount = renderWidth * renderHeight
        canvas.width = renderWidth
        canvas.height = renderHeight
        
        // Regenerate noise data for new size
        noiseDataRef.current = new Uint8Array(pixelCount * 4)
        imageData = ctx.createImageData(renderWidth, renderHeight)
        generateInitialNoise()
        // Draw immediately after resize
        drawNoise()
      }
    }

    generateInitialNoise()
    // Draw initial noise immediately
    drawNoise()
    
    window.addEventListener('resize', resizeCanvas, { passive: true })

    // Optimized animation loop using requestAnimationFrame
    const animate = (currentTime) => {
      // Throttle pixel updates based on speed parameter, but always draw
      if (currentTime - lastTime >= speed) {
        updateNoise()
        lastTime = currentTime
      } else {
        // Still draw every frame even if not updating pixels for smooth animation
        drawNoise()
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [speed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ 
        filter: 'contrast(2.5) brightness(1.5)', 
        opacity,
        mixBlendMode: 'overlay',
        imageRendering: 'pixelated', // Better upscaling quality for noise
        willChange: 'contents' // GPU acceleration hint
      }}
    />
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(NoiseTexture)



