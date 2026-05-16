interface Props {
  message?: string | undefined
}

export function FieldError({ message }: Props) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-500">{message}</p>
}
