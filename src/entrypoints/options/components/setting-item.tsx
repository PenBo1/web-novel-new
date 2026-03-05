import { cn } from "@/lib/utils"

interface SettingItemProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SettingItem({
  icon,
  title,
  description,
  children,
  className,
}: SettingItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {icon && <div className="text-muted-foreground flex-shrink-0">{icon}</div>}
          <h3 className="font-medium text-sm leading-tight">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}
