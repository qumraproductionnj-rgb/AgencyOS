import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'المدونة — Vision OS',
  description: 'مقالات ونصائح لإدارة وكالتك الإبداعية بكفاءة',
}

const POSTS = [
  {
    slug: 'manage-creative-agency',
    titleAr: 'كيف تدير وكالة إبداعية بكفاءة',
    titleEn: 'How to Manage a Creative Agency Efficiently',
    excerptAr:
      'دليل عملي لإدارة الفرق والمشاريع والعملاء في وكالتك الإبداعية باستخدام الأدوات الحديثة.',
    excerptEn:
      'A practical guide to managing teams, projects, and clients in your creative agency using modern tools.',
    date: '2026-05-01',
    readTime: 5,
  },
  {
    slug: 'ai-tools-arabic-content',
    titleAr: 'أفضل أدوات AI للمحتوى العربي',
    titleEn: 'Best AI Tools for Arabic Content',
    excerptAr:
      'استكشاف أفضل أدوات الذكاء الاصطناعي التي تدعم اللغة العربية وتساعدك على إنتاج محتوى أفضل.',
    excerptEn:
      'Exploring the best AI tools that support Arabic language and help you produce better content.',
    date: '2026-05-08',
    readTime: 7,
  },
  {
    slug: 'project-profitability',
    titleAr: 'كيف تحسب ربحية مشاريعك',
    titleEn: 'How to Calculate Your Project Profitability',
    excerptAr: 'معادلات وأساليب عملية لمعرفة هل مشاريعك مربحة فعلاً وكيف تحسّن هامش الربح.',
    excerptEn:
      'Practical formulas and methods to know if your projects are truly profitable and how to improve margins.',
    date: '2026-05-15',
    readTime: 6,
  },
]

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const isAr = locale === 'ar'

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {isAr ? 'المدونة' : 'Blog'}
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          {isAr
            ? 'نصائح وأفكار لإدارة وكالتك الإبداعية'
            : 'Tips and ideas for managing your creative agency'}
        </p>
      </div>

      <div className="space-y-8">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-3 text-sm text-gray-400">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>·</span>
              <span>
                {post.readTime} {isAr ? 'دقائق قراءة' : 'min read'}
              </span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {isAr ? post.titleAr : post.titleEn}
            </h2>
            <p className="mb-4 text-gray-600">{isAr ? post.excerptAr : post.excerptEn}</p>
            <Link
              href={`/${locale}/blog/${post.slug}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {isAr ? 'اقرأ المزيد ←' : 'Read more →'}
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
