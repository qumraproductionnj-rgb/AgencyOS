'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  useContentPiece,
  useUpdateContentPiece,
  useUpdateContentPieceStage,
  useContentRevisions,
  useCreateContentRevision,
  type ContentPieceDetail,
  type UpdateContentPieceDto,
} from '@/hooks/use-content-pieces'
import { useBrandBriefs } from '@/hooks/use-brand-briefs'

// ─── Stage colors ─────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  IDEA: 'bg-purple-100 text-purple-800',
  IN_WRITING: 'bg-blue-100 text-blue-800',
  IN_DESIGN: 'bg-indigo-100 text-indigo-800',
  IN_PRODUCTION: 'bg-orange-100 text-orange-800',
  INTERNAL_REVIEW: 'bg-yellow-100 text-yellow-800',
  CLIENT_REVIEW: 'bg-pink-100 text-pink-800',
  REVISION: 'bg-red-100 text-red-800',
  APPROVED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-teal-100 text-teal-800',
  PUBLISHED: 'bg-gray-100 text-gray-800',
  FAILED: 'bg-red-100 text-red-800',
}

const PIECE_TYPE_TABS: Record<string, string[]> = {
  VIDEO_LONG: ['overview', 'idea', 'hook', 'script', 'caption'],
  REEL: ['overview', 'idea', 'hook', 'script', 'caption'],
  STORY: ['overview', 'idea', 'frames', 'caption'],
  STATIC_DESIGN: ['overview', 'texts', 'visual', 'caption'],
  CAROUSEL: ['overview', 'slides', 'caption'],
  GIF: ['overview', 'idea', 'caption'],
  PODCAST: ['overview', 'idea', 'script', 'caption'],
  BLOG_POST: ['overview', 'content', 'caption'],
}

// ─── Main Editor Component ────────────────────────────

interface Props {
  pieceId: string
}

export function ContentPieceEditor({ pieceId }: Props) {
  const t = useTranslations('contentPieces')
  const tCommon = useTranslations('common')

  const { data: piece, isLoading } = useContentPiece(pieceId)
  const { data: briefs } = useBrandBriefs(piece ? { clientId: piece.clientId } : undefined)
  const updatePiece = useUpdateContentPiece()
  const updateStage = useUpdateContentPieceStage()
  const { data: revisions } = useContentRevisions(pieceId)
  const createRevision = useCreateContentRevision()

  const [draft, setDraft] = useState<UpdateContentPieceDto>({})
  const [activeTab, setActiveTab] = useState('overview')
  const [showRevisions, setShowRevisions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [stageBusy, setStageBusy] = useState(false)
  const [revisionText, setRevisionText] = useState('')
  const [revisionRound, setRevisionRound] = useState(1)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasChanges = Object.keys(draft).length > 0

  const brief = briefs?.[0]
  const tabs = PIECE_TYPE_TABS[piece?.type as keyof typeof PIECE_TYPE_TABS] ?? [
    'overview',
    'caption',
  ]

  // Autosave every 2s
  useEffect(() => {
    saveTimerRef.current = setInterval(async () => {
      if (!hasChanges || !pieceId || saving) return
      setSaving(true)
      try {
        await updatePiece.mutateAsync({ id: pieceId, ...draft })
        setDraft({})
        setLastSaved(new Date())
      } catch {
        // silent
      } finally {
        setSaving(false)
      }
    }, 2000)

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    }
  }, [hasChanges, pieceId, draft, saving, updatePiece])

  // Set revision round from existing revisions
  useEffect(() => {
    if (revisions && revisions.length > 0) {
      setRevisionRound(Math.max(...revisions.map((r) => r.roundNumber)) + 1)
    }
  }, [revisions])

  const patch = useCallback((key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleStageTransition = async (target: string) => {
    if (!pieceId) return
    setStageBusy(true)
    try {
      await updateStage.mutateAsync({ id: pieceId, stage: target })
    } finally {
      setStageBusy(false)
    }
  }

  const handleSubmitRevision = async () => {
    if (!pieceId || !revisionText.trim()) return
    await createRevision.mutateAsync({
      pieceId,
      roundNumber: revisionRound,
      feedbackText: revisionText.trim(),
    })
    setRevisionText('')
    setRevisionRound((r) => r + 1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        {tCommon('loading')}
      </div>
    )
  }

  if (!piece) {
    return (
      <div className="flex items-center justify-center py-24 text-red-500">{t('notFound')}</div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar: Context */}
      <aside className="hidden w-72 flex-shrink-0 overflow-y-auto border-l bg-gray-50 p-4 lg:block rtl:lg:border-l-0 rtl:lg:border-r">
        <ContextSidebar piece={piece} brief={brief ?? null} t={t} />
      </aside>

      {/* Main content: tabs */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar: title + stage */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-lg font-semibold">{piece.title}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[piece.stage] ?? 'bg-gray-100'}`}
            >
              {t(`stage_${piece.stage}`)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {saving && <span>{tCommon('loading')}</span>}
            {!saving && lastSaved && (
              <span>
                {t('saved')} {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b bg-white px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`tab_${tab}`)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <TabOverview piece={piece} patch={patch} t={t} />}
          {activeTab === 'idea' && <TabIdea piece={piece} patch={patch} t={t} />}
          {activeTab === 'hook' && <TabHook piece={piece} patch={patch} t={t} />}
          {activeTab === 'script' && <TabScript piece={piece} patch={patch} t={t} />}
          {activeTab === 'caption' && <TabCaption piece={piece} patch={patch} t={t} />}
          {activeTab === 'texts' && <TabTexts piece={piece} patch={patch} t={t} />}
          {activeTab === 'visual' && <TabVisual piece={piece} patch={patch} t={t} />}
          {activeTab === 'frames' && <TabFrames piece={piece} patch={patch} t={t} />}
          {activeTab === 'slides' && <TabSlides piece={piece} patch={patch} t={t} />}
          {activeTab === 'content' && <TabContent piece={piece} patch={patch} t={t} />}
        </div>
      </main>

      {/* Right sidebar: Stage + Revisions */}
      <aside
        className={`flex-shrink-0 border-r bg-white transition-all ${showRevisions ? 'w-80' : 'w-64'} rtl:lg:border-l rtl:lg:border-r-0`}
      >
        <div className="flex h-full flex-col">
          {/* Stage controls */}
          <div className="border-b p-4">
            <StageControls
              piece={piece}
              onTransition={handleStageTransition}
              busy={stageBusy}
              t={t}
            />
          </div>

          {/* Revision toggle */}
          <div className="border-b">
            <button
              onClick={() => setShowRevisions(!showRevisions)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>
                {t('revisions')} ({revisions?.length ?? 0})
              </span>
              <span className="text-xs text-gray-400">{showRevisions ? '▼' : '▶'}</span>
            </button>
          </div>

          {/* Revisions list */}
          {showRevisions && (
            <div className="flex-1 overflow-y-auto p-4">
              <RevisionList
                revisions={revisions ?? []}
                revisionText={revisionText}
                onRevisionText={setRevisionText}
                onSubmit={handleSubmitRevision}
                busy={createRevision.isPending}
                t={t}
                tCommon={tCommon}
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

// ─── Context Sidebar ──────────────────────────────────

function ContextSidebar({
  piece,
  brief,
  t,
}: {
  piece: ContentPieceDetail
  brief: { id: string; brandName: string; brandNameEn?: string | null; clientId: string } | null
  t: (key: string) => string
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {t('pieceInfo')}
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">{t('type')}: </span>
            <span className="font-medium">{t(`type_${piece.type}`)}</span>
          </div>
          <div>
            <span className="text-gray-400">{t('platforms')}: </span>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {piece.platforms.map((p) => (
                <span key={p} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-400">{t('plan')}: </span>
            <span>{piece.plan.title ?? `${piece.plan.month}/${piece.plan.year}`}</span>
          </div>
          {piece.pillar && (
            <div>
              <span className="text-gray-400">{t('pillar')}: </span>
              <span style={{ color: piece.pillar.color ?? undefined }}>
                {piece.pillar.nameAr ?? piece.pillar.nameEn}
              </span>
            </div>
          )}
          {piece.project && (
            <div>
              <span className="text-gray-400">{t('project')}: </span>
              <span>{piece.project.name}</span>
            </div>
          )}
        </div>
      </div>

      {brief && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('brandBrief')}
          </h3>
          <p className="text-sm font-medium">{brief.brandName}</p>
        </div>
      )}
    </div>
  )
}

// ─── Stage Controls ───────────────────────────────────

function StageControls({
  piece,
  onTransition,
  busy,
  t,
}: {
  piece: ContentPieceDetail
  onTransition: (stage: string) => void
  busy: boolean
  t: (key: string) => string
}) {
  const nextStages: Record<string, string[]> = {
    IDEA: ['IN_WRITING', 'IN_DESIGN', 'IN_PRODUCTION'],
    IN_WRITING: ['IN_DESIGN', 'INTERNAL_REVIEW'],
    IN_DESIGN: ['IN_PRODUCTION', 'INTERNAL_REVIEW'],
    IN_PRODUCTION: ['INTERNAL_REVIEW'],
    INTERNAL_REVIEW: ['CLIENT_REVIEW', 'REVISION', 'APPROVED'],
    CLIENT_REVIEW: ['APPROVED', 'REVISION'],
    REVISION: ['IN_WRITING', 'IN_DESIGN', 'IN_PRODUCTION'],
    APPROVED: ['SCHEDULED'],
    SCHEDULED: ['PUBLISHED', 'FAILED'],
    PUBLISHED: [],
    FAILED: [],
  }

  const allowed = nextStages[piece.stage] ?? []

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {t('stage')}
      </h3>
      <div className="space-y-1.5">
        {allowed.map((stage) => (
          <button
            key={stage}
            onClick={() => onTransition(stage)}
            disabled={busy}
            className="w-full rounded-md border px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {t(`stage_${stage}`)}
          </button>
        ))}
        {allowed.length === 0 && <p className="text-xs text-gray-400">{t('terminalStage')}</p>}
      </div>
    </div>
  )
}

// ─── Revision List ────────────────────────────────────

function RevisionList({
  revisions,
  revisionText,
  onRevisionText,
  onSubmit,
  busy,
  t,
  tCommon,
}: {
  tCommon: (key: string) => string
  revisions: {
    id: string
    roundNumber: number
    feedbackText: string | null
    status: string
    createdAt: string
    requester: { email: string; employee: { fullNameAr: string; fullNameEn: string | null } | null }
  }[]
  revisionText: string
  onRevisionText: (v: string) => void
  onSubmit: () => void
  busy: boolean
  t: (key: string) => string
}) {
  return (
    <div className="space-y-4">
      {revisions.map((rev) => (
        <div key={rev.id} className="rounded-md border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {t('revision')} #{rev.roundNumber}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${rev.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : rev.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
            >
              {t(`revStatus_${rev.status}`)}
            </span>
          </div>
          {rev.feedbackText && <p className="mt-1 text-sm text-gray-700">{rev.feedbackText}</p>}
          <div className="mt-1 text-xs text-gray-400">
            {rev.requester?.employee?.fullNameAr ?? rev.requester?.email}
          </div>
        </div>
      ))}

      {/* New revision form */}
      <div className="space-y-2">
        <textarea
          value={revisionText}
          onChange={(e) => onRevisionText(e.target.value)}
          placeholder={t('revisionPlaceholder')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
        <button
          onClick={onSubmit}
          disabled={busy || !revisionText.trim()}
          className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? tCommon('loading') : t('requestRevision')}
        </button>
      </div>
    </div>
  )
}

// ─── Field helper ─────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

// ─── Tab: Overview ────────────────────────────────────

function TabOverview({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('overview')}</h2>
      <Field label={t('title')}>
        <input
          defaultValue={piece.title}
          onChange={(e) => patch('title', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
      <Field label={t('bigIdea')}>
        <textarea
          defaultValue={piece.bigIdea ?? ''}
          onChange={(e) => patch('bigIdea', e.target.value || null)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
      <Field label={t('platforms')}>
        <input
          defaultValue={piece.platforms.join(', ')}
          onChange={(e) =>
            patch(
              'platforms',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder={t('platformsPlaceholder')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
      <Field label={t('frameworkUsed')}>
        <input
          defaultValue={piece.frameworkUsed ?? ''}
          onChange={(e) => patch('frameworkUsed', e.target.value || null)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Idea ────────────────────────────────────────

function TabIdea({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('idea')}</h2>
      <Field label={t('bigIdea')}>
        <textarea
          defaultValue={piece.bigIdea ?? ''}
          onChange={(e) => patch('bigIdea', e.target.value || null)}
          rows={5}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
      <Field label={t('inspirationRefs')}>
        <textarea
          defaultValue={piece.inspirationRefs ? JSON.stringify(piece.inspirationRefs, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('inspirationRefs', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid JSON */
            }
          }}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Hook ────────────────────────────────────────

function TabHook({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('hook')}</h2>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={8}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Script ──────────────────────────────────────

function TabScript({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('script')}</h2>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={12}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Caption ─────────────────────────────────────

function TabCaption({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('caption')}</h2>
      <Field label={t('captionAr')}>
        <textarea
          defaultValue={piece.captionAr ?? ''}
          onChange={(e) => patch('captionAr', e.target.value || null)}
          rows={5}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
      <Field label={t('captionEn')}>
        <textarea
          defaultValue={piece.captionEn ?? ''}
          onChange={(e) => patch('captionEn', e.target.value || null)}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
      <Field label={t('hashtags')}>
        <input
          defaultValue={piece.hashtags.join(', ')}
          onChange={(e) =>
            patch(
              'hashtags',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder={t('hashtagsPlaceholder')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('ctaText')}>
          <input
            defaultValue={piece.ctaText ?? ''}
            onChange={(e) => patch('ctaText', e.target.value || null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
        </Field>
        <Field label={t('ctaLink')}>
          <input
            defaultValue={piece.ctaLink ?? ''}
            onChange={(e) => patch('ctaLink', e.target.value || null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>
    </div>
  )
}

// ─── Tab: Texts ───────────────────────────────────────

function TabTexts({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('texts')}</h2>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Visual ──────────────────────────────────────

function TabVisual({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('visual')}</h2>
      <p className="text-sm text-gray-500">{t('visualDesc')}</p>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Frames ──────────────────────────────────────

function TabFrames({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('frames')}</h2>
      <p className="text-sm text-gray-500">{t('framesDesc')}</p>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Slides ──────────────────────────────────────

function TabSlides({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('slides')}</h2>
      <p className="text-sm text-gray-500">{t('slidesDesc')}</p>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Content ─────────────────────────────────────

function TabContent({
  piece,
  patch,
  t,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">{t('content')}</h2>
      <Field label={t('components')}>
        <textarea
          defaultValue={piece.components ? JSON.stringify(piece.components, null, 2) : ''}
          onChange={(e) => {
            try {
              patch('components', JSON.parse(e.target.value || 'null'))
            } catch {
              /* invalid */
            }
          }}
          rows={15}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-xs"
          dir="auto"
        />
      </Field>
    </div>
  )
}
