'use client'

import { useEffect, useState, useCallback } from 'react'
import { Particles } from './particles'
import { Silhouette } from './silhouette'
import { VLogo } from './v-logo'

interface VisionIntroProps {
  onComplete: () => void
}

type Stage =
  | 'black'
  | 'particles'
  | 'silhouette'
  | 'chest-glow'
  | 'v-draw'
  | 'text'
  | 'hud'
  | 'fadeout'

export function VisionIntro({ onComplete }: VisionIntroProps) {
  const [stage, setStage] = useState<Stage>('black')
  const [containerOpacity, setContainerOpacity] = useState(1)
  const [showSkip, setShowSkip] = useState(false)
  const [chestGlowScale, setChestGlowScale] = useState(0)
  const [textVisible, setTextVisible] = useState(false)
  const [hudVisible, setHudVisible] = useState(false)
  const [typewriterText, setTypewriterText] = useState('')

  const complete = useCallback(() => {
    setContainerOpacity(0)
    setTimeout(onComplete, 600)
  }, [onComplete])

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const sequence: [Stage, number][] = [
      ['particles', 500],
      ['silhouette', 1500],
      ['chest-glow', 2500],
      ['v-draw', 3500],
      ['text', 4500],
      ['hud', 5000],
      ['fadeout', 5500],
    ]

    const timers: ReturnType<typeof setTimeout>[] = []

    for (const [s, delay] of sequence) {
      timers.push(setTimeout(() => setStage(s), delay))
    }

    timers.push(setTimeout(complete, 6100))

    return () => timers.forEach(clearTimeout)
  }, [complete])

  // Chest glow pulse
  useEffect(() => {
    if (stage !== 'chest-glow') return
    let scale = 0
    let dir = 1
    let pulses = 0
    const interval = setInterval(() => {
      scale += dir * 0.08
      if (scale >= 1) {
        dir = -1
        pulses++
      }
      if (scale <= 0 && pulses > 0) {
        dir = 1
      }
      if (pulses >= 3) {
        scale = 0
        clearInterval(interval)
      }
      setChestGlowScale(Math.max(0, Math.min(1, scale)))
    }, 16)
    return () => clearInterval(interval)
  }, [stage])

  // Typewriter
  useEffect(() => {
    if (stage !== 'text') return
    setTextVisible(true)
    const full = 'VISION'
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypewriterText(full.slice(0, i))
      if (i >= full.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [stage])

  useEffect(() => {
    if (stage === 'hud') setHudVisible(true)
  }, [stage])

  const stageIndex = [
    'black',
    'particles',
    'silhouette',
    'chest-glow',
    'v-draw',
    'text',
    'hud',
    'fadeout',
  ].indexOf(stage)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
      style={{ opacity: containerOpacity, transition: 'opacity 0.6s ease' }}
      onKeyDown={(e) => e.key === 'Escape' && complete()}
      tabIndex={0}
    >
      {/* Particles */}
      <Particles visible={stageIndex >= 1} />

      {/* Silhouette */}
      <Silhouette opacity={stageIndex >= 2 ? 1 : 0} />

      {/* Chest glow dot */}
      {stageIndex >= 3 && (
        <div
          className="pointer-events-none absolute"
          style={{
            width: 16 + chestGlowScale * 24,
            height: 16 + chestGlowScale * 24,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(180,160,255,0.4))',
            boxShadow: `0 0 ${20 + chestGlowScale * 30}px rgba(255,255,255,0.6)`,
            transform: 'translate(-50%, -50%)',
            top: '43%',
            left: '50%',
            opacity: stageIndex < 4 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        />
      )}

      {/* V Logo */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{ opacity: stageIndex >= 4 ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        <VLogo animate={stageIndex >= 4} size={160} />
      </div>

      {/* Text */}
      {textVisible && (
        <div
          className="pointer-events-none absolute flex flex-col items-center gap-2"
          style={{ top: '62%', opacity: stageIndex >= 5 ? 1 : 0, transition: 'opacity 0.4s' }}
        >
          <span
            className="font-bold tracking-[0.4em] text-white"
            style={{ fontSize: 32, fontFamily: 'var(--font-geist-sans), sans-serif' }}
          >
            {typewriterText}
          </span>
          {typewriterText === 'VISION' && (
            <span
              className="text-sm font-medium tracking-[0.3em] text-white/50"
              style={{ animation: 'fadeIn 0.4s ease forwards' }}
            >
              AGENCY OS
            </span>
          )}
        </div>
      )}

      {/* HUD corner brackets */}
      {hudVisible && (
        <>
          {[
            'top-4 left-4 border-t border-l',
            'top-4 right-4 border-t border-r',
            'bottom-16 left-4 border-b border-l',
            'bottom-16 right-4 border-b border-r',
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute h-8 w-8 ${cls} pointer-events-none border-white/30`}
              style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s forwards`, opacity: 0 }}
            />
          ))}

          {/* Scan line */}
          <div
            className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ animation: 'scan 1.2s ease-in-out forwards' }}
          />

          {/* Data numbers */}
          <div
            className="pointer-events-none absolute left-12 top-6 font-mono text-[9px] text-white/20"
            style={{ animation: 'fadeIn 0.4s ease forwards' }}
          >
            {['SYS.BOOT', 'AUTH.OK', 'INIT.V1'].map((t, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                {t}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={complete}
          className="absolute bottom-6 right-6 z-10 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          تخطي ←
        </button>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scan {
          0% { top: 0%; opacity: 0.6 }
          100% { top: 100%; opacity: 0 }
        }
      `}</style>
    </div>
  )
}
