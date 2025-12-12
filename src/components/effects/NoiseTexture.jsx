// NoiseTexture.jsx
// Animated film grain / noise overlay for cinematic effect

import { useEffect, useRef } from 'react'

export function NoiseTexture({ opacity = 0.15, speed = 30 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId
    let timeoutId

    // Generate random noise pixels
    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255
        const alpha = Math.random() * 120
        data[i] = noise     // Red
        data[i + 1] = noise // Green
        data[i + 2] = noise // Blue
        data[i + 3] = alpha // Alpha
      }

      ctx.putImageData(imageData, 0, 0)
    }

    // Animation loop - regenerates noise
    const animate = () => {
      generateNoise()
      timeoutId = setTimeout(() => {
        animationId = requestAnimationFrame(animate)
      }, speed)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
      clearTimeout(timeoutId)
    }
  }, [speed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ 
        filter: 'contrast(2.5) brightness(1.5)', 
        opacity,
        mixBlendMode: 'overlay'
      }}
    />
  )
}

export default NoiseTexture

