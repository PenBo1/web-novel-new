import type { ExtensionProtocolMap } from "@/shared/contracts/messages"
import { defineExtensionMessaging } from "@webext-core/messaging"

export const { sendMessage, onMessage } = defineExtensionMessaging<ExtensionProtocolMap>()
