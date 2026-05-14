'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Sparkles, X, Send, Mic, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'لوحة التحكم',
  '/employees': 'الموظفين',
  '/attendance': 'الحضور',
  '/payroll': 'الرواتب',
  '/leads': 'العملاء المحتملين',
  '/clients': 'العملاء',
  '/projects': 'المشاريع',
  '/tasks': 'المهام',
  '/quotations': 'عروض الأسعار',
  '/invoices': 'الفواتير',
  '/expenses': 'المدفوعات',
  '/content-studio': 'Content Studio',
  '/portal': 'بوابة العملاء',
  '/reports': 'التقارير',
  '/settings': 'الإعدادات',
  '/billing': 'الاشتراك',
}

const SUGGESTIONS = [
  'كم إيرادات الشهر الحالي؟',
  'ما المشاريع المتأخرة؟',
  'من أكثر عميل ربحية؟',
  'ولّد فاتورة لمطعم بغداد',
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-purple-400/60"
          style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

export function AIAssistant() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentPage = Object.entries(PAGE_NAMES).find(([key]) => pathname.includes(key))?.[1] ?? ''

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: { currentPage },
      }),
    // transport is intentionally stable — recreating on every render would reset chat
    [],
  )

  const { messages, sendMessage, status, setMessages } = useChat({ transport })
  const isLoading = status === 'streaming' || status === 'submitted'

  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 150)
  }, [open])

  const submit = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const positionClass = isAr ? 'left-4' : 'right-4'

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggle}
        aria-label="AI Assistant"
        className={cn(
          'fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full',
          'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-900/40',
          'transition-all duration-200 hover:scale-105 hover:shadow-purple-500/50',
          positionClass,
          open && 'pointer-events-none scale-95 opacity-0',
        )}
        style={{ animation: open ? undefined : 'aiPulse 2.5s ease-in-out infinite' }}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 z-50 flex flex-col overflow-hidden',
          'w-[min(380px,calc(100vw-2rem))]',
          'rounded-2xl border border-white/[0.1] bg-[#0d0d0d]/95 shadow-2xl shadow-black/60 backdrop-blur-xl',
          positionClass,
          'transition-all duration-300 ease-out',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        style={{ height: '70vh', maxHeight: '600px', minHeight: '400px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">Vision AI</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                style={{ animation: 'aiPulse 2s ease-in-out infinite' }}
              />
              {isAr ? 'متصل' : 'Online'}
            </span>
          </div>
          <button
            onClick={() => setMessages([])}
            className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:bg-white/[0.06] hover:text-white"
            title={isAr ? 'محادثة جديدة' : 'New chat'}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4" dir={isAr ? 'rtl' : 'ltr'}>
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-sm font-medium">
                  {isAr ? 'مرحباً! كيف أساعدك؟' : 'Hello! How can I help?'}
                </p>
                {currentPage && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {isAr ? `أنت في صفحة ${currentPage}` : `You're on the ${currentPage} page`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s)
                      setTimeout(() => {
                        sendMessage({ text: s })
                        setInput('')
                      }, 50)
                    }}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-start text-xs text-white/70 transition-colors hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const role = m.role
            const content = m.parts
              .filter((p) => p.type === 'text')
              .map((p) => (p.type === 'text' ? p.text : ''))
              .join('')
            return (
              <div
                key={m.id}
                className={cn('flex', role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {role === 'assistant' && (
                  <div className="me-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30">
                    <Sparkles className="h-3 w-3 text-purple-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    role === 'user'
                      ? 'rounded-ee-sm bg-white/[0.1] text-white'
                      : 'rounded-es-sm bg-purple-500/[0.12] text-white/90',
                  )}
                >
                  {content}
                </div>
              </div>
            )
          })}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="me-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30">
                <Sparkles className="h-3 w-3 text-purple-400" />
              </div>
              <div className="rounded-2xl rounded-es-sm bg-purple-500/[0.12] px-3.5 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.08] p-3">
          <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isAr ? 'اسأل أي شيء...' : 'Ask anything...'}
              rows={1}
              dir={isAr ? 'rtl' : 'ltr'}
              className="flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              style={{ maxHeight: '120px' }}
            />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-1.5 text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/50"
                title={isAr ? 'تسجيل صوتي (قريباً)' : 'Voice (coming soon)'}
                disabled
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!input.trim() || isLoading}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 transition-all hover:opacity-90 disabled:opacity-30"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-white" />
                )}
              </button>
            </div>
          </div>
          <p className="text-muted-foreground mt-1.5 text-center text-[10px]">
            {isAr ? 'Enter للإرسال · Shift+Enter سطر جديد' : 'Enter to send · Shift+Enter new line'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
