import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, currentPage } = await req.json()

  const pageContext = currentPage ? `\nالمستخدم يتصفح حالياً: ${currentPage}` : ''

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: `أنت مساعد Vision OS الذكي.
تساعد فريق شركة إنتاج إبداعية عراقية.
تجيب بالعربية دائماً.
تفهم: المشاريع، الفواتير، الموظفون، العملاء، التقارير، المحتوى.
ردودك مختصرة ومفيدة ومباشرة.${pageContext}`,
    messages,
    maxOutputTokens: 500,
  })

  return result.toUIMessageStreamResponse()
}
