import { Route, Routes } from "react-router"
import { SidebarInset } from "@/components/ui/sidebar"
import { ROUTE_CONFIG } from "./app-sidebar/nav-items"

function App() {
  return (
    <SidebarInset>
      <Routes>
        {ROUTE_CONFIG.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </SidebarInset>
  )
}

export default App
