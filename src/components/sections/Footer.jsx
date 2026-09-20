// ===== START CUT: components/sections/Footer.jsx =====
function Footer({ onBook }) {
  const links = [
    { group: 'Navigate', items: ['Home', 'About', 'Catalogue', 'Contact'] },
    { group: 'Services', items: ['Room Booking', 'Restaurant', 'Venue', 'Cottages', 'Spa & Wellness'] },
    { group: 'Policies', items: ['Privacy Policy', 'Terms of Service', 'Cancellation', 'FAQ'] },
  ]
  return (
    <footer style={{ background: DARK }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <p className="text-[9px] font-medium tracking-[0.2em] uppercase mb-1" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
            <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h3>
            <p className="text-white/50 text-xs leading-relaxed mb-5">Your sanctuary in the heart of paradise. Rooms, cottages, restaurant, venues, and island experiences — all in one place.</p>
            <div className="flex gap-3">{[<IInstagram />, <IFacebook />, <ITwitter />].map((icon, i) => <button key={i} className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">{icon}</button>)}</div>
          </div>
          {links.map(({ group, items }) => (
            <div key={group}>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">{group}</p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}><button onClick={() => item === 'Room Booking' ? onBook() : scrollToSection(item.toLowerCase())} className="text-white/50 hover:text-white/90 text-xs transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© 2026 Palawan Paraíso Resort &amp; Spa. All rights reserved.</p>
          <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <IStar key={i} />)}<span className="text-white/50 text-xs ml-2">5-Star Luxury Resort</span></div>
        </div>
      </div>
    </footer>
  )
}

// ─── Profile View ─────────────────────────────────────────────────────────────
function ReceiptPopup({ booking, onClose }) {
  const { card, surface, border, text, text2, text3 } = useTheme()
  const catLabels = { room: 'Room', cottage: 'Cottage', restaurant: 'Restaurant', venue: 'Venue' }
  const mLabel = PAY_OPTS.find(p => p.id === booking.method)?.label ?? ''
  const itemName = getItemName(booking.category, booking.itemId)
  const meal = RESTAURANT_MEALS.find(m => m.id === booking.itemId)
  const isWhole = booking.resType === 'Whole Restaurant'

  function Row({ l, v }) {
    return (
      <div className="flex justify-between text-xs py-1" style={{ borderBottom: `1px solid ${border}` }}>
        <span style={{ color: text2 }}>{l}</span>
        <span className="font-medium text-right ml-4" style={{ color: text, maxWidth: '60%' }}>{v}</span>
      </div>
    )
  }

  // Simple barcode-like SVG
  function Barcode() {
    const widths = [3,1,2,1,3,2,1,1,2,3,1,2,1,2,3,1,1,2,3,1,2,1,3,2,1,1,3,2,1,2]
    let x = 0
    return (
      <svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none">
        {widths.map((w, i) => {
          const bar = <rect key={i} x={x} y={0} width={w * 1.8} height={48} fill={i % 2 === 0 ? text : 'transparent'} />
          x += w * 1.8 + 1.5
          return bar
        })}
      </svg>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between text-white" style={{ background: GREEN }}>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-75">Booking Receipt</p>
            <p className="text-sm font-bold">Palawan Paraíso</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        {/* Barcode area */}
        <div className="px-5 py-4 text-center" style={{ background: surface }}>
          <div className="mb-2 mx-auto" style={{ maxWidth: 200 }}><Barcode /></div>
          <p className="text-[11px] font-mono font-bold tracking-widest" style={{ color: text2 }}>#{booking.id.toUpperCase()}</p>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
          <Row l="Guest" v={`${booking.g.firstName} ${booking.g.lastName}`.trim()} />
          <Row l="Email" v={booking.g.email} />
          <Row l="Phone" v={booking.g.phone || '—'} />
          <Row l="Category" v={catLabels[booking.category]} />
          <Row l={booking.category === 'restaurant' ? 'Meal' : booking.category === 'venue' ? 'Venue' : 'Accommodation'} v={itemName} />
          {(booking.category === 'room' || booking.category === 'cottage') && <>
            <Row l="Check-in" v={fmtLong(booking.checkIn)} />
            <Row l="Check-out" v={fmtLong(booking.checkOut)} />
            <Row l="Nights" v={`${booking.nights}`} />
          </>}
          {booking.category === 'restaurant' && <>
            <Row l="Time" v={meal?.time ?? ''} />
            <Row l="Type" v={booking.resType} />
            <Row l="Date" v={fmtLong(booking.resDate)} />
            <Row l="Guests" v={isWhole ? `${meal?.capacity} (whole)` : `${booking.g.pax} pax`} />
          </>}
          {booking.category === 'venue' && <>
            <Row l="Event" v={booking.eventType} />
            <Row l="Date" v={fmtLong(booking.resDate)} />
            <Row l="Time" v={booking.startTime && booking.endTime ? `${booking.startTime} – ${booking.endTime}` : '—'} />
          </>}
          {booking.specialRequests && <Row l="Requests" v={booking.specialRequests} />}
          <Row l="Payment Method" v={mLabel} />
          <Row l="Payment Status" v={
            (booking.payPlan ?? 'downpayment') === 'full' ? 'Fully Paid' :
            booking.downpayOption === 'on-arrival' ? 'Pay in Arrival' : 'Follow-up Payment'
          } />
          {booking.unitLabel && <Row l="Unit" v={booking.unitLabel} />}
          <Row l="Pax" v={`${booking.g.pax}`} />
        </div>

        {/* Footer totals */}
        <div className="px-5 pb-5 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${border}`, background: surface }}>
          <div className="flex justify-between text-xs"><span style={{ color: text2 }}>{(booking.payPlan ?? 'downpayment') === 'full' ? 'Total Paid' : 'Downpayment (30%)'}</span><span style={{ color: text }}>{peso(booking.fee)}</span></div>
          {(booking.payPlan ?? 'downpayment') !== 'full' && <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Balance on Arrival</span><span style={{ color: text }}>{peso(booking.balance)}</span></div>}
          <div className="flex justify-between text-sm font-bold pt-1.5" style={{ borderTop: `1px solid ${border}` }}>
            <span style={{ color: text }}>Total</span>
            <span style={{ color: GREEN }}>{peso(booking.total)}</span>
          </div>
          <p className="text-[9px] text-center mt-2" style={{ color: text3 }}>Booked {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )
}