const OVERLAY_ID = "browser-dialog-overlay"

function createOverlay(message: string, withCancel: boolean) {
  const overlay = document.createElement("div")
  overlay.id = OVERLAY_ID
  overlay.style.position = "fixed"
  overlay.style.inset = "0"
  overlay.style.background = "rgba(0, 0, 0, 0.5)"
  overlay.style.display = "flex"
  overlay.style.alignItems = "center"
  overlay.style.justifyContent = "center"
  overlay.style.zIndex = "9999"

  const panel = document.createElement("div")
  panel.style.background = "#ffffff"
  panel.style.color = "#111827"
  panel.style.padding = "16px"
  panel.style.borderRadius = "8px"
  panel.style.minWidth = "240px"
  panel.style.maxWidth = "400px"
  panel.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)"

  const text = document.createElement("div")
  text.textContent = message
  text.style.fontSize = "14px"
  text.style.marginBottom = "12px"
  panel.appendChild(text)

  const actions = document.createElement("div")
  actions.style.display = "flex"
  actions.style.justifyContent = "flex-end"
  actions.style.gap = "8px"

  const confirmButton = document.createElement("button")
  confirmButton.type = "button"
  confirmButton.textContent = "确定"
  confirmButton.style.padding = "6px 12px"
  confirmButton.style.border = "1px solid #e5e7eb"
  confirmButton.style.borderRadius = "6px"
  confirmButton.style.background = "#111827"
  confirmButton.style.color = "#ffffff"

  actions.appendChild(confirmButton)

  let cancelButton: HTMLButtonElement | null = null
  if (withCancel) {
    cancelButton = document.createElement("button")
    cancelButton.type = "button"
    cancelButton.textContent = "取消"
    cancelButton.style.padding = "6px 12px"
    cancelButton.style.border = "1px solid #e5e7eb"
    cancelButton.style.borderRadius = "6px"
    cancelButton.style.background = "#ffffff"
    cancelButton.style.color = "#111827"
    actions.appendChild(cancelButton)
  }

  panel.appendChild(actions)
  overlay.appendChild(panel)
  return { overlay, confirmButton, cancelButton }
}

function removeExistingOverlay() {
  const existing = document.getElementById(OVERLAY_ID)
  if (existing) {
    existing.remove()
  }
}

export async function confirmAction(message: string): Promise<boolean> {
  removeExistingOverlay()

  return new Promise((resolve) => {
    const { overlay, confirmButton, cancelButton } = createOverlay(message, true)
    confirmButton.addEventListener("click", () => {
      overlay.remove()
      resolve(true)
    })
    cancelButton?.addEventListener("click", () => {
      overlay.remove()
      resolve(false)
    })
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        overlay.remove()
        resolve(false)
      }
    })
    document.body.appendChild(overlay)
  })
}

export function notifyAction(message: string): void {
  removeExistingOverlay()

  const { overlay, confirmButton } = createOverlay(message, false)
  confirmButton.addEventListener("click", () => {
    overlay.remove()
  })
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.remove()
    }
  })
  document.body.appendChild(overlay)
}
