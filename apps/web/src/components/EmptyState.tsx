'use client'

import React from 'react'

interface Action {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary'
}

interface Props {
  icon: string
  title: string
  description?: string
  actions?: Action[]
  helpHref?: string
  helpLabel?: string
}

export function EmptyState({ icon, title, description, actions = [], helpHref, helpLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-8 py-16 text-center">
      <span className="mb-4 text-5xl" aria-hidden>
        {icon}
      </span>
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {actions.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actions.map((action, i) => {
            const cls =
              action.variant === 'secondary'
                ? 'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
                : 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
            if (action.href) {
              return (
                <a key={i} href={action.href} className={cls}>
                  {action.label}
                </a>
              )
            }
            return (
              <button key={i} onClick={action.onClick} className={cls}>
                {action.label}
              </button>
            )
          })}
        </div>
      )}
      {helpHref && (
        <a
          href={helpHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 text-xs text-blue-500 hover:underline"
        >
          {helpLabel ?? 'Learn more →'}
        </a>
      )}
    </div>
  )
}
