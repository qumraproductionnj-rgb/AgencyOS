import { ExhibitionDetail } from '@/components/exhibitions/exhibition-detail'

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ExhibitionDetail id={id} />
}
