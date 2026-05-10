import { FileList } from '@/components/files/file-list'

interface Props {
  searchParams: Promise<{ entityType?: string; entityId?: string }>
}

export default async function FilesPage({ searchParams }: Props) {
  const { entityType, entityId } = await searchParams

  if (!entityType || !entityId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Select a project or task to view its files.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Files</h1>
      <FileList entityType={entityType} entityId={entityId} />
    </div>
  )
}
