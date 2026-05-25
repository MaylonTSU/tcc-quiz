import { Link } from 'react-router-dom'

export const NotFound = () => (
  <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 24 }}>
        GAMEQUIZ
      </p>
      <p style={{ fontSize: 96, fontWeight: 800, color: '#4F46E5', lineHeight: 1, margin: 0 }}>404</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E0E7FF', marginTop: 16 }}>
        Página não encontrada
      </h1>
      <p style={{ fontSize: 14, color: '#6366F1', marginTop: 8 }}>
        Esta página não existe ou foi removida.
      </p>
      <Link
        to="/"
        className="gq-btn-primary"
        style={{ display: 'inline-block', marginTop: 32 }}
      >
        Voltar ao início
      </Link>
    </div>
  </main>
)
