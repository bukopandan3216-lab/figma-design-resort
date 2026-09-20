// ===== START CUT: components/sections/Navbar.jsx =====
function Navbar({ scrolled, onBook, onSignIn, onOpenProfile, onLogout, onReservations, reservationCount, user, toggleDark }) {
  const dark = useDark()
  const [dropOpen, setDropOpen] = useState(false)
  const links = ['Home', 'About', 'Catalogue', 'Contact']
  const incomingCount = reservationCount
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''

  const navBg = scrolled ? (dark ? '#0C1810' : 'white') : 'transparent'
  const navShadow = scrolled ? (dark ? '0 1px 16px rgba(0,0,0,0.4)' : '0 1px 16px rgba(0,0,0,0.08)') : 'none'
  const navLinkColor = scrolled ? (dark ? '#E8F0EA' : '#374151') : 'rgba(255,255,255,0.88)'
  const navHeadColor = scrolled ? (dark ? '#E8F0EA' : '#1a1a1a') : 'white'

  return (
    <nav className="sticky top-0 z-50 safe-top flex items-center transition-all duration-300" style={{ background: navBg, boxShadow: navShadow, minHeight: 58 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between h-[58px]">
        <div>
          <p className="text-[8px] sm:text-[9px] font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h2 className="text-sm sm:text-base font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: navHeadColor }}>Palawan Paraíso</h2>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <button key={l} onClick={() => scrollToSection(l.toLowerCase())} className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: navLinkColor }}>{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBook} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg" style={{ background: GREEN }}>Book Now</button>
          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(o => !o)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all hover:opacity-90" style={{ border: `1.5px solid ${scrolled ? GREEN + '60' : 'rgba(255,255,255,0.4)'}`, background: scrolled ? (dark ? '#1D2E22' : 'white') : 'rgba(255,255,255,0.12)' }}>
                <UserAvatar user={user} size={26} />
                <span className="hidden sm:inline text-xs font-semibold pr-1 max-w-[80px] truncate" style={{ color: navHeadColor }}>{user.firstName || user.username}</span>
                {incomingCount > 0 && <span className="text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0" style={{ width: 16, height: 16, background: GOLD }}>{incomingCount}</span>}
                <svg className={`w-3 h-3 transition-transform shrink-0 ${dropOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" style={{ color: scrolled ? '#6B7280' : 'rgba(255,255,255,0.7)' }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl shadow-2xl overflow-hidden" style={{ width: 230, background: dark ? '#162218' : 'white', border: `1px solid ${dark ? '#2A3E30' : '#E5E7EB'}` }}>
                    <div className="px-4 py-3.5 flex items-center gap-3" style={{ background: dark ? '#1D2E22' : CREAM }}>
                      <UserAvatar user={user} size={38} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: dark ? '#E8F0EA' : '#1B2E24' }}>{fullName || user.username}</p>
                        <p className="text-[10px] truncate" style={{ color: dark ? '#8BAB96' : '#6B7280' }}>{user.email || 'No email set'}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setDropOpen(false); onOpenProfile() }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-left transition-colors" style={{ color: dark ? '#E8F0EA' : '#374151' }} onMouseEnter={e => (e.currentTarget.style.background = dark ? '#1D2E22' : '#F9FAFB')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" style={{ color: dark ? '#8BAB96' : '#9CA3AF' }}><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M3 13c0-2.5 2.239-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                        My Profile
                      </button>
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" style={{ color: dark ? '#8BAB96' : '#9CA3AF' }}>
                            {dark
                              ? <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 0V1M8 14v1M1 8H0M16 8h-1M2.93 2.93l-.71-.71M13.78 13.78l-.71-.71M2.93 13.07l-.71.71M13.78 2.22l-.71.71" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                              : <path d="M13 8.5A5 5 0 016.5 3C4 3.5 2 5.8 2 8.5a6 6 0 0011.5 2.4A5 5 0 0113 8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            }
                          </svg>
                          <span className="text-xs font-medium" style={{ color: dark ? '#E8F0EA' : '#374151' }}>{dark ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <button onClick={toggleDark} className="relative shrink-0 rounded-full transition-all duration-300" style={{ width: 36, height: 20, background: dark ? GREEN : '#D1D5DB' }}>
                          <span className="absolute top-0.5 rounded-full bg-white shadow transition-all duration-300" style={{ width: 16, height: 16, left: dark ? 18 : 2 }} />
                        </button>
                      </div>
                      <div className="my-1 border-t" style={{ borderColor: dark ? '#2A3E30' : '#F3F4F6' }} />
                      <button onClick={() => { setDropOpen(false); onLogout() }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-left transition-colors" style={{ color: '#DC2626' }} onMouseEnter={e => (e.currentTarget.style.background = dark ? '#2A1818' : '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={onSignIn} className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all hover:opacity-80" style={{ border: `1.5px solid ${scrolled ? GREEN : 'rgba(255,255,255,0.65)'}`, color: scrolled ? GREEN : 'white', background: scrolled && dark ? '#0C1810' : 'transparent' }}>Sign In</button>
          )}
        </div>
      </div>
    </nav>
  )
}
