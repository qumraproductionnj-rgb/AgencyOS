'use client'

import { useParams } from 'next/navigation'
import { ContentPieceEditor } from '@/components/content-pieces/content-piece-editor'

export default function ContentPiecePage() {
  const params = useParams<{ id: string }>()

  return (
    <div className="min-h-screen">
      <ContentPieceEditor pieceId={params.id} />
    </div>
  )
}
