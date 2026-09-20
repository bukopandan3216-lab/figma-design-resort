// ===== START CUT: components/booking/GuestDetails.jsx =====
function S1GuestDetails({ g, setG, onNext }) {
  const { surface, text, text2 } = useTheme()
  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-2 space-y-3">
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: text }}>Guest Details</h2>
          <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Please provide the primary guest information for your reservation.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FLabel label="First Name" req><input className={ic} style={icStyle(surface, text)} placeholder="e.g. Maria" value={g.firstName} onChange={e => setG({ ...g, firstName: e.target.value })} /></FLabel>
          <FLabel label="Last Name" req><input className={ic} style={icStyle(surface, text)} placeholder="e.g. Santos" value={g.lastName} onChange={e => setG({ ...g, lastName: e.target.value })} /></FLabel>
        </div>
        <FLabel label="Email Address" req helper="We will send your booking confirmation here">
          <input className={ic} style={icStyle(surface, text)} type="email" placeholder="maria@gmail.com" value={g.email} onChange={e => setG({ ...g, email: e.target.value })} />
        </FLabel>
        <FLabel label="Phone Number" req>
          <input className={ic} style={icStyle(surface, text)} type="tel" placeholder="+63 9XX XXX XXXX" value={g.phone} onChange={e => setG({ ...g, phone: e.target.value })} />
        </FLabel>
        <FLabel label="Number of Guests" req>
          <div className="flex rounded-lg overflow-hidden text-sm" style={{ background: surface }}>
            <span className="flex-1 px-3 py-2" style={{ color: text }}>{g.pax}</span>
            <div className="flex flex-col border-l border-white/10">
              <button type="button" className="px-2.5 py-0.5 text-[11px] leading-snug hover:bg-black/10" style={{ color: text2 }} onClick={() => setG({ ...g, pax: Math.min(20, g.pax + 1) })}>▲</button>
              <button type="button" className="px-2.5 py-0.5 text-[11px] leading-snug hover:bg-black/10" style={{ color: text2 }} onClick={() => setG({ ...g, pax: Math.max(1, g.pax - 1) })}>▼</button>
            </div>
          </div>
        </FLabel>
      </div>
      <NavFooter step={1} total={5} onBack={() => {}} onNext={onNext} disableBack />
    </>
  )
}
