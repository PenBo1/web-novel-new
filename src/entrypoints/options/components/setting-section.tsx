import { cn } from "@/lib/utils"

interface SettingSectionProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SettingSection({
  icon,
  title,
  description,
  children,
  className,
}: SettingSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-start gap-3 mb-4">
        {icon && <div className="text-primary flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-2 pl-0 sm:pl-7">{children}</div>
    </section>
  )
}
