import { defineExtensionMessaging } from "@webext-core/messaging"

/**
 * 跨进程消息通信协议定义
 * 这里强制约束了 Background、Content Script 和 Popup 之间的通信接口
 */
interface ProtocolMap {
    // 导航相关
    openOptionsPage: () => void

    // 小说逻辑相关
    fetchNovelMetadata: (data: { url: string }) => Promise<{
        id: string;
        title: string;
        author: string;
        cover?: string;
        catalogUrl?: string;
        source: string;
    }>
    fetchNovelCatalog: (data: { source: string; id: string; catalogUrl?: string }) => Promise<any[]>
    startDownload: (data: { novelId: string; source: string; chapters: { title: string; url: string }[] }) => void

    // 爬站规则相关
    fetchHtml: (data: { url: string; method?: "get" | "post"; data?: any; headers?: Record<string, string> }) => Promise<string>

    // 设置/配置相关
    getAppConfig: () => Promise<any>
}

// 导出强类型的消息发送和监听函数
export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
