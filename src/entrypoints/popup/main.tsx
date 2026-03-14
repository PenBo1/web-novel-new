import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider as JotaiProvider } from "jotai"
import * as React from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider } from "@/shared/components/providers/theme-provider"
import App from "./app.tsx"
import "@/assets/styles/theme.css"

const queryClient = new QueryClient()

/**
 * Popup 程序入口
 * 包裹了必要的全局 Provider (React Query, Jotai, Theme)
 */
async function initApp() {
  const root = document.getElementById("root")!
  root.className = "text-base antialiased w-[320px] bg-background"

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

void initApp()
