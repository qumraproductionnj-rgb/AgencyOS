'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useShortcutsHelpStore } from '@/stores/shortcuts-help-store'

const SECTIONS = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['⌘', 'K'], desc: 'Command Palette' },
      { keys: ['⌘', '/'], desc: 'AI Assistant' },
      { keys: ['⌘', 'B'], desc: 'Toggle Sidebar' },
      { keys: ['?'], desc: 'Show this help' },
      { keys: ['ESC'], desc: 'Close modals / drawers' },
    ],
  },
  {
    title: 'Navigation (G + key)',
    shortcuts: [
      { keys: ['G', 'D'], desc: 'Dashboard' },
      { keys: ['G', 'P'], desc: 'Projects' },
      { keys: ['G', 'T'], desc: 'Tasks' },
      { keys: ['G', 'I'], desc: 'Invoices' },
      { keys: ['G', 'C'], desc: 'Clients' },
      { keys: ['G', 'E'], desc: 'Employees' },
      { keys: ['G', 'S'], desc: 'Content Studio' },
      { keys: ['G', 'L'], desc: 'Leads' },
    ],
  },
  {
    title: 'In Tables',
    shortcuts: [
      { keys: ['↑', '↓'], desc: 'Navigate rows' },
      { keys: ['Enter'], desc: 'Open detail drawer' },
      { keys: ['E'], desc: 'Edit inline' },
      { keys: ['Del'], desc: 'Delete (with confirm)' },
    ],
  },
  {
    title: 'In Forms',
    shortcuts: [
      { keys: ['⌘', 'Enter'], desc: 'Submit form' },
      { keys: ['Tab'], desc: 'Next field' },
      { keys: ['Shift', 'Tab'], desc: 'Previous field' },
    ],
  },
]

export function ShortcutsHelp() {
  const { isOpen, close } = useShortcutsHelpStore()

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-800">Keyboard Shortcuts</h2>
          <button onClick={close} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="grid max-h-[70vh] grid-cols-2 gap-6 overflow-y-auto p-5">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{s.desc}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-700"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t px-5 py-3 text-center text-xs text-gray-400">
          Press{' '}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">?</kbd>{' '}
          anywhere to show this
        </div>
      </div>
    </>
  )
}
