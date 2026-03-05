import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "zh_CN",
    permissions: ["storage", "tabs", "notifications", "contextMenus", "scripting"],
    host_permissions: ["*://*/*"],
  },
  alias: {
    "@": "src",
  },
  vite: () => ({
    server: {
      watch: {
        ignored: ["**/demo/**"],
      },
    },
    optimizeDeps: {
      entries: ["src/entrypoints/**/*.html"],
    },
  }),
})
