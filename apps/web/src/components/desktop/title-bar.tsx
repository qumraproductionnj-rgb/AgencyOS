'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Minus, Square, X } from 'lucide-react'

type ElectronCSSProperties = CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' }

declare global {
  interface Window {
    electron?: {
      minimize: () => void
      maximize: () => void
      close: () => void
      notify: (title: string, body: string) => void
      platform: string
      isElectron: boolean
    }
  }
}

export function TitleBar() {
  const [isElectron, setIsElectron] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron?.isElectron) {
      setIsElectron(true)
      setIsMac(window.electron.platform === 'darwin')
    }
  }, [])

  if (!isElectron) return null

  const height = isMac ? '38px' : '32px'

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[999] flex items-center justify-between px-4"
      style={
        {
          height,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitAppRegion: 'drag',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        } as ElectronCSSProperties
      }
    >
      {/* Left: spacer for mac traffic lights */}
      <div style={{ width: isMac ? 72 : 0 }} />

      {/* Center: logo + title */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as ElectronCSSProperties}
      >
        <div
          className="flex h-5 w-5 items-center justify-center rounded-md text-xs font-black text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          V
        </div>
        <span className="text-xs font-semibold tracking-widest text-white/60">VISION OS</span>
      </div>

      {/* Right: Windows controls */}
      {!isMac ? (
        <div
          className="flex items-center"
          style={{ WebkitAppRegion: 'no-drag' } as ElectronCSSProperties}
        >
          <button
            onClick={() => window.electron?.minimize()}
            className="flex h-8 w-11 items-center justify-center text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            onClick={() => window.electron?.maximize()}
            className="flex h-8 w-11 items-center justify-center text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            onClick={() => window.electron?.close()}
            className="flex h-8 w-11 items-center justify-center text-white/40 transition-colors hover:bg-red-500 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div style={{ width: 72 }} />
      )}
    </div>
  )
}
