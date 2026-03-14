interface ConfigCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function ConfigCard({
  title,
  description,
  children,
}: ConfigCardProps) {
  return (
    <div className="py-4 px-0">
      <div className="mb-4">
        <h3 className="font-semibold text-base">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
