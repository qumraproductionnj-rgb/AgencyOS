'use client'

import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoiceCommand } from '@/hooks/use-voice-command'

interface VoiceButtonProps {
  onOpenModal?: (modal: string) => void
  onOpenAI?: () => void
  className?: string
}

export function VoiceButton({ onOpenModal, onOpenAI, className }: VoiceButtonProps) {
  const { state, transcript, start, stop } = useVoiceCommand({
    ...(onOpenModal ? { onOpenModal } : {}),
    ...(onOpenAI ? { onOpenAI } : {}),
  })

  if ((state as string) === 'unsupported') return null

  return (
    <div className="relative">
      <button
        onClick={state === 'listening' ? stop : start}
        title={state === 'unsupported' ? 'Voice commands not supported' : 'Voice command'}
        className={cn(
          'flex items-center justify-center rounded-lg p-2 transition-all',
          state === 'idle' && 'text-white/30 hover:bg-white/[0.06] hover:text-white/70',
          state === 'listening' && 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40',
          state === 'processing' && 'bg-purple-500/20 text-purple-400',
          className,
        )}
      >
        {state === 'processing' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === 'listening' ? (
          <div className="relative">
            <MicOff className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </div>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>

      {(state === 'listening' || (state === 'processing' && transcript)) && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#111] px-3 py-1.5 text-xs text-white/70 shadow-xl">
          {state === 'listening' ? 'جاري الاستماع...' : transcript}
          {/* Waveform */}
          <div className="mt-1 flex items-center justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-red-400"
                style={{
                  height: state === 'listening' ? `${4 + Math.sin(i) * 4 + 4}px` : '4px',
                  animation:
                    state === 'listening'
                      ? `wave 0.6s ease-in-out ${i * 0.1}s infinite alternate`
                      : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave {
          from { height: 4px }
          to { height: 14px }
        }
      `}</style>
    </div>
  )
}
