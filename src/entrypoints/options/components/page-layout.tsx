import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface PageLayoutProps {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function PageLayout({
  title,
  children,
  className,
  innerClassName,
}: PageLayoutProps) {
  return (
    <div className={cn("w-full pb-8", className)}>
      <div className="border-b">
        <div className="flex h-14 -ml-1.5 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1.5 h-4" />
          <h1>{title}</h1>
        </div>
      </div>
      <div className={cn("px-4 py-6", innerClassName)}>
        {children}
      </div>
    </div>
  )
}
