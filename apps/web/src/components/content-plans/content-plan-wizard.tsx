'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useClients } from '@/hooks/use-clients'
import { useCampaigns } from '@/hooks/use-campaigns'
import { useBrandBriefs } from '@/hooks/use-brand-briefs'
import { useContentPillars, type ContentPillar } from '@/hooks/use-content-pillars'
import {
  useContentPlan,
  useCreateContentPlan,
  useUpdateContentPlan,
  useGenerateIdeas,
  useFinalizePlan,
  type AiIdea,
} from '@/hooks/use-content-plans'

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const PIECE_TYPES = [
  'VIDEO_LONG',
  'REEL',
  'STORY',
  'STATIC_DESIGN',
  'CAROUSEL',
  'GIF',
  'PODCAST',
  'BLOG_POST',
] as const

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

export default function ContentPlanWizard() {
  const t = useTranslations('contentPlans')
  const tCommon = useTranslations('common')

  const [step, setStep] = useState(1)
  const [planId, setPlanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Step 1: context
  const [clientId, setClientId] = useState('')
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [campaignId, setCampaignId] = useState('')
  const [title, setTitle] = useState('')

  // Step 2: objectives + distribution
  const [objectives, setObjectives] = useState<
    { metric: string; target: number; current?: number }[]
  >([{ metric: '', target: 0 }])
  const [pillarDist, setPillarDist] = useState<
    { pillarId: string; targetCount: number; name?: string }[]
  >([])
  const [contentTypeDist, setContentTypeDist] = useState<Record<string, number>>({})

  // Step 3: AI ideas
  const [ideas, setIdeas] = useState<AiIdea[]>([])
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set())
  const [aiDirection, setAiDirection] = useState('')
  const [generating, setGenerating] = useState(false)

  // Step 4: calendar arrangement
  const [scheduledDays, setScheduledDays] = useState<Record<number, number>>({})

  // Data
  const { data: clients } = useClients()
  const { data: campaigns } = useCampaigns(clientId ? { clientId } : undefined)
  const { data: plan } = useContentPlan(planId ?? '')
  const { data: pillars } = useContentPillars(clientId ? { clientId } : undefined)
  const { data: briefs } = useBrandBriefs(clientId ? { clientId } : undefined)

  const createPlan = useCreateContentPlan()
  const updatePlan = useUpdateContentPlan()
  const generateIdeas = useGenerateIdeas()
  const finalizePlan = useFinalizePlan()

  // Load plan data when editing
  useEffect(() => {
    if (plan) {
      setTitle(plan.title ?? '')
      setCampaignId(plan.campaignId ?? '')
      setClientId(plan.clientId)
      setMonth(plan.month)
      setYear(plan.year)
      if (plan.monthlyObjectives) setObjectives(plan.monthlyObjectives)
      if (plan.pillarDistribution) {
        const enriched = plan.pillarDistribution.map((pd) => {
          const p = pillars?.find((x) => x.id === pd.pillarId)
          return { ...pd, name: p?.nameAr ?? p?.nameEn ?? '' }
        })
        setPillarDist(enriched)
      }
      if (plan.contentTypeDistribution) setContentTypeDist(plan.contentTypeDistribution)
    }
  }, [plan, pillars])

  const handleStep1Next = async () => {
    if (!clientId) {
      setError(t('errorNoClient'))
      return
    }
    setError(null)
    try {
      const created = await createPlan.mutateAsync({
        clientId,
        month,
        year,
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(campaignId ? { campaignId } : {}),
      })
      setPlanId(created.id)
      setStep(2)
    } catch {
      setError(t('errorCreate'))
    }
  }

  const handleStep2Next = async () => {
    if (!planId) return
    setError(null)
    try {
      await updatePlan.mutateAsync({
        id: planId,
        ...(objectives.some((o) => o.metric.trim())
          ? { monthlyObjectives: objectives.filter((o) => o.metric.trim()) }
          : {}),
        ...(pillarDist.length > 0 && pillarDist.some((p) => p.pillarId)
          ? {
              pillarDistribution: pillarDist
                .filter((p) => p.pillarId)
                .map(({ name: _n, ...rest }) => rest),
            }
          : {}),
        ...(Object.keys(contentTypeDist).length > 0
          ? { contentTypeDistribution: contentTypeDist }
          : {}),
      })
      setStep(3)
    } catch {
      setError(t('errorUpdate'))
    }
  }

  const handleGenerateIdeas = async () => {
    if (!planId) return
    setGenerating(true)
    setError(null)
    try {
      const result = await generateIdeas.mutateAsync({
        id: planId,
        ...(aiDirection.trim() ? { direction: aiDirection.trim() } : {}),
        count: 50,
      })
      setIdeas(result.ideas)
      setSelectedIdeas(new Set(result.ideas.slice(0, 30).map((_, i) => i)))
    } catch {
      setError(t('errorGenerate'))
    } finally {
      setGenerating(false)
    }
  }

  const toggleIdea = (index: number) => {
    setSelectedIdeas((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else if (next.size < 30) next.add(index)
      return next
    })
  }

  const handleStep3Next = () => {
    if (selectedIdeas.size === 0) {
      setError(t('errorNoIdeas'))
      return
    }
    setError(null)
    const selected = ideas.filter((_, i) => selectedIdeas.has(i))
    const days: Record<number, number> = {}
    selected.forEach((idea, i) => {
      days[i] = (i % 28) + 1
    })
    setScheduledDays(days)
    setStep(4)
  }

  const handleFinalize = async () => {
    if (!planId) return
    setError(null)
    try {
      const selected = ideas.filter((_, i) => selectedIdeas.has(i))
      const pieces = selected.map((idea, i) => ({
        title: idea.title,
        type: idea.type,
        ...(idea.pillarId ? { pillarId: idea.pillarId } : {}),
        ...(idea.bigIdea ? { bigIdea: idea.bigIdea } : {}),
        platforms: idea.platforms,
        scheduledDay: scheduledDays[i] ?? (i % 28) + 1,
      }))
      await finalizePlan.mutateAsync({ id: planId, pieces })
      setSuccess(true)
    } catch {
      setError(t('errorFinalize'))
    }
  }

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month])
  const selectedArr = ideas.filter((_, i) => selectedIdeas.has(i))
  const busy = createPlan.isPending || updatePlan.isPending || finalizePlan.isPending

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h2 className="text-xl font-bold">{t('successTitle')}</h2>
        <p className="text-muted-foreground mt-2">{t('successDesc')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        <p className="mt-4 text-sm text-gray-500">{t('step', { n: step, total: 4 })}</p>
        <div className="mt-3 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Step content */}
      <div className="border-border bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
        {step === 1 && (
          <StepContext
            clientId={clientId}
            onClientId={setClientId}
            month={month}
            onMonth={setMonth}
            year={year}
            onYear={setYear}
            campaignId={campaignId}
            onCampaignId={setCampaignId}
            title={title}
            onTitle={setTitle}
            clients={clients ?? []}
            campaigns={campaigns ?? []}
            t={t}
          />
        )}

        {step === 2 && (
          <StepObjectives
            objectives={objectives}
            onObjectives={setObjectives}
            pillarDist={pillarDist}
            onPillarDist={setPillarDist}
            contentTypeDist={contentTypeDist}
            onContentTypeDist={setContentTypeDist}
            pillars={pillars ?? []}
            brief={briefs?.[0] ?? null}
            t={t}
          />
        )}

        {step === 3 && (
          <StepIdeas
            ideas={ideas}
            selectedIdeas={selectedIdeas}
            toggleIdea={toggleIdea}
            aiDirection={aiDirection}
            onAiDirection={setAiDirection}
            generating={generating}
            onGenerate={handleGenerateIdeas}
            pillars={pillars ?? []}
            t={t}
          />
        )}

        {step === 4 && (
          <StepCalendar
            year={year}
            month={month}
            daysInMonth={daysInMonth}
            pieces={selectedArr}
            scheduledDays={scheduledDays}
            onScheduledDays={setScheduledDays}
            t={t}
          />
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={busy}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {tCommon('back')}
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {step < 4 ? (
            <button
              onClick={
                step === 1 ? handleStep1Next : step === 2 ? handleStep2Next : handleStep3Next
              }
              disabled={busy}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? tCommon('loading') : t('next')}
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={busy}
              className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {busy ? tCommon('loading') : t('finalize')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Context ──────────────────────────────────────────────

function StepContext({
  clientId,
  onClientId,
  month,
  onMonth,
  year,
  onYear,
  campaignId,
  onCampaignId,
  title,
  onTitle,
  clients,
  campaigns,
  t,
}: {
  clientId: string
  onClientId: (v: string) => void
  month: number
  onMonth: (v: number) => void
  year: number
  onYear: (v: number) => void
  campaignId: string
  onCampaignId: (v: string) => void
  title: string
  onTitle: (v: string) => void
  clients: { id: string; name: string; nameEn?: string | null }[]
  campaigns: { id: string; name: string }[]
  t: (key: string) => string
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step1Title')}</h2>
      <p className="text-muted-foreground text-sm">{t('step1Desc')}</p>

      <Field label={t('client')}>
        <select
          value={clientId}
          onChange={(e) => onClientId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">--</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.nameEn ? ` (${c.nameEn})` : ''}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('month')}>
          <select
            value={month}
            onChange={(e) => onMonth(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {t(`month${m}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('year')}>
          <select
            value={year}
            onChange={(e) => onYear(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t('campaign')}>
        <select
          value={campaignId}
          onChange={(e) => onCampaignId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('noCampaign')}</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t('planTitle')}>
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder={t('planTitlePlaceholder')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          dir="auto"
        />
      </Field>
    </div>
  )
}

// ─── Step 2: Objectives + Distribution ───────────────────────────

function StepObjectives({
  objectives,
  onObjectives,
  pillarDist,
  onPillarDist,
  contentTypeDist,
  onContentTypeDist,
  pillars,
  brief,
  t,
}: {
  objectives: { metric: string; target: number; current?: number }[]
  onObjectives: (v: { metric: string; target: number; current?: number }[]) => void
  pillarDist: { pillarId: string; targetCount: number; name?: string }[]
  onPillarDist: (v: { pillarId: string; targetCount: number; name?: string }[]) => void
  contentTypeDist: Record<string, number>
  onContentTypeDist: (v: Record<string, number>) => void
  pillars: ContentPillar[]
  brief: { id: string; brandName: string } | null
  t: (key: string) => string
}) {
  const updateObjective = (i: number, key: string, value: string | number) => {
    const next = [...objectives] as { metric: string; target: number; current?: number }[]
    const cur = next[i]
    if (!cur) return
    next[i] = {
      metric: cur.metric,
      target: cur.target,
      ...(cur.current !== undefined ? { current: cur.current } : {}),
      [key]: value,
    }
    onObjectives(next)
  }
  const addObjective = () =>
    onObjectives([...objectives, { metric: '', target: 0 }] as {
      metric: string
      target: number
      current?: number
    }[])
  const removeObjective = (i: number) => onObjectives(objectives.filter((_, idx) => idx !== i))

  const updatePillar = (i: number, key: string, value: string | number) => {
    const next = [...pillarDist] as { pillarId: string; targetCount: number; name?: string }[]
    const prev = next[i]
    if (!prev) return
    const name =
      key === 'pillarId' && typeof value === 'string'
        ? (pillars.find((x) => x.id === value)?.nameAr ??
          pillars.find((x) => x.id === value)?.nameEn ??
          '')
        : prev.name
    next[i] = {
      pillarId: key === 'pillarId' ? (value as string) : prev.pillarId,
      targetCount: key === 'targetCount' ? (value as number) : prev.targetCount,
      ...(name ? { name } : {}),
    }
    onPillarDist(next)
  }
  const addPillar = () => {
    if (pillarDist.length < pillars.length) {
      onPillarDist([...pillarDist, { pillarId: '', targetCount: 0 }])
    }
  }
  const removePillar = (i: number) => onPillarDist(pillarDist.filter((_, idx) => idx !== i))

  const usedPillars = new Set(pillarDist.map((p) => p.pillarId).filter(Boolean))

  const updateContentType = (type: string, count: number) => {
    const next = { ...contentTypeDist }
    if (count > 0) next[type] = count
    else delete next[type]
    onContentTypeDist(next)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t('step2Title')}</h2>
      <p className="text-muted-foreground text-sm">{t('step2Desc')}</p>

      {brief && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          {t('brandBrief')}: <strong>{brief.brandName}</strong>
        </div>
      )}

      {/* Objectives */}
      <div>
        <h3 className="mb-2 font-medium">{t('objectives')}</h3>
        {objectives.map((obj, i) => (
          <div key={i} className="mb-2 flex items-start gap-2">
            <input
              value={obj.metric}
              onChange={(e) => updateObjective(i, 'metric', e.target.value)}
              placeholder={t('objectiveMetric')}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
            <input
              type="number"
              value={obj.target || ''}
              onChange={(e) => updateObjective(i, 'target', Number(e.target.value))}
              placeholder={t('objectiveTarget')}
              className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {objectives.length > 1 && (
              <button
                onClick={() => removeObjective(i)}
                className="mt-1 text-sm text-red-500 hover:text-red-700"
              >
                {t('remove')}
              </button>
            )}
          </div>
        ))}
        <button onClick={addObjective} className="text-sm text-blue-600 hover:text-blue-800">
          + {t('addObjective')}
        </button>
      </div>

      {/* Pillar Distribution */}
      <div>
        <h3 className="mb-2 font-medium">{t('pillarDistribution')}</h3>
        {pillarDist.map((p, i) => (
          <div key={i} className="mb-2 flex items-start gap-2">
            <select
              value={p.pillarId}
              onChange={(e) => updatePillar(i, 'pillarId', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">--</option>
              {pillars
                .filter((pill) => !usedPillars.has(pill.id) || pill.id === p.pillarId)
                .map((pill) => (
                  <option key={pill.id} value={pill.id}>
                    {pill.nameAr}
                    {pill.nameEn ? ` (${pill.nameEn})` : ''}
                  </option>
                ))}
            </select>
            <input
              type="number"
              value={p.targetCount || ''}
              onChange={(e) => updatePillar(i, 'targetCount', Number(e.target.value))}
              placeholder={t('count')}
              className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => removePillar(i)}
              className="mt-1 text-sm text-red-500 hover:text-red-700"
            >
              {t('remove')}
            </button>
          </div>
        ))}
        {pillarDist.length < pillars.length && (
          <button onClick={addPillar} className="text-sm text-blue-600 hover:text-blue-800">
            + {t('addPillar')}
          </button>
        )}
      </div>

      {/* Content Type Distribution */}
      <div>
        <h3 className="mb-2 font-medium">{t('contentTypeDistribution')}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PIECE_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <label className="flex-1 text-sm">{t(`type_${type}`)}</label>
              <input
                type="number"
                value={contentTypeDist[type] ?? 0}
                onChange={(e) => updateContentType(type, Number(e.target.value))}
                className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: AI Ideas ────────────────────────────────────────────

function StepIdeas({
  ideas,
  selectedIdeas,
  toggleIdea,
  aiDirection,
  onAiDirection,
  generating,
  onGenerate,
  pillars,
  t,
}: {
  ideas: AiIdea[]
  selectedIdeas: Set<number>
  toggleIdea: (i: number) => void
  aiDirection: string
  onAiDirection: (v: string) => void
  generating: boolean
  onGenerate: () => void
  pillars: ContentPillar[]
  t: (key: string, values?: Record<string, string | number>) => string
}) {
  const pillarMap = useMemo(() => {
    const m = new Map<string, string>()
    pillars.forEach((p) => m.set(p.id, p.nameAr || p.nameEn || ''))
    return m
  }, [pillars])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step3Title')}</h2>
      <p className="text-muted-foreground text-sm">{t('step3Desc')}</p>

      {ideas.length === 0 ? (
        <>
          <Field label={t('aiDirection')}>
            <textarea
              value={aiDirection}
              onChange={(e) => onAiDirection(e.target.value)}
              placeholder={t('aiDirectionPlaceholder')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </Field>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? t('generating') : t('generateIdeas')}
          </button>
        </>
      ) : (
        <>
          <div className="text-sm text-gray-500">
            {t('selectedCount', { n: selectedIdeas.size })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ideas.map((idea, i) => {
              const sel = selectedIdeas.has(i)
              return (
                <div
                  key={i}
                  onClick={() => toggleIdea(i)}
                  className={`cursor-pointer rounded-md border p-3 transition-colors ${
                    sel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium">{idea.title}</h4>
                    <input type="checkbox" checked={sel} readOnly className="mt-0.5" />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      {t(`type_${idea.type}`)}
                    </span>
                    {idea.pillarId && pillarMap.has(idea.pillarId) && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {pillarMap.get(idea.pillarId)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{idea.bigIdea}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {idea.platforms.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-700"
                      >
                        {p}
                      </span>
                    ))}
                    {idea.platforms.length > 3 && (
                      <span className="text-xs text-gray-400">+{idea.platforms.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Step 4: Calendar ────────────────────────────────────────────

function StepCalendar({
  year,
  month,
  daysInMonth,
  pieces,
  scheduledDays,
  onScheduledDays,
  t,
}: {
  year: number
  month: number
  daysInMonth: number
  pieces: AiIdea[]
  scheduledDays: Record<number, number>
  onScheduledDays: (v: Record<number, number>) => void
  t: (key: string) => string
}) {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  const weekDays = t('weekDays').split(',')

  const piecesByDay: Record<number, AiIdea[]> = {}
  Object.entries(scheduledDays).forEach(([idx, day]) => {
    const index = Number(idx)
    const piece = pieces[index]
    if (piece) {
      if (!piecesByDay[day]) piecesByDay[day] = []
      piecesByDay[day].push(piece)
    }
  })

  const assignDay = (index: number, day: number) => {
    onScheduledDays({ ...scheduledDays, [index]: day })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step4Title')}</h2>
      <p className="text-muted-foreground text-sm">{t('step4Desc')}</p>

      {/* Calendar grid */}
      <div className="rounded-md border border-gray-200">
        <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-xs font-medium text-gray-500">
          {weekDays.map((d) => (
            <div key={d} className="border-l px-2 py-2 last:border-l-0">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 border-b border-r bg-gray-50 p-1" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dayNum = day + 1
            const dayPieces = piecesByDay[dayNum] ?? []
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() + 1 &&
              year === new Date().getFullYear()
            return (
              <div
                key={dayNum}
                className={`min-h-24 border-b border-r p-1 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="mb-1 text-right text-xs font-medium text-gray-500">{dayNum}</div>
                <div className="space-y-0.5">
                  {dayPieces.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      className="truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800"
                      title={p.title}
                    >
                      {p.title}
                    </div>
                  ))}
                  {dayPieces.length > 3 && (
                    <div className="text-xs text-gray-400">+{dayPieces.length - 3}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Piece day assignment */}
      <div>
        <h3 className="mb-2 font-medium">{t('assignDays')}</h3>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
          {pieces.map((piece, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md bg-gray-50 p-2 text-sm">
              <span className="flex-1 truncate">{piece.title}</span>
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                {t(`type_${piece.type}`)}
              </span>
              <select
                value={scheduledDays[i] ?? ''}
                onChange={(e) => assignDay(i, Number(e.target.value))}
                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="">--</option>
                {Array.from({ length: daysInMonth }).map((_, d) => (
                  <option key={d + 1} value={d + 1}>
                    {d + 1}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
