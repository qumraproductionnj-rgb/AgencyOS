'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  maxOpacity: number
}

interface ParticlesProps {
  visible: boolean
}

export function Particles({ visible }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    particles.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0,
      maxOpacity: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles.current) {
        p.y -= p.speedY
        p.x += p.speedX
        if (p.opacity < p.maxOpacity) p.opacity += 0.003
        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
          p.opacity = 0
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    if (visible) draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [visible])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}
    />
  )
}
