import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <EmptyIllustration />
      <h3 className="mt-6 text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 rounded-lg bg-white/[0.08] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.12]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function EmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="56" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <rect x="42" y="46" width="36" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="46" y="56" width="28" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="50" y="66" width="20" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
      <circle cx="60" cy="60" r="2" fill="rgba(56,189,248,0.6)" />
    </svg>
  )
}
