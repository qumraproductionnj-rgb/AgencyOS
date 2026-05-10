import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomeContent />
}

function HomeContent() {
  const t = useTranslations('home')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('description')}</p>

        <div className="text-muted-foreground mt-12 grid gap-3 text-start text-sm sm:grid-cols-2">
          <Card label="Locale" value="useLocale()" />
          <Card label="Direction" value="dir on <html>" />
          <Card label="Theme" value="next-themes (system)" />
          <Card label="Query" value="TanStack Query 5" />
        </div>
      </div>
    </main>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card text-card-foreground rounded-lg border p-4">
      <div className="text-muted-foreground text-xs uppercase tracking-wide">{label}</div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  )
}
