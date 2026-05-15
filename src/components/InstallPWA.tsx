import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const InstallPWA = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setPromptEvent(null)
  }

  if (!promptEvent || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: '#1E1B4B', borderTop: '0.5px solid #312E81',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <Logo />
      <span style={{ flex: 1, fontSize: 13, color: '#E0E7FF' }}>
        Instale o GameQuiz no seu dispositivo!
      </span>
      <button
        onClick={handleInstall}
        className="gq-btn-amber"
        style={{ padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
      >
        Instalar
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '4px' }}
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  )
}
