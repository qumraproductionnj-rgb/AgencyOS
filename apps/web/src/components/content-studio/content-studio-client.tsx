'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import {
  PenLine,
  Share2,
  Mail,
  Film,
  BookOpen,
  Heading,
  Hash,
  Languages,
  Image,
  Paintbrush,
  Sparkles,
  Layout,
  RectangleHorizontal,
  Wand2,
  Video,
  Captions,
  BarChart2,
  CalendarDays,
  Search,
  Zap,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = 'all' | 'writing' | 'images' | 'video' | 'strategy'

interface Tool {
  id: string
  nameAr: string
  nameEn: string
  descAr: string
  descEn: string
  category: Exclude<Category, 'all'>
  icon: React.ElementType
  color: string
  glow: string
  uses: number
  speed: 'fast' | 'medium' | 'slow'
}

const TOOLS: Tool[] = [
  // Writing
  {
    id: 't1',
    nameAr: 'كاتب الإعلانات',
    nameEn: 'Ad Copywriter',
    descAr: 'صيغ AIDA و PAS لإعلانات مؤثرة',
    descEn: 'AIDA & PAS formulas for impactful ads',
    category: 'writing',
    icon: PenLine,
    color: 'bg-sky-500/15 text-sky-400',
    glow: 'hover:shadow-sky-500/20',
    uses: 1240,
    speed: 'fast',
  },
  {
    id: 't2',
    nameAr: 'كاتب السوشيال ميديا',
    nameEn: 'Social Media Writer',
    descAr: 'منشورات احترافية لكل منصة',
    descEn: 'Professional posts for every platform',
    category: 'writing',
    icon: Share2,
    color: 'bg-purple-500/15 text-purple-400',
    glow: 'hover:shadow-purple-500/20',
    uses: 2100,
    speed: 'fast',
  },
  {
    id: 't3',
    nameAr: 'كاتب البريد الإلكتروني',
    nameEn: 'Email Writer',
    descAr: 'رسائل تسويقية بمعدل فتح عالٍ',
    descEn: 'Marketing emails with high open rates',
    category: 'writing',
    icon: Mail,
    color: 'bg-emerald-500/15 text-emerald-400',
    glow: 'hover:shadow-emerald-500/20',
    uses: 890,
    speed: 'fast',
  },
  {
    id: 't4',
    nameAr: 'كاتب السيناريو',
    nameEn: 'Script Writer',
    descAr: 'سكريبت فيديو احترافي ومقنع',
    descEn: 'Professional & persuasive video scripts',
    category: 'writing',
    icon: Film,
    color: 'bg-amber-500/15 text-amber-400',
    glow: 'hover:shadow-amber-500/20',
    uses: 670,
    speed: 'medium',
  },
  {
    id: 't5',
    nameAr: 'كاتب المدونات',
    nameEn: 'Blog Writer',
    descAr: 'مقالات SEO متكاملة وجذابة',
    descEn: 'Complete SEO-optimized blog articles',
    category: 'writing',
    icon: BookOpen,
    color: 'bg-rose-500/15 text-rose-400',
    glow: 'hover:shadow-rose-500/20',
    uses: 540,
    speed: 'slow',
  },
  {
    id: 't6',
    nameAr: 'مولد العناوين',
    nameEn: 'Headline Generator',
    descAr: 'عناوين تستوقف وتجذب الانتباه',
    descEn: 'Scroll-stopping attention-grabbing headlines',
    category: 'writing',
    icon: Heading,
    color: 'bg-cyan-500/15 text-cyan-400',
    glow: 'hover:shadow-cyan-500/20',
    uses: 1870,
    speed: 'fast',
  },
  {
    id: 't7',
    nameAr: 'كاتب الـ Hashtags',
    nameEn: 'Hashtag Writer',
    descAr: 'هاشتاقات تزيد الوصول العضوي',
    descEn: 'Hashtags that boost organic reach',
    category: 'writing',
    icon: Hash,
    color: 'bg-violet-500/15 text-violet-400',
    glow: 'hover:shadow-violet-500/20',
    uses: 3200,
    speed: 'fast',
  },
  {
    id: 't8',
    nameAr: 'مترجم احترافي',
    nameEn: 'Pro Translator',
    descAr: 'ترجمة دقيقة مع الحفاظ على الأسلوب',
    descEn: 'Accurate translation preserving tone',
    category: 'writing',
    icon: Languages,
    color: 'bg-teal-500/15 text-teal-400',
    glow: 'hover:shadow-teal-500/20',
    uses: 980,
    speed: 'fast',
  },
  // Images
  {
    id: 't9',
    nameAr: 'مولد الصور',
    nameEn: 'Image Generator',
    descAr: 'Nano Banana 2 — جودة احترافية',
    descEn: 'Nano Banana 2 — professional quality',
    category: 'images',
    icon: Sparkles,
    color: 'bg-pink-500/15 text-pink-400',
    glow: 'hover:shadow-pink-500/20',
    uses: 4500,
    speed: 'medium',
  },
  {
    id: 't10',
    nameAr: 'محرر الصور',
    nameEn: 'Image Editor',
    descAr: 'تعديل وتحسين الصور بالذكاء الاصطناعي',
    descEn: 'AI-powered image editing & enhancement',
    category: 'images',
    icon: Paintbrush,
    color: 'bg-orange-500/15 text-orange-400',
    glow: 'hover:shadow-orange-500/20',
    uses: 2300,
    speed: 'medium',
  },
  {
    id: 't11',
    nameAr: 'مولد الشعارات',
    nameEn: 'Logo Generator',
    descAr: 'شعارات احترافية في ثوانٍ',
    descEn: 'Professional logos in seconds',
    category: 'images',
    icon: Wand2,
    color: 'bg-yellow-500/15 text-yellow-400',
    glow: 'hover:shadow-yellow-500/20',
    uses: 1100,
    speed: 'slow',
  },
  {
    id: 't12',
    nameAr: 'مولد الـ Thumbnails',
    nameEn: 'Thumbnail Generator',
    descAr: 'صور مصغرة تزيد نسبة النقر',
    descEn: 'Thumbnails that boost click-through rates',
    category: 'images',
    icon: Image,
    color: 'bg-lime-500/15 text-lime-400',
    glow: 'hover:shadow-lime-500/20',
    uses: 1650,
    speed: 'medium',
  },
  {
    id: 't13',
    nameAr: 'مولد الـ Banners',
    nameEn: 'Banner Generator',
    descAr: 'بانرات إعلانية لكل المنصات',
    descEn: 'Ad banners for all platforms',
    category: 'images',
    icon: RectangleHorizontal,
    color: 'bg-indigo-500/15 text-indigo-400',
    glow: 'hover:shadow-indigo-500/20',
    uses: 880,
    speed: 'medium',
  },
  {
    id: 't14',
    nameAr: 'محسّن جودة الصور',
    nameEn: 'Image Upscaler',
    descAr: 'رفع جودة الصور حتى 4K',
    descEn: 'Upscale images up to 4K resolution',
    category: 'images',
    icon: Layout,
    color: 'bg-fuchsia-500/15 text-fuchsia-400',
    glow: 'hover:shadow-fuchsia-500/20',
    uses: 720,
    speed: 'slow',
  },
  // Video
  {
    id: 't15',
    nameAr: 'مولد الفيديو',
    nameEn: 'Video Generator',
    descAr: 'Seedance 2.0 — فيديو من نص',
    descEn: 'Seedance 2.0 — text-to-video',
    category: 'video',
    icon: Video,
    color: 'bg-red-500/15 text-red-400',
    glow: 'hover:shadow-red-500/20',
    uses: 3100,
    speed: 'slow',
  },
  {
    id: 't16',
    nameAr: 'كاتب Script الفيديو',
    nameEn: 'Video Script Writer',
    descAr: 'سكريبت مُنظَّم مع Hook وCTA',
    descEn: 'Structured script with Hook & CTA',
    category: 'video',
    icon: Film,
    color: 'bg-amber-500/15 text-amber-400',
    glow: 'hover:shadow-amber-500/20',
    uses: 1400,
    speed: 'fast',
  },
  {
    id: 't17',
    nameAr: 'مولد الـ Captions',
    nameEn: 'Caption Generator',
    descAr: 'ترجمة وتوقيت تلقائي للفيديو',
    descEn: 'Auto captions & timing for videos',
    category: 'video',
    icon: Captions,
    color: 'bg-sky-500/15 text-sky-400',
    glow: 'hover:shadow-sky-500/20',
    uses: 960,
    speed: 'medium',
  },
  {
    id: 't18',
    nameAr: 'محلل الفيديو',
    nameEn: 'Video Analyzer',
    descAr: 'تحليل الأداء واقتراح تحسينات',
    descEn: 'Analyze performance & suggest improvements',
    category: 'video',
    icon: BarChart2,
    color: 'bg-emerald-500/15 text-emerald-400',
    glow: 'hover:shadow-emerald-500/20',
    uses: 540,
    speed: 'medium',
  },
  // Strategy
  {
    id: 't19',
    nameAr: 'خطة محتوى شهرية',
    nameEn: 'Monthly Content Plan',
    descAr: 'خطة كاملة 30 يوم مع مواعيد نشر',
    descEn: 'Full 30-day plan with publishing schedule',
    category: 'strategy',
    icon: CalendarDays,
    color: 'bg-purple-500/15 text-purple-400',
    glow: 'hover:shadow-purple-500/20',
    uses: 780,
    speed: 'slow',
  },
  {
    id: 't20',
    nameAr: 'تحليل المنافسين',
    nameEn: 'Competitor Analysis',
    descAr: 'تحليل عميق لاستراتيجية المنافسين',
    descEn: 'Deep analysis of competitor strategies',
    category: 'strategy',
    icon: Search,
    color: 'bg-rose-500/15 text-rose-400',
    glow: 'hover:shadow-rose-500/20',
    uses: 430,
    speed: 'slow',
  },
]

const TABS: { key: Category; ar: string; en: string }[] = [
  { key: 'all', ar: 'الكل', en: 'All' },
  { key: 'writing', ar: 'كتابة', en: 'Writing' },
  { key: 'images', ar: 'صور', en: 'Images' },
  { key: 'video', ar: 'فيديو', en: 'Video' },
  { key: 'strategy', ar: 'استراتيجية', en: 'Strategy' },
]

const SPEED_CFG = {
  fast: { ar: 'سريع', en: 'Fast', icon: Zap, color: 'text-emerald-400' },
  medium: { ar: 'متوسط', en: 'Medium', icon: Clock, color: 'text-amber-400' },
  slow: { ar: 'بطيء', en: 'Slow', icon: Clock, color: 'text-red-400' },
}

function fmtUses(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function ContentStudioClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [tab, setTab] = useState<Category>('all')

  const filtered = tab === 'all' ? TOOLS : TOOLS.filter((t) => t.category === tab)

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {isAr ? 'Content Studio · 20 أداة AI' : 'Content Studio · 20 AI Tools'}
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {isAr
            ? 'أدوات ذكاء اصطناعي لتسريع إنتاج المحتوى'
            : 'AI tools to accelerate content production'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-white/[0.1] text-white shadow'
                : 'text-muted-foreground hover:bg-white/[0.05] hover:text-white',
            )}
          >
            {isAr ? t.ar : t.en}
            {t.key !== 'all' && (
              <span className="text-muted-foreground ms-1.5 text-[11px]">
                {TOOLS.filter((x) => x.category === t.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => {
          const Icon = tool.icon
          const speed = SPEED_CFG[tool.speed]
          const SpeedIcon = speed.icon
          return (
            <div
              key={tool.id}
              className={cn(
                'group rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-200',
                'hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-lg',
                tool.glow,
              )}
            >
              {/* Icon + category */}
              <div className="mb-3 flex items-start justify-between">
                <div className={cn('rounded-xl p-2.5', tool.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-muted-foreground rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {isAr
                    ? TABS.find((x) => x.key === tool.category)?.ar
                    : TABS.find((x) => x.key === tool.category)?.en}
                </span>
              </div>

              {/* Name + desc */}
              <div className="mb-3">
                <div className="font-semibold">{isAr ? tool.nameAr : tool.nameEn}</div>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {isAr ? tool.descAr : tool.descEn}
                </p>
              </div>

              {/* Stats */}
              <div className="mb-4 flex items-center gap-3 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <BarChart2 className="h-3 w-3" />
                  {fmtUses(tool.uses)} {isAr ? 'استخدام' : 'uses'}
                </span>
                <span className={cn('flex items-center gap-1', speed.color)}>
                  <SpeedIcon className="h-3 w-3" />
                  {isAr ? speed.ar : speed.en}
                </span>
              </div>

              {/* CTA */}
              <button className="w-full rounded-lg bg-white/[0.06] py-2 text-sm font-medium transition-colors hover:bg-white/[0.1] group-hover:text-white">
                {isAr ? 'استخدم' : 'Use'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
