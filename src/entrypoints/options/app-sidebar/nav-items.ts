import { BookshelfPage } from "../pages/bookshelf"
import { SearchPage } from "../pages/search"
import { DownloadPage } from "../pages/download"
import { RulesPage } from "../pages/rules"
import { GeneralPage } from "../pages/general"

export const ROUTE_CONFIG = [
    { path: "/", component: BookshelfPage },
    { path: "/search", component: SearchPage },
    { path: "/downloads", component: DownloadPage },
    { path: "/rules", component: RulesPage },
    { path: "/settings/general", component: GeneralPage },
] as const
