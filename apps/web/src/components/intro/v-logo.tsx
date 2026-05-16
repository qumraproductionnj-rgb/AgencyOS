'use client'

import { useEffect, useRef } from 'react'

interface VLogoProps {
  animate: boolean
  size?: number
}

export function VLogo({ animate, size = 120 }: VLogoProps) {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    if (animate) {
      path.style.strokeDashoffset = '200'
      const start = performance.now()
      const duration = 900

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        path.style.strokeDashoffset = String(200 * (1 - eased))
        if (t < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    } else {
      path.style.strokeDashoffset = '200'
    }
  }, [animate])

  return (
    <svg viewBox="0 0 100 80" width={size} height={size * 0.8} className="pointer-events-none">
      <defs>
        <filter id="v-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="v-glow-strong">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0 1  0 0 0 1 0"
            result="coloredBlur"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer */}
      <path
        d="M10,10 L50,70 L90,10"
        fill="none"
        stroke="rgba(150,130,255,0.4)"
        strokeWidth="14"
        strokeLinecap="round"
        filter="url(#v-glow-strong)"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: animate ? 0 : 200,
          transition: animate ? 'none' : undefined,
        }}
      />
      {/* Main V */}
      <path
        ref={pathRef}
        d="M10,10 L50,70 L90,10"
        fill="none"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#v-glow)"
        style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
      />
    </svg>
  )
}
