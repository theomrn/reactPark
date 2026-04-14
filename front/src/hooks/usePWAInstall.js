import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed'

function isAndroid() {
  return /android/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

export function usePWAInstall() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  )
  const [installed, setInstalled] = useState(isInStandaloneMode)

  useEffect(() => {
    if (isInStandaloneMode()) return

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
    setPrompt(null)
  }

  const canInstall = !installed && !dismissed && !!prompt
  // Fallback Android : pas de prompt natif mais on peut guider l'utilisateur
  const showManual = !installed && !dismissed && !prompt && isAndroid()

  return { canInstall, showManual, install, dismiss }
}
