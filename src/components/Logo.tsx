export const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 36, height: 36, background: '#4F46E5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
        <path d="M7 13 C5 13 3 15 3 17 C3 20 5 23 8 23 L10 23 L12 20 L22 20 L24 23 L26 23 C29 23 31 20 31 17 C31 15 29 13 27 13 Z" fill="#E0E7FF"/>
        <rect x="8" y="15.5" width="6" height="2" rx="1" fill="#4F46E5"/>
        <rect x="10" y="13.5" width="2" height="6" rx="1" fill="#4F46E5"/>
        <circle cx="23" cy="15" r="1.5" fill="#F59E0B"/>
        <circle cx="26" cy="17" r="1.5" fill="#6366F1"/>
        <circle cx="23" cy="19" r="1.5" fill="#34D399"/>
        <circle cx="20" cy="17" r="1.5" fill="#F87171"/>
        <rect x="15.5" y="16" width="3" height="1.5" rx="0.75" fill="#A5B4FC"/>
      </svg>
    </div>
    <span style={{ fontSize: 20, fontWeight: 600 }}>
      <span style={{ color: '#E0E7FF' }}>Game</span>
      <span style={{ color: '#F59E0B' }}>Quiz</span>
    </span>
  </div>
)
