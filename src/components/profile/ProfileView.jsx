// ===== START CUT: components/profile/ProfileView.jsx =====
function ProfileView({ user, bookings, completedIds, onMarkComplete, onCancel, onBack, onBook, toggleDark }) {
  const { card, surface, border, text, text2, text3, pageBg } = useTheme()
  const dark = useDark()
  const [tab, setTab] = useState('incoming')
  const [editMode, setEditMode] = useState(false)
  const [editUser, setEditUser] = useState({ ...user })
  const [receiptBooking, setReceiptBooking] = useState(null)

  const incoming = bookings.filter(b => !completedIds.includes(b.id))
  const completed = bookings.filter(b => completedIds.includes(b.id))
  const shown = tab === 'incoming' ? incoming : completed

  const catColors = { room: '#3B82F6', cottage: '#10B981', restaurant: '#F59E0B', venue: '#8B5CF6' }
  const catLabels = { room: 'Room', cottage: 'Cottage', restaurant: 'Restaurant', venue: 'Venue' }

  function getDateLabel(b) {
    if (b.category === 'room' || b.category === 'cottage') return b.checkIn ? `${fmtLong(b.checkIn)} → ${fmtLong(b.checkOut)}` : '—'
    return b.resDate ? fmtLong(b.resDate) : '—'
  }

  return (
    <>
    {receiptBooking && <ReceiptPopup booking={receiptBooking} onClose={() => setReceiptBooking(null)} />}
    <div className="h-screen flex flex-col safe-top safe-bottom" style={{ background: pageBg }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between shadow-sm" style={{ background: card, borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70" style={{ color: text2 }}><ChevL /> Back</button>
          <div className="w-px h-4" style={{ background: border }} />
          <div>
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Palawan Paraíso</p>
            <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: text }}>My Profile</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Settings / dark mode toggle */}
          <button onClick={toggleDark} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all hover:opacity-80" style={{ borderColor: border, color: text2, background: surface }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              {dark
                ? <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 0V1M8 14v1M1 8H0M16 8h-1M2.93 2.93l-.71-.71M13.78 13.78l-.71-.71M2.93 13.07l-.71.71M13.78 2.22l-.71.71" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                : <path d="M13 8.5A5 5 0 016.5 3C4 3.5 2 5.8 2 8.5a6 6 0 0011.5 2.4A5 5 0 0113 8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              }
            </svg>
            <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={onBook} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: GREEN }}>
            + New Booking
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

          {/* Profile Card */}
          <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${GREEN}, #2a6647)` }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
            </div>
            <div className="px-5 pb-5" style={{ position: 'relative' }}>
              <div className="flex items-end justify-between mb-4" style={{ marginTop: -36 }}>
                <div className="rounded-full shadow-lg relative z-10" style={{ background: `linear-gradient(135deg, ${GREEN}, #2a6647)`, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${card}` }}>
                  <span className="text-white font-bold text-2xl select-none">
                    {[user.firstName[0], user.lastName[0]].filter(Boolean).join('').toUpperCase() || '?'}
                  </span>
                </div>
                <button onClick={() => { setEditMode(e => !e); setEditUser({ ...user }) }} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors" style={{ borderColor: GREEN, color: GREEN }}>
                  {editMode ? 'Cancel' : <>
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                    Edit Profile
                  </>}
                </button>
              </div>
              {editMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1"><label className="text-[10px] font-medium" style={{ color: text2 }}>First Name</label><input className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={icStyle(surface, text)} value={editUser.firstName} onChange={e => setEditUser({ ...editUser, firstName: e.target.value })} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[10px] font-medium" style={{ color: text2 }}>Last Name</label><input className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={icStyle(surface, text)} value={editUser.lastName} onChange={e => setEditUser({ ...editUser, lastName: e.target.value })} /></div>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] font-medium" style={{ color: text2 }}>Email</label><input className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={icStyle(surface, text)} type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] font-medium" style={{ color: text2 }}>Phone</label><input className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={icStyle(surface, text)} value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} /></div>
                  <button className="px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: GREEN }} onClick={() => { Object.assign(user, editUser); setEditMode(false) }}>Save Changes</button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>{`${user.firstName} ${user.lastName}`.trim() || user.username}</h2>
                  <p className="text-xs mt-0.5" style={{ color: text3 }}>@{user.username}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      { icon: <IEnvelope />, label: 'Email', value: user.email || 'Not set' },
                      { icon: <IPhoneOutline />, label: 'Phone', value: user.phone || 'Not set' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: surface }}>
                        <span style={{ color: GREEN }} className="shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-medium" style={{ color: text3 }}>{item.label}</p>
                          <p className="text-xs font-semibold truncate" style={{ color: text }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookings table section */}
          <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
            {/* Tabs */}
            <div className="flex" style={{ borderBottom: `1px solid ${border}` }}>
              <button onClick={() => setTab('incoming')} className="flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors" style={{ color: tab === 'incoming' ? GREEN : text2, borderBottom: tab === 'incoming' ? `2px solid ${GREEN}` : '2px solid transparent' }}>
                <IBookmark />
                Incoming Reservations
                {incoming.length > 0 && <span className="text-white text-[9px] font-bold rounded-full flex items-center justify-center" style={{ width: 18, height: 18, background: GREEN }}>{incoming.length}</span>}
              </button>
              <button onClick={() => setTab('completed')} className="flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors" style={{ color: tab === 'completed' ? GREEN : text2, borderBottom: tab === 'completed' ? `2px solid ${GREEN}` : '2px solid transparent' }}>
                <Chk cls="w-4 h-4" />
                Completed
                {completed.length > 0 && <span className="text-[9px] font-bold rounded-full flex items-center justify-center" style={{ width: 18, height: 18, background: '#D1FAE5', color: '#059669' }}>{completed.length}</span>}
              </button>
            </div>

            {shown.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 52, height: 52, background: surface }}>
                  {tab === 'incoming' ? <IBookmark /> : <Chk cls="w-6 h-6" />}
                </div>
                <p className="text-sm font-semibold" style={{ color: text }}>{tab === 'incoming' ? 'No Incoming Reservations' : 'No Completed Reservations'}</p>
                <p className="text-xs mt-1" style={{ color: text3 }}>{tab === 'incoming' ? 'Your confirmed bookings will appear here.' : 'Reservations marked as complete will show here.'}</p>
                {tab === 'incoming' && <button onClick={onBook} className="mt-4 px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: GREEN }}>Make a Booking</button>}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {shown.map(b => {
                  const itemName = getItemName(b.category, b.itemId)
                  return (
                    <div key={b.id} className="rounded-xl cursor-pointer transition-all hover:shadow-md" style={{ background: surface, border: `1px solid ${border}` }} onClick={() => setReceiptBooking(b)}>
                      <div className="px-4 py-3 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: catColors[b.category] }}>{catLabels[b.category]}</span>
                            {tab === 'incoming'
                              ? <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>Confirmed</span>
                              : <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F3F4F6', color: '#6B7280' }}>Completed</span>
                            }
                            <span className="text-[9px] font-mono" style={{ color: text3 }}>#{b.id.toUpperCase()}</span>
                          </div>
                          <p className="text-sm font-semibold truncate" style={{ color: text }}>{itemName}</p>
                          <p className="text-xs mt-0.5" style={{ color: text2 }}>{getDateLabel(b)} · {b.g.pax} pax</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold" style={{ color: GREEN }}>{peso(b.total)}</p>
                          <p className="text-[9px]" style={{ color: text3 }}>Fee: {peso(b.fee)}</p>
                        </div>
                      </div>
                      {tab === 'incoming' && (
                        <div className="flex gap-2 px-4 pb-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => onCancel(b.id)} className="flex-1 py-1.5 rounded-full text-[10px] font-semibold border transition-colors" style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                            Cancel
                          </button>
                          <button onClick={() => onMarkComplete(b.id)} className="flex-1 py-1.5 rounded-full text-[10px] font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1" style={{ background: GREEN }}>
                            <Chk cls="w-2.5 h-2.5" /> Complete
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
    </>
  )
}

// ─── Website ──────────────────────────────────────────────────────────────────
function Website({ onReserve, onBook, onSignIn, onReservations, onOpenProfile, onLogout, reservationCount, user, toggleDark }) {
  const [scrolled, setScrolled] = useState(false)
  return (
    <div className="h-screen overflow-y-auto safe-bottom" onScroll={e => setScrolled(e.currentTarget.scrollTop > 60)}>
      <Navbar scrolled={scrolled} onBook={onBook} onSignIn={onSignIn} onOpenProfile={onOpenProfile} onLogout={onLogout} onReservations={onReservations} reservationCount={reservationCount} user={user} toggleDark={toggleDark} />
      <HeroSection onBook={onBook} />
      <AboutSection />
      <CatalogueSection onReserve={onReserve} />
      <ContactSection />
      <Footer onBook={onBook} />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('website')
  const [bookingCategory, setBookingCategory] = useState('room')
  const [bookingItemId, setBookingItemId] = useState('premium')
  const [bookings, setBookings] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [user, setUser] = useState(null)
  const [dark, setDark] = useState(false)

  function toggleDark() {
    setDark(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  function openBooking(category, itemId) {
    setBookingCategory(category)
    setBookingItemId(itemId)
    setView('booking')
  }

  function handleBookingComplete(record) {
    setBookings(prev => [...prev, record])
  }

  function handleLogin(u) {
    setUser(u)
    if (view !== 'booking') setView('website')
  }

  function handleLogout() {
    setUser(null)
    setView('website')
  }

  function markComplete(id) {
    setCompletedIds(prev => [...prev, id])
  }

  function cancelBooking(id) {
    setBookings(prev => prev.filter(b => b.id !== id))
    setCompletedIds(prev => prev.filter(cid => cid !== id))
  }

  const incomingCount = bookings.filter(b => !completedIds.includes(b.id)).length

  let content

  if (view === 'login') {
    content = <LoginView onBack={() => setView('website')} onSuccess={handleLogin} />
  } else if (view === 'reservations') {
    if (!user) {
      content = <LoginView onBack={() => setView('website')} onSuccess={u => { handleLogin(u) }} />
    } else {
      content = <ReservationsView bookings={bookings.filter(b => b.userId === (user.username ?? user.email))} onBack={() => setView('profile')} />
    }
  } else if (view === 'profile') {
    if (!user) {
      content = <LoginView onBack={() => setView('website')} onSuccess={u => { handleLogin(u) }} />
    } else {
      content = (
        <ProfileView
          user={user}
          bookings={bookings.filter(b => b.userId === (user.username ?? user.email))}
          completedIds={completedIds}
          onMarkComplete={markComplete}
          onCancel={cancelBooking}
          onBack={() => setView('website')}
          onBook={() => openBooking('room', 'premium')}
          toggleDark={toggleDark}
        />
      )
    }
  } else if (view === 'booking') {
    content = (
      <BookingView
        initialCategory={bookingCategory}
        initialItemId={bookingItemId}
        onBackToHome={() => setView('website')}
        onBookingComplete={handleBookingComplete}
        onViewReservations={() => setView(user ? 'profile' : 'reservations')}
        user={user}
        onLoginSuccess={handleLogin}
      />
    )
  } else {
    content = (
      <Website
        onReserve={(category, id) => openBooking(category, id)}
        onBook={() => openBooking('room', 'premium')}
        onSignIn={() => setView('login')}
        onReservations={() => user ? setView('profile') : setView('reservations')}
        onOpenProfile={() => setView('profile')}
        onLogout={handleLogout}
        reservationCount={incomingCount}
        user={user}
        toggleDark={toggleDark}
      />
    )
  }

  return (
    <DarkCtx.Provider value={dark}>
      {content}
    </DarkCtx.Provider>
  )
}
