'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import { api } from '@/lib/api'

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
  VIDEO_LONG: ['overview', 'idea', 'hook', 'script', 'storyboard', 'music', 'caption'],
  REEL: ['overview', 'idea', 'hook', 'script', 'storyboard', 'music', 'caption'],
  STORY: ['overview', 'idea', 'frames', 'caption'],
  STATIC_DESIGN: ['overview', 'texts', 'visual', 'caption'],
  CAROUSEL: ['overview', 'slides', 'caption'],
  GIF: ['overview', 'idea', 'caption'],
  PODCAST: ['overview', 'idea', 'script', 'caption'],
  BLOG_POST: ['overview', 'content', 'caption'],
}

const HOOK_PATTERNS = [
  'patternInterrupt',
  'boldClaim',
  'curiosityGap',
  'visualSurprise',
  'directQuestion',
  'numberTease',
] as const

const SHOT_TYPES = [
  'wide',
  'medium',
  'closeUp',
  'extremeCloseUp',
  'overTheShoulder',
  'pointOfView',
  'aerial',
  'tracking',
  'handheld',
  'drone',
  'timeLapse',
  'slowMotion',
] as const

const LAYOUT_TYPES = ['fPattern', 'zPattern', 'centered', 'split', 'fullBleed', 'grid'] as const

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

  const mergedComponents = useMemo(() => {
    if (!piece) return {}
    return {
      ...((piece.components as Record<string, unknown>) ?? {}),
      ...((draft.components as Record<string, unknown>) ?? {}),
    }
  }, [piece, draft])

  const setComponent = useCallback(
    (key: string, value: unknown) => {
      patch('components', { ...mergedComponents, [key]: value })
    },
    [mergedComponents, patch],
  )

  const aiGenerate = useCallback(
    async (toolType: string, prompt: string, systemPrompt?: string) => {
      const res = await api.post<{ content: string }>('/v1/ai/generate', {
        toolType,
        prompt,
        systemPrompt,
        contentPieceId: pieceId,
      })
      return res.content
    },
    [pieceId],
  )

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
          {activeTab === 'idea' && (
            <TabIdea piece={piece} patch={patch} t={t} aiGenerate={aiGenerate} />
          )}
          {activeTab === 'hook' && (
            <TabHook
              piece={piece}
              _patch={patch}
              t={t}
              _tCommon={tCommon}
              components={mergedComponents}
              setComponent={setComponent}
              aiGenerate={aiGenerate}
            />
          )}
          {activeTab === 'script' && (
            <TabScript
              piece={piece}
              _patch={patch}
              t={t}
              tCommon={tCommon}
              components={mergedComponents}
              setComponent={setComponent}
              aiGenerate={aiGenerate}
            />
          )}
          {activeTab === 'storyboard' && (
            <TabStoryboard
              piece={piece}
              _patch={patch}
              t={t}
              tCommon={tCommon}
              components={mergedComponents}
              setComponent={setComponent}
              aiGenerate={aiGenerate}
            />
          )}
          {activeTab === 'music' && (
            <TabMusic
              piece={piece}
              _patch={patch}
              t={t}
              tCommon={tCommon}
              components={mergedComponents}
              setComponent={setComponent}
              aiGenerate={aiGenerate}
            />
          )}
          {activeTab === 'caption' && <TabCaption piece={piece} patch={patch} t={t} />}
          {activeTab === 'texts' && (
            <TabTexts
              piece={piece}
              _patch={patch}
              t={t}
              _tCommon={tCommon}
              components={mergedComponents}
              setComponent={setComponent}
              aiGenerate={aiGenerate}
            />
          )}
          {activeTab === 'visual' && (
            <TabVisual
              piece={piece}
              _patch={patch}
              t={t}
              _tCommon={tCommon}
              components={mergedComponents}
              setComponent={setComponent}
              aiGenerate={aiGenerate}
            />
          )}
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
  aiGenerate,
}: {
  piece: ContentPieceDetail
  patch: (k: string, v: unknown) => void
  t: (key: string) => string
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const [aiBusy, setAiBusy] = useState(false)

  const handleAiExpand = async () => {
    if (!aiGenerate) return
    setAiBusy(true)
    try {
      const content = await aiGenerate(
        'idea_expander',
        `Expand on this content idea:\n${piece.bigIdea ?? 'No big idea yet'}\n\nType: ${piece.type}\nPlatforms: ${piece.platforms.join(', ')}`,
        'You are a creative content strategist. Expand the given idea with angles, hooks, and audience insights.',
      )
      patch('bigIdea', content)
    } finally {
      setAiBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('idea')}</h2>
        {aiGenerate && (
          <button
            onClick={handleAiExpand}
            disabled={aiBusy}
            className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {aiBusy ? t('aiGenerating') : t('aiExpand')}
          </button>
        )}
      </div>
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Tab: Hook ────────────────────────────────────────

function TabHook({
  piece,
  _patch,
  t,
  _tCommon,
  components,
  setComponent,
  aiGenerate,
}: {
  piece: ContentPieceDetail
  _patch: (k: string, v: unknown) => void
  t: (key: string) => string
  _tCommon: (key: string) => string
  components: Record<string, unknown>
  setComponent: (key: string, value: unknown) => void
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const hook = (components['hook'] as Record<string, string> | undefined) ?? {}
  const [aiBusy, setAiBusy] = useState<'hook' | 'full' | null>(null)

  const patchHook = (field: string, value: string) => {
    setComponent('hook', { ...hook, [field]: value })
  }

  const handleAiHook = async () => {
    if (!aiGenerate) return
    setAiBusy('hook')
    try {
      const content = await aiGenerate(
        'hook_generator',
        `Generate a hook for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nType: ${piece.type}\nPlatforms: ${piece.platforms.join(', ')}`,
        'You are a hook specialist. Generate a powerful opening hook (2-5 seconds) for short-form video. Return ONLY the hook text, no explanations.',
      )
      patchHook('hookText', content)
    } finally {
      setAiBusy(null)
    }
  }

  const handleAiFull = async () => {
    if (!aiGenerate) return
    setAiBusy('full')
    try {
      const content = await aiGenerate(
        'hook_hold_payoff',
        `Create a Hook-Hold-Payoff structure for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nType: ${piece.type}\nPlatforms: ${piece.platforms.join(', ')}`,
        'You are a video structure specialist. Create a complete Hook-Hold-Payoff structure. Return as JSON with keys: hookText, hookType, holdText, payoffText.',
      )
      try {
        const parsed = JSON.parse(content)
        setComponent('hook', { ...hook, ...parsed })
      } catch {
        patchHook('hookText', content)
      }
    } finally {
      setAiBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('hook')}</h2>
        <div className="flex gap-2">
          {aiGenerate && (
            <>
              <button
                onClick={handleAiHook}
                disabled={aiBusy !== null}
                className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                {aiBusy === 'hook' ? t('aiGenerating') : t('aiHook')}
              </button>
              <button
                onClick={handleAiFull}
                disabled={aiBusy !== null}
                className="rounded-md border px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 disabled:opacity-50"
              >
                {aiBusy === 'full' ? t('aiGenerating') : t('aiHookHoldPayoff')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-blue-800">
          {t('hookSection')} <span className="text-xs font-normal">(0-3s)</span>
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-blue-700">
              {t('hookPattern')}
            </label>
            <select
              value={hook['hookType'] ?? ''}
              onChange={(e) => patchHook('hookType', e.target.value)}
              className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">{t('selectPattern')}</option>
              {HOOK_PATTERNS.map((p) => (
                <option key={p} value={p}>
                  {t(`hookPattern_${p}`)}
                </option>
              ))}
            </select>
          </div>
          <Field label={t('hookText')}>
            <textarea
              value={hook['hookText'] ?? ''}
              onChange={(e) => patchHook('hookText', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
              dir="auto"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-indigo-800">
          {t('holdSection')} <span className="text-xs font-normal">(3-20s)</span>
        </h3>
        <Field label={t('holdText')}>
          <textarea
            value={hook['holdText'] ?? ''}
            onChange={(e) => patchHook('holdText', e.target.value)}
            rows={5}
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm"
            dir="auto"
          />
        </Field>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-green-800">
          {t('payoffSection')} <span className="text-xs font-normal">(20-30s)</span>
        </h3>
        <Field label={t('payoffText')}>
          <textarea
            value={hook['payoffText'] ?? ''}
            onChange={(e) => patchHook('payoffText', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm"
            dir="auto"
          />
        </Field>
      </div>
    </div>
  )
}

// ─── Tab: Script ───────────────────────────────────────

function TabScript({
  piece,
  _patch,
  t,
  tCommon,
  components,
  setComponent,
  aiGenerate,
}: {
  piece: ContentPieceDetail
  _patch: (k: string, v: unknown) => void
  t: (key: string) => string
  tCommon: (key: string) => string
  components: Record<string, unknown>
  setComponent: (key: string, value: unknown) => void
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const script = (components['script'] as { actTitle: string; content: string }[] | undefined) ?? []
  const [aiBusy, setAiBusy] = useState(false)

  const updateAct = (index: number, field: 'actTitle' | 'content', value: string) => {
    const updated = [...script]
    updated[index] = { ...updated[index]!, [field]: value }
    setComponent('script', updated)
  }

  const addAct = () => {
    setComponent('script', [...script, { actTitle: '', content: '' }])
  }

  const removeAct = (index: number) => {
    setComponent(
      'script',
      script.filter((_, i) => i !== index),
    )
  }

  const handleAiScript = async () => {
    if (!aiGenerate) return
    setAiBusy(true)
    try {
      const context = script.map((a) => `[${a.actTitle || 'Untitled'}]\n${a.content}`).join('\n\n')
      const content = await aiGenerate(
        'script_writer',
        `Write a script for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nType: ${piece.type}\nPlatforms: ${piece.platforms.join(', ')}\n\nCurrent draft:\n${context || 'No existing script'}`,
        'You are a scriptwriter. Write a structured script with acts/sections. Return as JSON array: [{ "actTitle": "...", "content": "..." }]',
      )
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          setComponent('script', parsed)
        }
      } catch {
        setComponent('script', [...script, { actTitle: 'AI Generated', content }])
      }
    } finally {
      setAiBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('script')}</h2>
        <div className="flex gap-2">
          {aiGenerate && (
            <button
              onClick={handleAiScript}
              disabled={aiBusy}
              className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {aiBusy ? t('aiGenerating') : t('aiWriteScript')}
            </button>
          )}
          <button
            onClick={addAct}
            className="rounded-md border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t('addAct')}
          </button>
        </div>
      </div>

      {script.length === 0 && <p className="text-sm italic text-gray-400">{t('noScriptActs')}</p>}

      {script.map((act, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <input
              value={act.actTitle}
              onChange={(e) => updateAct(i, 'actTitle', e.target.value)}
              placeholder={t('actTitlePlaceholder')}
              className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm font-medium"
              dir="auto"
            />
            <button
              onClick={() => removeAct(i)}
              className="mr-2 text-xs text-red-500 hover:text-red-700"
            >
              {tCommon('remove')}
            </button>
          </div>
          <textarea
            value={act.content}
            onChange={(e) => updateAct(i, 'content', e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            dir="auto"
          />
        </div>
      ))}
    </div>
  )
}

// ─── Tab: Storyboard ───────────────────────────────────

function TabStoryboard({
  piece,
  _patch,
  t,
  tCommon,
  components,
  setComponent,
  aiGenerate,
}: {
  piece: ContentPieceDetail
  _patch: (k: string, v: unknown) => void
  t: (key: string) => string
  tCommon: (key: string) => string
  components: Record<string, unknown>
  setComponent: (key: string, value: unknown) => void
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const storyboard =
    (components['storyboard'] as
      | {
          shotNumber: number
          shotType: string
          duration: number
          description: string
          notes: string
        }[]
      | undefined) ?? []
  const [aiBusy, setAiBusy] = useState(false)

  const updateShot = (index: number, field: string, value: unknown) => {
    const updated = [...storyboard]
    updated[index] = { ...updated[index]!, [field]: value }
    setComponent('storyboard', updated)
  }

  const addShot = () => {
    const nextNum = storyboard.length > 0 ? Math.max(...storyboard.map((s) => s.shotNumber)) + 1 : 1
    setComponent('storyboard', [
      ...storyboard,
      { shotNumber: nextNum, shotType: 'medium', duration: 3, description: '', notes: '' },
    ])
  }

  const removeShot = (index: number) => {
    setComponent(
      'storyboard',
      storyboard.filter((_, i) => i !== index),
    )
  }

  const handleAiStoryboard = async () => {
    if (!aiGenerate) return
    setAiBusy(true)
    try {
      const content = await aiGenerate(
        'storyboard_generator',
        `Create a storyboard for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nScript: ${JSON.stringify(components['script'] ?? '')}\nType: ${piece.type}\nPlatforms: ${piece.platforms.join(', ')}`,
        'You are a video director. Create a shot-by-shot storyboard. Return as JSON array: [{ "shotNumber": 1, "shotType": "medium", "duration": 5, "description": "...", "notes": "..." }]',
      )
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          setComponent('storyboard', parsed)
        }
      } catch {
        // fallback
      }
    } finally {
      setAiBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('storyboard')}</h2>
        <div className="flex gap-2">
          {aiGenerate && (
            <button
              onClick={handleAiStoryboard}
              disabled={aiBusy}
              className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {aiBusy ? t('aiGenerating') : t('aiStoryboard')}
            </button>
          )}
          <button
            onClick={addShot}
            className="rounded-md border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t('addShot')}
          </button>
        </div>
      </div>

      {storyboard.length === 0 && <p className="text-sm italic text-gray-400">{t('noShots')}</p>}

      <div className="space-y-3">
        {storyboard.map((shot, i) => (
          <div key={shot.shotNumber} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {t('shot')} #{shot.shotNumber}
              </span>
              <button
                onClick={() => removeShot(i)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                {tCommon('remove')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {t('shotType')}
                </label>
                <select
                  value={shot.shotType}
                  onChange={(e) => updateShot(i, 'shotType', e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                >
                  {SHOT_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {t(`shotType_${st}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {t('duration')} (s)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={shot.duration}
                  onChange={(e) => updateShot(i, 'duration', parseInt(e.target.value, 10) || 3)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">{t('notes')}</label>
                <input
                  value={shot.notes}
                  onChange={(e) => updateShot(i, 'notes', e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  dir="auto"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {t('description')}
              </label>
              <textarea
                value={shot.description}
                onChange={(e) => updateShot(i, 'description', e.target.value)}
                rows={2}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                dir="auto"
              />
            </div>
          </div>
        ))}
      </div>

      {storyboard.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          {t('totalDuration')}: {storyboard.reduce((sum, s) => sum + (s.duration ?? 0), 0)}s (
          {storyboard.length} {t('shots')})
        </div>
      )}
    </div>
  )
}

// ─── Tab: Music ────────────────────────────────────────

function TabMusic({
  piece,
  _patch,
  t,
  tCommon,
  components,
  setComponent,
  aiGenerate,
}: {
  piece: ContentPieceDetail
  _patch: (k: string, v: unknown) => void
  t: (key: string) => string
  tCommon: (key: string) => string
  components: Record<string, unknown>
  setComponent: (key: string, value: unknown) => void
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const music =
    (components['music'] as
      | { track: string; mood: string; artist: string; notes: string; referenceUrl: string }[]
      | undefined) ?? []
  const [aiBusy, setAiBusy] = useState(false)

  const updateTrack = (index: number, field: string, value: string) => {
    const updated = [...music]
    updated[index] = { ...updated[index]!, [field]: value }
    setComponent('music', updated)
  }

  const addTrack = () => {
    setComponent('music', [
      ...music,
      { track: '', mood: '', artist: '', notes: '', referenceUrl: '' },
    ])
  }

  const removeTrack = (index: number) => {
    setComponent(
      'music',
      music.filter((_, i) => i !== index),
    )
  }

  const handleAiMusic = async () => {
    if (!aiGenerate) return
    setAiBusy(true)
    try {
      const content = await aiGenerate(
        'music_suggestion',
        `Suggest music/sound for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nType: ${piece.type}\nPlatforms: ${piece.platforms.join(', ')}\n\nCurrent music list: ${JSON.stringify(music)}`,
        'You are a music supervisor. Suggest background music tracks that fit the content mood. Return as JSON array: [{ "track": "...", "mood": "...", "artist": "...", "notes": "..." }]',
      )
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          setComponent('music', parsed)
        }
      } catch {
        // fallback
      }
    } finally {
      setAiBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('music')}</h2>
        <div className="flex gap-2">
          {aiGenerate && (
            <button
              onClick={handleAiMusic}
              disabled={aiBusy}
              className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {aiBusy ? t('aiGenerating') : t('aiMusic')}
            </button>
          )}
          <button
            onClick={addTrack}
            className="rounded-md border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t('addTrack')}
          </button>
        </div>
      </div>

      {music.length === 0 && <p className="text-sm italic text-gray-400">{t('noMusicTracks')}</p>}

      {music.map((track, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {t('track')} #{i + 1}
            </span>
            <button
              onClick={() => removeTrack(i)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              {tCommon('remove')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('trackName')}>
              <input
                value={track.track}
                onChange={(e) => updateTrack(i, 'track', e.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                dir="auto"
              />
            </Field>
            <Field label={t('artist')}>
              <input
                value={track.artist}
                onChange={(e) => updateTrack(i, 'artist', e.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                dir="auto"
              />
            </Field>
            <Field label={t('mood')}>
              <input
                value={track.mood}
                onChange={(e) => updateTrack(i, 'mood', e.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                dir="auto"
              />
            </Field>
            <Field label={t('referenceUrl')}>
              <input
                value={track.referenceUrl}
                onChange={(e) => updateTrack(i, 'referenceUrl', e.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
              />
            </Field>
          </div>
          <div className="mt-2">
            <Field label={t('notes')}>
              <textarea
                value={track.notes}
                onChange={(e) => updateTrack(i, 'notes', e.target.value)}
                rows={2}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                dir="auto"
              />
            </Field>
          </div>
        </div>
      ))}
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
  _patch,
  t,
  _tCommon,
  components,
  setComponent,
  aiGenerate,
}: {
  piece: ContentPieceDetail
  _patch: (k: string, v: unknown) => void
  t: (key: string) => string
  _tCommon: (key: string) => string
  components: Record<string, unknown>
  setComponent: (key: string, value: unknown) => void
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const texts = (components['texts'] as Record<string, string> | undefined) ?? {}
  const [aiBusy, setAiBusy] = useState<string | null>(null)

  const patchText = (field: string, value: string) => {
    setComponent('texts', { ...texts, [field]: value })
  }

  const handleAiHeadline = async () => {
    if (!aiGenerate) return
    setAiBusy('headline')
    try {
      const content = await aiGenerate(
        'headline_tester',
        `Generate and score headlines for:\nBrand: ${piece.client?.name ?? ''}\nBig Idea: ${piece.bigIdea ?? ''}\nType: ${piece.type}`,
        'You are a headline specialist. Generate 5 headlines with scores (1-10) for engagement and clarity. Return as JSON array: [{ "headline": "...", "score": 8, "reason": "..." }]',
      )
      setComponent('texts', { ...texts, aiHeadlines: content })
    } finally {
      setAiBusy(null)
    }
  }

  const handleAiBody = async () => {
    if (!aiGenerate) return
    setAiBusy('body')
    try {
      const content = await aiGenerate(
        'body_copy_writer',
        `Write body copy for:\nBrand: ${piece.client?.name ?? ''}\nBig Idea: ${piece.bigIdea ?? ''}\nHeadline: ${texts['headline'] ?? ''}\nSubheading: ${texts['subheading'] ?? ''}`,
        'You are a copywriter. Write compelling body copy (3-5 sentences) that drives action. Return ONLY the body text.',
      )
      patchText('body', content)
    } finally {
      setAiBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('texts')}</h2>
        <div className="flex gap-2">
          {aiGenerate && (
            <button
              onClick={handleAiHeadline}
              disabled={aiBusy !== null}
              className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {aiBusy === 'headline' ? t('aiGenerating') : t('aiTestHeadlines')}
            </button>
          )}
        </div>
      </div>

      <Field label={t('headline')}>
        <input
          value={texts['headline'] ?? ''}
          onChange={(e) => patchText('headline', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>

      <Field label={t('subheading')}>
        <input
          value={texts['subheading'] ?? ''}
          onChange={(e) => patchText('subheading', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{t('body')}</span>
        {aiGenerate && (
          <button
            onClick={handleAiBody}
            disabled={aiBusy !== null}
            className="rounded-md border px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {aiBusy === 'body' ? t('aiGenerating') : t('aiWriteBody')}
          </button>
        )}
      </div>
      <textarea
        value={texts['body'] ?? ''}
        onChange={(e) => patchText('body', e.target.value)}
        rows={6}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        dir="auto"
      />

      <Field label={t('ctaText')}>
        <input
          value={texts['cta'] ?? ''}
          onChange={(e) => patchText('cta', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>

      {texts['aiHeadlines'] && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-800">{t('aiHeadlines')}</h3>
          <pre className="whitespace-pre-wrap text-xs text-blue-700">{texts['aiHeadlines']}</pre>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Visual ──────────────────────────────────────

function TabVisual({
  piece,
  _patch,
  t,
  _tCommon,
  components,
  setComponent,
  aiGenerate,
}: {
  piece: ContentPieceDetail
  _patch: (k: string, v: unknown) => void
  t: (key: string) => string
  _tCommon: (key: string) => string
  components: Record<string, unknown>
  setComponent: (key: string, value: unknown) => void
  aiGenerate?: (toolType: string, prompt: string, systemPrompt?: string) => Promise<string>
}) {
  const visual =
    (components['visual'] as Record<string, string | Record<string, string>> | undefined) ?? {}
  const colors = (visual['colors'] as Record<string, string> | undefined) ?? {}
  const [aiBusy, setAiBusy] = useState<string | null>(null)

  const patchVisual = (field: string, value: string | Record<string, string>) => {
    setComponent('visual', { ...visual, [field]: value })
  }

  const patchColor = (field: string, value: string) => {
    setComponent('visual', { ...visual, colors: { ...colors, [field]: value } })
  }

  const handleAiDirection = async () => {
    if (!aiGenerate) return
    setAiBusy('direction')
    try {
      const content = await aiGenerate(
        'visual_direction',
        `Create visual direction for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nLayout: ${(visual['layout'] as string) ?? 'none'}\nType: ${piece.type}`,
        'You are a creative director. Write detailed visual direction covering: color palette, typography, imagery style, layout notes, and mood. Return as markdown.',
      )
      patchVisual('direction', content)
    } finally {
      setAiBusy(null)
    }
  }

  const handleAiPalette = async () => {
    if (!aiGenerate) return
    setAiBusy('palette')
    try {
      const content = await aiGenerate(
        'color_palette',
        `Suggest a color palette for:\nTitle: ${piece.title}\nBig Idea: ${piece.bigIdea ?? ''}\nBrand: ${piece.client?.name ?? ''}`,
        'You are a color specialist. Suggest a 3-color palette (primary, secondary, accent) with hex codes. Return as JSON: { "primary": "#...", "secondary": "#...", "accent": "#..." }',
      )
      try {
        const parsed = JSON.parse(content) as Record<string, string>
        setComponent('visual', { ...visual, colors: { ...colors, ...parsed } })
      } catch {
        patchVisual('aiPaletteSuggestion', content)
      }
    } finally {
      setAiBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('visual')}</h2>
        <div className="flex gap-2">
          {aiGenerate && (
            <>
              <button
                onClick={handleAiDirection}
                disabled={aiBusy !== null}
                className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                {aiBusy === 'direction' ? t('aiGenerating') : t('aiDirection')}
              </button>
              <button
                onClick={handleAiPalette}
                disabled={aiBusy !== null}
                className="rounded-md border px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 disabled:opacity-50"
              >
                {aiBusy === 'palette' ? t('aiGenerating') : t('aiPalette')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('layout')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_TYPES.map((l) => (
            <button
              key={l}
              onClick={() => patchVisual('layout', l)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                visual['layout'] === l
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t(`layout_${l}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('colorPalette')}</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('primary')}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(colors['primary'] as string) ?? '#000000'}
                onChange={(e) => patchColor('primary', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <input
                value={(colors['primary'] as string) ?? ''}
                onChange={(e) => patchColor('primary', e.target.value)}
                className="flex-1 rounded border border-gray-200 px-2 py-1 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('secondary')}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(colors['secondary'] as string) ?? '#000000'}
                onChange={(e) => patchColor('secondary', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <input
                value={(colors['secondary'] as string) ?? ''}
                onChange={(e) => patchColor('secondary', e.target.value)}
                className="flex-1 rounded border border-gray-200 px-2 py-1 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('accent')}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(colors['accent'] as string) ?? '#000000'}
                onChange={(e) => patchColor('accent', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <input
                value={(colors['accent'] as string) ?? ''}
                onChange={(e) => patchColor('accent', e.target.value)}
                className="flex-1 rounded border border-gray-200 px-2 py-1 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{t('visualDirection')}</span>
        {aiGenerate && (
          <button
            onClick={handleAiDirection}
            disabled={aiBusy !== null}
            className="rounded-md border px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {aiBusy === 'direction' ? t('aiGenerating') : t('aiDirection')}
          </button>
        )}
      </div>
      <textarea
        value={(visual['direction'] as string) ?? ''}
        onChange={(e) => patchVisual('direction', e.target.value)}
        rows={6}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        dir="auto"
      />
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
