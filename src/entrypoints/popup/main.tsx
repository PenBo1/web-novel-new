import React from "react"
import ReactDOM from "react-dom/client"
import { Provider as JotaiProvider } from "jotai"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/providers/theme-provider"
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
