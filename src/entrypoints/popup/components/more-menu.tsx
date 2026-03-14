import { i18n } from "#imports"
import { Icon } from "@iconify/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

export function MoreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          <Icon icon="tabler:dots" className="size-4" strokeWidth={1.6} />
          <span className="text-[13px] font-medium">{i18n.t("popup.more.title")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-fit">
        <DropdownMenuItem
          onClick={() => window.open("https://discord.gg/ej45e3PezJ", "_blank", "noopener,noreferrer")}
          className="cursor-pointer"
        >
          <Icon icon="logos:discord-icon" className="size-4" />
          {i18n.t("popup.more.joinDiscord")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open("https://github.com/mengxi-ream/read-frog", "_blank", "noopener,noreferrer")}
          className="cursor-pointer"
        >
          <Icon icon="fa7-brands:github" className="size-4" />
          {i18n.t("popup.more.starGithub")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open("https://readfrog.app/tutorial/", "_blank", "noopener,noreferrer")}
          className="cursor-pointer"
        >
          <Icon icon="tabler:help-circle" className="size-4" />
          {i18n.t("popup.more.tutorial")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
