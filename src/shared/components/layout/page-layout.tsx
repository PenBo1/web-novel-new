import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { cn } from "@/shared/utils/cn"

interface PageLayoutProps {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function PageLayout({
  title,
  description,
  action,
  children,
  className,
  innerClassName,
}: PageLayoutProps) {
  return (
    <div className={cn("w-full h-full flex flex-col overflow-hidden", className)}>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1.5 h-4" />
            <div className="min-w-0">
              <h1 className="font-semibold text-lg">{title}</h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">
              {action}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className={cn("px-4 py-6", innerClassName)}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
