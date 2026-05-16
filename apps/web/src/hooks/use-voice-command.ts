'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

type VoiceState = 'idle' | 'listening' | 'processing' | 'unsupported'

interface UseVoiceCommandOptions {
  onOpenModal?: (modal: string) => void
  onOpenAI?: () => void
}

interface VoiceRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onresult: ((event: VoiceRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

interface VoiceRecognitionResult {
  readonly isFinal: boolean
  0: { transcript: string }
}

interface VoiceRecognitionResultList {
  length: number
  item: (index: number) => VoiceRecognitionResult
  [index: number]: VoiceRecognitionResult
}

interface VoiceRecognitionEvent extends Event {
  resultIndex: number
  results: VoiceRecognitionResultList
}

export function useVoiceCommand({ onOpenModal, onOpenAI }: UseVoiceCommandOptions = {}) {
  const router = useRouter()
  const locale = useLocale()
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<VoiceRecognition | null>(null)

  const handleCommand = useCallback(
    (text: string) => {
      const t = text.toLowerCase()
      if (t.includes('مشاريع') || t.includes('المشاريع')) router.push(`/${locale}/projects`)
      else if (t.includes('فواتير') || t.includes('الفواتير')) router.push(`/${locale}/invoices`)
      else if (t.includes('لوحة التحكم') || t.includes('الرئيسية'))
        router.push(`/${locale}/dashboard`)
      else if (t.includes('موظفين') || t.includes('الموظفين')) router.push(`/${locale}/employees`)
      else if (t.includes('تسجيل الحضور') || t.includes('الحضور'))
        router.push(`/${locale}/attendance`)
      else if (t.includes('مشروع جديد')) onOpenModal?.('new-project')
      else if (t.includes('فاتورة جديدة')) onOpenModal?.('new-invoice')
      else if (t.includes('الذكاء الاصطناعي') || t.includes('اسأل')) onOpenAI?.()
      setTimeout(() => setState('idle'), 600)
    },
    [router, locale, onOpenModal, onOpenAI],
  )

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const SpeechRecognitionCtor: (new () => VoiceRecognition) | undefined =
      win.SpeechRecognition ?? win.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      setState('unsupported')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'ar-IQ'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => setState('listening')

    recognition.onresult = (event: VoiceRecognitionEvent) => {
      setState('processing')
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results.item(i)
        const text = result[0].transcript
        if (result.isFinal) final += text
        else interim += text
      }
      setTranscript(final || interim)
      if (final) handleCommand(final.trim())
    }

    recognition.onerror = () => setState('idle')
    recognition.onend = () => setState((s) => (s === 'processing' ? s : 'idle'))

    recognitionRef.current = recognition
  }, [handleCommand])

  const start = useCallback(() => {
    if (state !== 'idle' || !recognitionRef.current) return
    setTranscript('')
    try {
      recognitionRef.current.lang = locale === 'ar' ? 'ar-IQ' : 'en-US'
      recognitionRef.current.start()
    } catch {
      setState('idle')
    }
  }, [state, locale])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setState('idle')
  }, [])

  return { state, transcript, start, stop }
}
