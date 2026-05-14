'use client'

import { useLocale } from 'next-intl'

interface Props {
  typingUsers: string[]
}

export function TypingIndicator({ typingUsers }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  if (typingUsers.length === 0) return null

  const label = isAr
    ? `${typingUsers.join(' و')} ${typingUsers.length === 1 ? 'يكتب...' : 'يكتبون...'}`
    : `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is typing...' : 'are typing...'}`

  return (
    <div className="flex items-center gap-2 px-1 py-0.5">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/30"
            style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <span className="text-[11px] text-white/40">{label}</span>

      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
