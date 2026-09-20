// ===== START CUT: components/booking/Payment.jsx =====
function S4Payment({ method, setMethod, phone, setPhone, total, payPlan, setPayPlan, downpayOption, setDownpayOption, onBack, onNext }: {
  method: PayMethod; setMethod: (m: PayMethod) => void
  phone: string; setPhone: (v: string) => void
  total: number
  payPlan: PayPlan; setPayPlan: (p: PayPlan) => void
  downpayOption: DownpayOption | null; setDownpayOption: (o: DownpayOption | null) => void
  onBack: () => void; onNext: () => void
}) {
  const fee = payPlan === 'full' ? total : Math.round(total * 0.3)
  const bal = total - fee
  const needPhone = method === 'gcash' || method === 'maya'
  const IconMap: Record<string, typeof ICard> = { card: ICard, phone: IPhone, cash: ICash }
  const { surface, card, text, text2, border } = useTheme()

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-2 space-y-2.5">
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: text }}>Payment Method</h2>
          <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Choose your payment plan and method.</p>
        </div>
        {/* Payment Plan */}
        <div className="rounded-xl p-3.5 space-y-2" style={{ background: surface }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: text2 }}>Payment Plan</p>
          <div className="flex gap-2">
            <button onClick={() => setPayPlan('downpayment')} className="flex-1 py-2 rounded-lg text-xs font-medium transition-all" style={{ border: `2px solid ${payPlan === 'downpayment' ? GREEN : border}`, background: payPlan === 'downpayment' ? `${GREEN}14` : card, color: payPlan === 'downpayment' ? GREEN : text2 }}>Downpayment (30%)</button>
            <button onClick={() => setPayPlan('full')} className="flex-1 py-2 rounded-lg text-xs font-medium transition-all" style={{ border: `2px solid ${payPlan === 'full' ? GREEN : border}`, background: payPlan === 'full' ? `${GREEN}14` : card, color: payPlan === 'full' ? GREEN : text2 }}>Pay in Full</button>
          </div>
          {payPlan === 'downpayment' && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-medium" style={{ color: text2 }}>How will you settle the remaining balance?</p>
              <div className="flex gap-2">
                <button onClick={() => setDownpayOption('on-arrival')} className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all" style={{ border: `1.5px solid ${downpayOption === 'on-arrival' ? GREEN : border}`, background: downpayOption === 'on-arrival' ? `${GREEN}14` : card, color: downpayOption === 'on-arrival' ? GREEN : text2 }}>Pay on Arrival</button>
                <button onClick={() => setDownpayOption('follow-up')} className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all" style={{ border: `1.5px solid ${downpayOption === 'follow-up' ? GREEN : border}`, background: downpayOption === 'follow-up' ? `${GREEN}14` : card, color: downpayOption === 'follow-up' ? GREEN : text2 }}>Follow-up Payment</button>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          {PAY_OPTS.map(opt => {
            const sel = method === opt.id
            const Icon = IconMap[opt.icon]
            return (
              <div key={opt.id} onClick={() => setMethod(opt.id)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{ border: `2px solid ${sel ? GREEN : border}`, background: sel ? `${GREEN}14` : card, boxShadow: sel ? `0 1px 8px ${GREEN}22` : 'none' }}>
                <Icon active={sel} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: text }}>{opt.label}</p>
                  <p className="text-[10px]" style={{ color: text2 }}>{opt.sub}</p>
                </div>
                {sel && <div className="text-white rounded-full flex items-center justify-center shrink-0" style={{ width: 18, height: 18, background: GREEN }}><Chk cls="w-2.5 h-2.5" /></div>}
              </div>
            )
          })}
        </div>
        {needPhone && (
          <FLabel label="Registered Mobile Number" req helper="A payment gateway will appear after clicking Continue.">
            <input className={ic} style={icStyle(surface, text)} placeholder="09XXXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} maxLength={11} />
          </FLabel>
        )}
        {total > 0 && (
          <div className="rounded-xl p-3.5 space-y-1.5" style={{ background: surface }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: text2 }}>Payment Summary</p>
            <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Total Amount</span><span className="font-medium" style={{ color: text }}>{peso(total)}</span></div>
            {payPlan === 'full' ? (
              <div className="flex justify-between text-xs border-t pt-1.5" style={{ borderColor: border }}>
                <span className="font-semibold" style={{ color: text2 }}>Paying Now</span>
                <span className="font-bold" style={{ color: text }}>{peso(total)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Downpayment (30%)</span><span className="font-medium" style={{ color: text }}>{peso(fee)}</span></div>
                <div className="flex justify-between text-xs border-t pt-1.5" style={{ borderColor: border }}>
                  <span className="font-semibold" style={{ color: text2 }}>Remaining Balance</span>
                  <span className="font-bold" style={{ color: text }}>{bal > 0 ? peso(bal) : '—'}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <NavFooter step={4} total={5} onBack={onBack} onNext={onNext} />
    </>
  )
}

// ─── Step 5: Confirm ──────────────────────────────────────────────────────────
function S5Confirm({ category, itemId, g, details, method, total, payPlan, downpayOption, onBack, onNext }: {
  category: AccomTab; itemId: string; g: Guest
  details: DetailsState; method: PayMethod; total: number
  payPlan: PayPlan; downpayOption: DownpayOption | null
  onBack: () => void; onNext: () => void
}) {
  const fee = payPlan === 'full' ? total : Math.round(total * 0.3)
  const bal = total - fee
  const mLabel = PAY_OPTS.find(p => p.id === method)?.label ?? ''
  const itemName = getItemName(category, itemId)
  const nights = calcNights(details.checkIn, details.checkOut)
  const isWhole = details.resType === 'Whole Restaurant'
  const meal = RESTAURANT_MEALS.find(m => m.id === itemId)
  const venue = VENUES.find(v => v.id === itemId)

  const { surface, text, text2, border } = useTheme()

  function Row({ l, v }: { l: string; v: string }) {
    return (
      <div className="flex justify-between text-xs py-0.5">
        <span style={{ color: text2 }}>{l}</span>
        <span className="font-medium text-right" style={{ color: text, maxWidth: '58%' }}>{v}</span>
      </div>
    )
  }
  function Sec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="rounded-xl p-3 space-y-0.5" style={{ background: surface }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: text2 }}>{title}</p>
        {children}
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-2 space-y-2.5">
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: text }}>Review &amp; Confirm</h2>
          <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Review all details before confirming.</p>
        </div>
        <Sec title="Guest">
          <Row l="Name" v={`${g.firstName} ${g.lastName}`.trim() || '—'} />
          <Row l="Email" v={g.email || '—'} />
          <Row l="Phone" v={g.phone || '—'} />
          <Row l="Guests" v={`${g.pax} pax`} />
        </Sec>
        <Sec title="Booking">
          <Row l="Category" v={category.charAt(0).toUpperCase() + category.slice(1)} />
          <Row l={category === 'restaurant' ? 'Meal' : category === 'venue' ? 'Venue' : category === 'room' ? 'Room' : 'Cottage'} v={itemName} />
          {details.unitLabel && <Row l="Unit" v={details.unitLabel} />}
          {(category === 'room' || category === 'cottage') && <>
            <Row l="Check-in" v={fmtLong(details.checkIn)} />
            <Row l="Check-out" v={fmtLong(details.checkOut)} />
            <Row l="Nights" v={nights ? `${nights}` : '—'} />
          </>}
          {category === 'restaurant' && <>
            <Row l="Meal Time" v={meal?.time ?? ''} />
            <Row l="Type" v={details.resType} />
            <Row l="Date" v={fmtLong(details.resDate)} />
            <Row l="Guests" v={isWhole ? `${meal?.capacity} (whole)` : `${g.pax} pax`} />
            <Row l="Tables" v={`${details.tables}`} />
          </>}
          {category === 'venue' && <>
            <Row l="Event Type" v={details.eventType} />
            <Row l="Date" v={fmtLong(details.resDate)} />
            <Row l="Time" v={details.startTime && details.endTime ? `${details.startTime} – ${details.endTime}` : '—'} />
            <Row l="Guests" v={`${g.pax} pax`} />
            {(details.addOns.catering || details.addOns.rooms || details.addOns.cottages) && (
              <Row l="Add-ons" v={[details.addOns.catering && 'Catering', details.addOns.rooms && 'Rooms', details.addOns.cottages && 'Cottages'].filter(Boolean).join(', ')} />
            )}
          </>}
          {details.specialRequests && <Row l="Requests" v={details.specialRequests} />}
        </Sec>
        <Sec title="Payment">
          <Row l="Method" v={mLabel} />
          <Row l="Plan" v={payPlan === 'full' ? 'Pay in Full' : 'Downpayment'} />
          {payPlan === 'downpayment' && downpayOption && <Row l="Arrangement" v={downpayOption === 'on-arrival' ? 'Pay on Arrival' : 'Follow-up Payment'} />}
          <Row l={payPlan === 'full' ? 'Paying Now' : 'Downpayment (30%)'} v={peso(fee)} />
          <Row l="Balance" v={payPlan === 'full' ? '—' : (bal > 0 ? peso(bal) : '—')} />
        </Sec>
        <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: `${GREEN}12`, border: `1.5px solid ${GREEN}38` }}>
          <span className="text-sm font-semibold text-gray-700">Total Amount</span>
          <span className="text-xl font-bold" style={{ color: GREEN }}>{total ? peso(total) : '—'}</span>
        </div>
      </div>
      <NavFooter step={5} total={5} onBack={onBack} onNext={onNext} nextLabel="Confirm &amp; Pay" />
    </>
  )
}

// ─── Step 6: Success / Receipt ────────────────────────────────────────────────
function S6Receipt({ booking, onHome, onViewReservations }: {
  booking: BookingRecord; onHome: () => void; onViewReservations: () => void
}) {
  const mLabel = PAY_OPTS.find(p => p.id === booking.method)?.label ?? ''
  const itemName = getItemName(booking.category, booking.itemId)
  const isWhole = booking.resType === 'Whole Restaurant'
  const meal = RESTAURANT_MEALS.find(m => m.id === booking.itemId)
  const { surface, text, text2, border } = useTheme()

  function Row({ l, v }: { l: string; v: string }) {
    return (
      <div className="flex justify-between text-xs py-0.5">
        <span style={{ color: text2 }}>{l}</span>
        <span className="font-medium text-right" style={{ color: text, maxWidth: '55%' }}>{v}</span>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6 pb-5 flex flex-col gap-4">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="text-white rounded-full flex items-center justify-center shadow-lg" style={{ width: 60, height: 60, background: GREEN }}>
          <Chk cls="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: text }}>Reservation Confirmed!</h2>
        <p className="text-[11px] leading-relaxed max-w-xs" style={{ color: text2 }}>
          Your booking at Palawan Paraíso has been submitted. Confirmation sent to{' '}
          <span className="font-semibold" style={{ color: text }}>{booking.g.email || 'your email'}</span>
        </p>
      </div>

      {/* Receipt card */}
      <div className="w-full rounded-xl overflow-hidden" style={{ border: `1.5px solid ${GREEN}30` }}>
        <div className="px-4 py-3 text-white flex items-center justify-between" style={{ background: GREEN }}>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-80">Booking Receipt</p>
            <p className="text-sm font-bold">Palawan Paraíso Resort &amp; Spa</p>
          </div>
          <p className="text-[10px] opacity-70">#{booking.id.toUpperCase()}</p>
        </div>
        <div className="px-4 py-3 space-y-0.5" style={{ background: surface }}>
          <Row l="Guest" v={`${booking.g.firstName} ${booking.g.lastName}`.trim()} />
          <Row l="Category" v={booking.category.charAt(0).toUpperCase() + booking.category.slice(1)} />
          <Row l={booking.category === 'restaurant' ? 'Meal' : booking.category === 'venue' ? 'Venue' : booking.category === 'room' ? 'Room' : 'Cottage'} v={itemName} />
          {(booking.category === 'room' || booking.category === 'cottage') && <>
            <Row l="Check-in" v={fmtLong(booking.checkIn)} />
            <Row l="Check-out" v={fmtLong(booking.checkOut)} />
            <Row l="Nights" v={`${booking.nights}`} />
          </>}
          {booking.category === 'restaurant' && <>
            <Row l="Meal Time" v={meal?.time ?? ''} />
            <Row l="Type" v={booking.resType} />
            <Row l="Date" v={fmtLong(booking.resDate)} />
            <Row l="Guests" v={isWhole ? `${meal?.capacity} (whole)` : `${booking.g.pax} pax`} />
            <Row l="Tables" v={`${booking.tables}`} />
          </>}
          {booking.category === 'venue' && <>
            <Row l="Event" v={booking.eventType} />
            <Row l="Date" v={fmtLong(booking.resDate)} />
            <Row l="Time" v={booking.startTime && booking.endTime ? `${booking.startTime} – ${booking.endTime}` : '—'} />
          </>}
          {booking.specialRequests && <Row l="Requests" v={booking.specialRequests} />}
          <div className="border-t pt-1.5 mt-1.5 space-y-0.5" style={{ borderColor: border }}>
            <Row l="Payment Method" v={mLabel} />
            <Row l="Reservation Fee (30%)" v={peso(booking.fee)} />
            <Row l="Balance on Arrival" v={peso(booking.balance)} />
          </div>
          <div className="border-t pt-1.5 mt-1 flex justify-between" style={{ borderColor: border }}>
            <span className="text-xs font-bold" style={{ color: text2 }}>Total</span>
            <span className="text-sm font-bold" style={{ color: GREEN }}>{peso(booking.total)}</span>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: `${GREEN}18` }}>
          <p className="text-[9px]" style={{ color: text2 }}>Booked: {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: GREEN }}>Confirmed</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        <button onClick={onViewReservations} className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: GREEN }}>
          <IBookmark /> View My Reservations
        </button>
        <button onClick={onHome} className="w-full py-2.5 rounded-full text-sm font-medium transition-colors" style={{ border: `1.5px solid ${GREEN}`, color: GREEN }}>
          Back to Home
        </button>
        <button className="w-full py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-1.5 transition-colors" style={{ border: `1px solid ${border}`, color: text2 }}>
          <DlIcon /> Download Receipt
        </button>
      </div>
    </div>
  )
}

function BookingFormCard({ children }: { children: React.ReactNode }) {
  const { card, border } = useTheme()
  return (
    <div className="flex items-center justify-center p-5" style={{ width: 440 }}>
      <div className="rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)', background: card, border: `1px solid ${border}` }}>
        {children}
      </div>
    </div>
  )
}

// ─── Booking Login Gate ───────────────────────────────────────────────────────
function BookingLoginGate({ onBack, onSuccess }: { onBack: () => void; onSuccess: (u: UserProfile) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const { surface, text, text2, border } = useTheme()
  const icAuth = 'rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400 transition-all'

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-4 hover:opacity-70 transition-opacity" style={{ color: text2 }}>
        <ChevL /> Back to booking
      </button>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD}60, transparent)` }} />
        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Sign in to continue</p>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${GOLD}60, transparent)` }} />
      </div>
      <p className="text-xs mb-2" style={{ color: text2 }}>
        {mode === 'login' ? "Sign in or create an account to complete your booking." : "Create an account to complete your booking."}
      </p>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('login')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: mode === 'login' ? GREEN : surface, color: mode === 'login' ? '#fff' : text2 }}>Sign In</button>
        <button onClick={() => setMode('signup')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: mode === 'signup' ? GREEN : surface, color: mode === 'signup' ? '#fff' : text2 }}>Register</button>
      </div>
      {mode === 'login' ? (
        <form onSubmit={e => { e.preventDefault(); onSuccess({ firstName: username || 'Guest', lastName: '', email: '', phone: '', username }) }} className="space-y-2">
          <FLabel label="Username" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required /></FLabel>
          <FLabel label="Password" req>
            <div className="relative">
              <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showPwd} /></button>
            </div>
          </FLabel>
          <button type="submit" className="w-full py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: GREEN }}>Sign In &amp; Continue</button>
        </form>
      ) : (
        <form onSubmit={e => { e.preventDefault(); onSuccess({ firstName, lastName, email, phone, username }) }} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <FLabel label="First Name" req><input className={icAuth} style={icStyle(surface, text)} placeholder="First" value={firstName} onChange={e => setFirstName(e.target.value)} required /></FLabel>
            <FLabel label="Last Name" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Last" value={lastName} onChange={e => setLastName(e.target.value)} required /></FLabel>
          </div>
          <FLabel label="Email" req><input className={icAuth} style={icStyle(surface, text)} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /></FLabel>
          <FLabel label="Username" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required /></FLabel>
          <FLabel label="Phone"><input className={icAuth} style={icStyle(surface, text)} placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} /></FLabel>
          <FLabel label="Password" req>
            <div className="relative">
              <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showPwd} /></button>
            </div>
          </FLabel>
          <FLabel label="Confirm Password" req>
            <div className="relative">
              <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showConfirm} /></button>
            </div>
          </FLabel>
          <button type="submit" className="w-full py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: GREEN }}>Create Account &amp; Continue</button>
        </form>
      )}
      <div className="flex items-center gap-3 mt-3 mb-2">
        <div className="flex-1 h-px" style={{ background: border }} />
        <span className="text-[10px] font-medium" style={{ color: text2 }}>or continue with</span>
        <div className="flex-1 h-px" style={{ background: border }} />
      </div>
      <div className="space-y-1.5">
        <button type="button" onClick={() => onSuccess({ firstName: 'Google', lastName: 'User', email: 'google@example.com', phone: '', username: 'google_user' })} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${border}`, color: text, background: 'transparent' }}>
          <IGoogleIcon /> Continue with Google
        </button>
        <button type="button" onClick={() => onSuccess({ firstName: 'Facebook', lastName: 'User', email: 'facebook@example.com', phone: '', username: 'facebook_user' })} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${border}`, color: text, background: 'transparent' }}>
          <IFBIcon /> Continue with Facebook
        </button>
        <button type="button" onClick={() => onSuccess({ firstName: 'Instagram', lastName: 'User', email: 'instagram@example.com', phone: '', username: 'instagram_user' })} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${border}`, color: text, background: 'transparent' }}>
          <IIGIcon /> Continue with Instagram
        </button>
      </div>
      <p className="text-center text-[11px] mt-3 pb-2" style={{ color: text2 }}>
        {mode === 'login' ? <>Don&apos;t have an account? <button type="button" onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign up</button></> : <>Already have an account? <button type="button" onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign in</button></>}
      </p>
    </div>
  )
}

// ─── Booking View (unified) ───────────────────────────────────────────────────
function BookingView({ initialCategory, initialItemId, onBackToHome, onBookingComplete, onViewReservations, user, onLoginSuccess }: {
  initialCategory: AccomTab
  initialItemId: string
  onBackToHome: () => void
  onBookingComplete: (b: BookingRecord) => void
  onViewReservations: () => void
  user: UserProfile | null
  onLoginSuccess: (u: UserProfile) => void
}) {
  const [step, setStep] = useState(1)
  const [loginGate, setLoginGate] = useState(false)
  const [g, setG] = useState<Guest>({ firstName: '', lastName: '', email: '', phone: '', pax: 1 })
  const [localCategory, setLocalCategory] = useState<AccomTab>(initialCategory)
  const [itemId, setItemId] = useState(initialItemId)
  const [details, setDetails] = useState<DetailsState>({
    checkIn: '', checkOut: '',
    resType: 'Couple', resDate: '', tables: 1, wholeEvent: '',
    eventType: 'Birthday', startTime: '', endTime: '',
    addOns: { catering: false, rooms: false, cottages: false },
    specialRequests: '',
    unitLabel: '',
  })
  const [method, setMethod] = useState<PayMethod>('gcash')
  const [phone, setPhone] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null)
  const [payPlan, setPayPlan] = useState<PayPlan>('full')
  const [downpayOption, setDownpayOption] = useState<DownpayOption | null>(null)

  const total = calcTotal(localCategory, itemId, calcNights(details.checkIn, details.checkOut), g.pax, details.resType, details.addOns)
  const feeAmt = payPlan === 'full' ? total : Math.round(total * 0.3)
  const balAmt = total - feeAmt
  const fee = feeAmt
  const bal = balAmt

  function handleConfirm() {
    const record: BookingRecord = {
      id: genId(),
      createdAt: new Date().toISOString(),
      category: localCategory,
      g,
      itemId,
      checkIn: details.checkIn,
      checkOut: details.checkOut,
      nights: calcNights(details.checkIn, details.checkOut),
      resType: details.resType,
      resDate: details.resDate,
      tables: details.tables,
      eventType: details.eventType,
      startTime: details.startTime,
      endTime: details.endTime,
      addOns: details.addOns,
      specialRequests: details.specialRequests,
      method,
      total,
      fee: feeAmt,
      balance: balAmt,
      payPlan,
      downpayOption,
      unitLabel: details.unitLabel,
      userId: user?.username ?? user?.email ?? '',
    }
    setConfirmedBooking(record)
    onBookingComplete(record)
    setStep(6)
  }

  const next = () => {
    if (step === 3 && !user) { setLoginGate(true); return }
    if (step === 5) { handleConfirm(); return }
    setStep(s => s + 1)
  }
  const back = () => {
    if (loginGate) { setLoginGate(false); return }
    setStep(s => Math.max(1, s - 1))
  }

  const step3Label = (localCategory === 'room' || localCategory === 'cottage') ? 'Stay & Dates' : localCategory === 'restaurant' ? 'Rest. Details' : 'Venue Details'
  const dynamicSteps = ['Guest Details', 'Accommodation', step3Label, 'Payment', 'Confirm']

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.22) 100%)' }} />

      {/* Desktop layout: side by side */}
      <div className="hidden md:flex relative z-10 h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-white select-none px-8 relative">
          <button onClick={onBackToHome} className="absolute top-5 left-5 flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
            <ChevL /> Back to Website
          </button>
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h1 className="text-5xl font-bold text-white mt-2 text-center leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
          <p className="text-xl text-white/90 mt-1" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
          <p className="text-white/60 text-[11px] tracking-[0.32em] uppercase mt-4 font-light">Reserve your slice of paradise</p>
        </div>
        <BookingFormCard>
          {!loginGate && step < 6 && <Stepper cur={step} steps={dynamicSteps} />}
          {loginGate
            ? <BookingLoginGate onBack={() => setLoginGate(false)} onSuccess={u => { onLoginSuccess(u); setLoginGate(false); setStep(4) }} />
            : <>
              {step === 1 && <S1GuestDetails g={g} setG={setG} onNext={next} />}
              {step === 2 && <S2Accommodation localCategory={localCategory} setLocalCategory={setLocalCategory} itemId={itemId} setItemId={setItemId} onBack={back} onNext={next} />}
              {step === 3 && <S3Details category={localCategory} itemId={itemId} g={g} details={details} setDetails={setDetails} onBack={back} onNext={next} />}
              {step === 4 && <S4Payment method={method} setMethod={setMethod} phone={phone} setPhone={setPhone} total={total} payPlan={payPlan} setPayPlan={setPayPlan} downpayOption={downpayOption} setDownpayOption={setDownpayOption} onBack={back} onNext={next} />}
              {step === 5 && <S5Confirm category={localCategory} itemId={itemId} g={g} details={details} method={method} total={total} payPlan={payPlan} downpayOption={downpayOption} onBack={back} onNext={next} />}
              {step === 6 && confirmedBooking && <S6Receipt booking={confirmedBooking} onHome={onBackToHome} onViewReservations={onViewReservations} />}
            </>
          }
        </BookingFormCard>
      </div>

      {/* Mobile layout: stacked — header on top, form below */}
      <div className="flex md:hidden relative z-10 flex-col h-full overflow-y-auto safe-top">
        {/* Mobile header strip */}
        <div className="shrink-0 pt-3 pb-4 px-5 text-center text-white select-none relative">
          <button onClick={onBackToHome} className="absolute left-4 top-4 flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors">
            <ChevL /> Back
          </button>
          <p className="text-[9px] font-medium tracking-[0.28em] uppercase mt-1" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h1 className="text-2xl font-bold text-white leading-tight mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
          <p className="text-sm text-white/85" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
          <p className="text-white/55 text-[9px] tracking-[0.28em] uppercase mt-1 font-light">Reserve your slice of paradise</p>
        </div>
        {/* Mobile form card — fills remaining space */}
        <div className="flex-1 mx-3 mb-3 rounded-2xl shadow-2xl overflow-hidden flex flex-col safe-bottom" style={{ background: 'var(--card-bg)' }}>
          {!loginGate && step < 6 && <Stepper cur={step} steps={dynamicSteps} />}
          {loginGate
            ? <BookingLoginGate onBack={() => setLoginGate(false)} onSuccess={u => { onLoginSuccess(u); setLoginGate(false); setStep(4) }} />
            : <>
              {step === 1 && <S1GuestDetails g={g} setG={setG} onNext={next} />}
              {step === 2 && <S2Accommodation localCategory={localCategory} setLocalCategory={setLocalCategory} itemId={itemId} setItemId={setItemId} onBack={back} onNext={next} />}
              {step === 3 && <S3Details category={localCategory} itemId={itemId} g={g} details={details} setDetails={setDetails} onBack={back} onNext={next} />}
              {step === 4 && <S4Payment method={method} setMethod={setMethod} phone={phone} setPhone={setPhone} total={total} payPlan={payPlan} setPayPlan={setPayPlan} downpayOption={downpayOption} setDownpayOption={setDownpayOption} onBack={back} onNext={next} />}
              {step === 5 && <S5Confirm category={localCategory} itemId={itemId} g={g} details={details} method={method} total={total} payPlan={payPlan} downpayOption={downpayOption} onBack={back} onNext={next} />}
              {step === 6 && confirmedBooking && <S6Receipt booking={confirmedBooking} onHome={onBackToHome} onViewReservations={onViewReservations} />}
            </>
          }
        </div>
      </div>
    </div>
  )
}

// ─── Reservations View ────────────────────────────────────────────────────────
function ReservationsView({ bookings, onBack }: { bookings: BookingRecord[]; onBack: () => void }) {
  const { card, surface, border, text, text2, text3, pageBg } = useTheme()
  const catColors: Record<AccomTab, string> = { room: '#3B82F6', cottage: '#10B981', restaurant: '#F59E0B', venue: '#8B5CF6' }
  const catLabels: Record<AccomTab, string> = { room: 'Room', cottage: 'Cottage', restaurant: 'Restaurant', venue: 'Venue' }

  function BookingCard({ b }: { b: BookingRecord }) {
    const { card: bc, surface: bs, border: bb, text: bt, text2: bt2, text3: bt3 } = useTheme()
    const [open, setOpen] = useState(false)
    const itemName = getItemName(b.category, b.itemId)
    const meal = RESTAURANT_MEALS.find(m => m.id === b.itemId)
    const isWhole = b.resType === 'Whole Restaurant'
    const mLabel = PAY_OPTS.find(p => p.id === b.method)?.label ?? ''

    function Row({ l, v }: { l: string; v: string }) {
      return (
        <div className="flex justify-between text-xs py-0.5">
          <span style={{ color: bt3 }}>{l}</span>
          <span className="font-medium text-right" style={{ maxWidth: '55%', color: bt }}>{v}</span>
        </div>
      )
    }

    return (
      <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all" style={{ border: `1.5px solid ${bb}`, background: bc }}>
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: catColors[b.category] }}>{catLabels[b.category]}</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: GREEN }}>Confirmed</span>
            </div>
            <p className="text-sm font-bold truncate" style={{ color: bt }}>{itemName}</p>
            <p className="text-[10px] mt-0.5" style={{ color: bt3 }}>
              {(b.category === 'room' || b.category === 'cottage') && b.checkIn ? `${fmtLong(b.checkIn)} → ${fmtLong(b.checkOut)}` : fmtLong(b.resDate) || '—'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold" style={{ color: GREEN }}>{peso(b.total)}</p>
            <p className="text-[9px]" style={{ color: bt3 }}>#{b.id.toUpperCase()}</p>
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-medium transition-colors" style={{ color: GREEN, borderTop: `1px solid ${bb}` }}>
          {open ? 'Hide Details' : 'View Receipt'}
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {open && (
          <div className="px-4 pb-4 pt-2 space-y-0.5" style={{ background: bs, borderTop: `1px solid ${bb}` }}>
            <Row l="Guest" v={`${b.g.firstName} ${b.g.lastName}`.trim()} />
            <Row l="Email" v={b.g.email} />
            <Row l="Phone" v={b.g.phone || '—'} />
            <Row l="Guests" v={`${b.g.pax} pax`} />
            <div className="pt-1 mt-1" style={{ borderTop: `1px solid ${bb}` }} />
            {(b.category === 'room' || b.category === 'cottage') && <>
              <Row l="Check-in" v={fmtLong(b.checkIn)} />
              <Row l="Check-out" v={fmtLong(b.checkOut)} />
              <Row l="Nights" v={`${b.nights}`} />
            </>}
            {b.category === 'restaurant' && <>
              <Row l="Meal" v={itemName} />
              <Row l="Time" v={meal?.time ?? ''} />
              <Row l="Type" v={b.resType} />
              <Row l="Date" v={fmtLong(b.resDate)} />
              <Row l="Guests" v={isWhole ? `${meal?.capacity} (whole)` : `${b.g.pax} pax`} />
              <Row l="Tables" v={`${b.tables}`} />
            </>}
            {b.category === 'venue' && <>
              <Row l="Event" v={b.eventType} />
              <Row l="Date" v={fmtLong(b.resDate)} />
              <Row l="Time" v={b.startTime && b.endTime ? `${b.startTime} – ${b.endTime}` : '—'} />
            </>}
            {b.specialRequests && <Row l="Requests" v={b.specialRequests} />}
            <div className="pt-1 mt-1" style={{ borderTop: `1px solid ${bb}` }} />
            <Row l="Payment" v={mLabel} />
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="text-xs" style={{ color: bt3 }}>Status</span>
              <span className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full" style={
                (b.payPlan ?? 'downpayment') === 'full'
                  ? { background: '#DCFCE7', color: '#16A34A' }
                  : b.downpayOption === 'on-arrival'
                  ? { background: '#FEF3C7', color: '#D97706' }
                  : { background: '#DBEAFE', color: '#2563EB' }
              }>
                {(b.payPlan ?? 'downpayment') === 'full' ? 'Fully Paid' : b.downpayOption === 'on-arrival' ? 'Pay in Arrival' : 'Follow-up'}
              </span>
            </div>
            <Row l="Reservation Fee" v={peso(b.fee)} />
            <Row l="Balance" v={peso(b.balance)} />
            <div className="flex justify-between pt-1 mt-1" style={{ borderTop: `1px solid ${bb}` }}>
              <span className="text-xs font-bold" style={{ color: bt }}>Total</span>
              <span className="text-sm font-bold" style={{ color: GREEN }}>{peso(b.total)}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col safe-top safe-bottom" style={{ background: pageBg }}>
      {/* Header */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between shadow-sm" style={{ background: card, borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70" style={{ color: text2 }}><ChevL /> Back</button>
          <div className="w-px h-4" style={{ background: border }} />
          <div>
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Palawan Paraíso</p>
            <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: text }}>My Reservations</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: text2 }}>
          <IBookmark />
          <span>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="rounded-full flex items-center justify-center" style={{ width: 64, height: 64, background: surface }}>
              <IBookmark />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>No Reservations Yet</p>
              <p className="text-sm mt-1" style={{ color: text3 }}>Your confirmed bookings will appear here.</p>
            </div>
            <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: GREEN }}>
              Browse Catalogue
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-xs mb-1" style={{ color: text3 }}>Showing all confirmed reservations</p>
            {[...bookings].reverse().map(b => <BookingCard key={b.id} b={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 34 }: { user: UserProfile; size?: number }) {
  const initials = [user.firstName[0], user.lastName[0]].filter(Boolean).join('').toUpperCase() || '?'
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 font-bold text-white select-none" style={{ width: size, height: size, background: `linear-gradient(135deg, ${GREEN}, #2a6647)`, fontSize: size * 0.38 }}>
      {initials}
    </div>
  )
}