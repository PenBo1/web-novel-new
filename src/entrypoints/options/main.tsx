import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter } from "react-router"
import { Provider as JotaiProvider } from "jotai"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./app.tsx"
import { AppSidebar } from "./app-sidebar"
import "@/assets/styles/theme.css"
import "./style.css"

const queryClient = new QueryClient()

const root = document.getElementById("root")!
root.className = "antialiased bg-background"

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <SidebarProvider>
            <ThemeProvider>
              <TooltipProvider>
                <AppSidebar />
                <App />
              </TooltipProvider>
            </ThemeProvider>
          </SidebarProvider>
        </HashRouter>
      </QueryClientProvider>
    </JotaiProvider>
  </React.StrictMode>,
)
