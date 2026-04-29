import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  unstable_setRequestLocale(locale)

  return <HomeContent />
}

function HomeContent() {
  const t = useTranslations('home')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/ar"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            العربية (RTL)
          </a>
          <a
            href="/en"
            className="rounded-md border border-border px-4 py-2 hover:bg-accent"
          >
            English (LTR)
          </a>
        </div>
      </div>
    </main>
  )
}
