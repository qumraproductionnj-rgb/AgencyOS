'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const t = useTranslations('login')
  const { login, isLoading } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch {
      setError(t('error'))
    }
  }

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              )}
              placeholder="admin@agencyos.app"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'bg-primary inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2',
              'text-primary-foreground ring-offset-background text-sm font-medium transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {isLoading ? t('loggingIn') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
