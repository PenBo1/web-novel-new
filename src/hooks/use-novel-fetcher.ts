import { useQuery } from "@tanstack/react-query"
import { sendMessage } from "@/utils/message"
import { ParserProvider } from "@/utils/parser/provider"

/**
 * 获取小说元数据和目录的 Hook
 * 结合了 TanStack Query 的缓存处理和 ParserProvider 的路由逻辑
 */
export function useNovelFetcher(url: string) {
    return useQuery({
        queryKey: ["novel-info", url],
        queryFn: async () => {
            // 1. 获取小说基本元数据 (通过 Background 抓取以避免 CORS)
            const metadata = await sendMessage("fetchNovelMetadata", { url })

            // 2. 获取小说目录 (Catalog)
            const catalog = await sendMessage("fetchNovelCatalog", {
                source: metadata.source,
                id: metadata.id,
                catalogUrl: metadata.catalogUrl
            })

            return {
                ...metadata,
                volumes: catalog
            }
        },
        // 只有当 URL 存在且格式正确时才触发请求
        enabled: !!url && ParserProvider.getSource(url) !== null,
        staleTime: 1000 * 60 * 30, // 30 分钟缓存
    })
}
