'use client'

import { useState, useMemo } from 'react'
import { useLocale } from 'next-intl'
import { Search, ChevronRight, Clock, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CATEGORIES, ARTICLES, type Article } from './articles'

export function HelpCenterClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [query, setQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [rated, setRated] = useState<'up' | 'down' | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return selectedCategory ? ARTICLES.filter((a) => a.categoryId === selectedCategory) : ARTICLES
    }
    const q = query.toLowerCase()
    return ARTICLES.filter(
      (a) =>
        a.titleAr.includes(query) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.contentAr.includes(query) ||
        a.contentEn.toLowerCase().includes(q),
    )
  }, [query, selectedCategory])

  if (selectedArticle) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ChevronRight className={cn('h-4 w-4', isAr ? '' : 'rotate-180')} />
          {isAr ? 'العودة للمساعدة' : 'Back to Help'}
        </button>

        <div>
          <h1 className="text-2xl font-bold">
            {isAr ? selectedArticle.titleAr : selectedArticle.titleEn}
          </h1>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3" />
            {isAr
              ? `${selectedArticle.readMinAr} دقائق قراءة`
              : `${selectedArticle.readMinEn} min read`}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            {(isAr ? selectedArticle.contentAr : selectedArticle.contentEn)
              .split('\n')
              .map((line, i) => {
                if (line.startsWith('## '))
                  return (
                    <h2 key={i} className="mb-2 mt-6 text-base font-semibold text-white/90">
                      {line.slice(3)}
                    </h2>
                  )
                if (line.startsWith('- ') || line.match(/^[١٢٣٤٥٦٧٨٩\d]+\./))
                  return (
                    <p key={i} className="text-muted-foreground mb-1 ps-3 text-sm">
                      {line}
                    </p>
                  )
                if (line.trim() === '') return <br key={i} />
                return (
                  <p key={i} className="text-muted-foreground mb-2 text-sm">
                    {line}
                  </p>
                )
              })}
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="mb-3 text-sm font-medium">
            {isAr ? 'هل كان هذا المقال مفيدًا؟' : 'Was this article helpful?'}
          </p>
          {rated ? (
            <p className="text-muted-foreground text-sm">
              {isAr ? 'شكرًا على تقييمك! 🙏' : 'Thank you for your feedback! 🙏'}
            </p>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setRated('up')}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-emerald-400/30 hover:text-emerald-400"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {isAr ? 'مفيد' : 'Helpful'}
              </button>
              <button
                onClick={() => setRated('down')}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-red-400/30 hover:text-red-400"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                {isAr ? 'غير مفيد' : 'Not helpful'}
              </button>
            </div>
          )}
        </div>

        {/* AI Bot */}
        <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-purple-400/[0.04] p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-purple-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-purple-300">
              {isAr ? 'لم تجد ما تبحث عنه؟' : "Didn't find what you need?"}
            </p>
            <p className="text-muted-foreground text-xs">
              {isAr ? 'اسأل مساعد AI مباشرة' : 'Ask the AI assistant directly'}
            </p>
          </div>
          <Link
            href="/ai-tools"
            className="shrink-0 rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/30"
          >
            {isAr ? 'اسأل AI' : 'Ask AI'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isAr ? 'مركز المساعدة' : 'Help Center'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAr ? 'ابحث عن إجابات لأسئلتك' : 'Find answers to your questions'}
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedCategory(null)
          }}
          placeholder={isAr ? 'ابحث في المساعدة...' : 'Search help articles...'}
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-3 pe-4 ps-10 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-sky-400/30 focus:bg-white/[0.05]"
        />
      </div>

      {/* Categories */}
      {!query && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cn(
                'rounded-xl border p-4 text-center transition-all',
                selectedCategory === cat.id
                  ? 'border-sky-400/30 bg-sky-400/[0.06]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]',
              )}
            >
              <span className="text-2xl">{cat.icon}</span>
              <p className="mt-2 text-xs font-medium leading-tight">
                {isAr ? cat.titleAr : cat.titleEn}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Articles list */}
      <div className="space-y-2">
        {query && (
          <p className="text-muted-foreground text-xs">
            {isAr
              ? `${filtered.length} نتيجة لـ "${query}"`
              : `${filtered.length} results for "${query}"`}
          </p>
        )}
        {filtered.map((article) => {
          const cat = CATEGORIES.find((c) => c.id === article.categoryId)
          return (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="flex w-full items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-start transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <span className="text-xl">{cat?.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{isAr ? article.titleAr : article.titleEn}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {isAr ? cat?.titleAr : cat?.titleEn} ·{' '}
                  {isAr ? `${article.readMinAr} دقائق` : `${article.readMinEn} min`}
                </p>
              </div>
              <ChevronRight
                className={cn('h-4 w-4 shrink-0 text-white/20', isAr && 'rotate-180')}
              />
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              {isAr
                ? 'لا توجد نتائج — جرّب كلمات أخرى أو اسأل AI'
                : 'No results — try different keywords or ask AI'}
            </p>
            <Link
              href="/ai-tools"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/30"
            >
              <Sparkles className="h-4 w-4" />
              {isAr ? 'اسأل مساعد AI' : 'Ask AI Assistant'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
