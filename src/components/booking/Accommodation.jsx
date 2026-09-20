// ===== START CUT: components/booking/Accommodation.jsx =====
function S2Accommodation({ localCategory, setLocalCategory, itemId, setItemId, onBack, onNext }: {
  localCategory: AccomTab; setLocalCategory: (c: AccomTab) => void
  itemId: string; setItemId: (id: string) => void
  onBack: () => void; onNext: () => void
}) {
  const tabs: { id: AccomTab; label: string; count: number }[] = [
    { id: 'room', label: 'Rooms', count: ROOMS.length },
    { id: 'cottage', label: 'Cottages', count: COTTAGES.length },
    { id: 'restaurant', label: 'Restaurant', count: RESTAURANT_MEALS.length },
    { id: 'venue', label: 'Venues', count: VENUES.length },
  ]

  function switchTab(c: AccomTab) {
    setLocalCategory(c)
    if (c === 'room') setItemId(ROOMS[0].id)
    else if (c === 'cottage') setItemId(COTTAGES[0].id)
    else if (c === 'restaurant') setItemId(RESTAURANT_MEALS[0].id)
    else setItemId(VENUES[0].id)
  }

  const { surface, card, text, text2, text3, border } = useTheme()

  function ItemCard({ id, img, name, desc, price, priceUnit, capacity, amenities }: {
    id: string; img: string; name: string; desc: string
    price: number; priceUnit: string; capacity: number; amenities: string[]
  }) {
    const sel = itemId === id
    return (
      <div onClick={() => setItemId(id)} className="rounded-xl overflow-hidden cursor-pointer transition-all" style={{ border: `2px solid ${sel ? GREEN : border}`, boxShadow: sel ? `0 2px 12px ${GREEN}2A` : 'none', background: card }}>
        <div className="relative h-24">
          <img src={img} alt={name} className="w-full h-full object-cover" />
          {sel && <div className="absolute top-1.5 right-1.5 text-white rounded-full flex items-center justify-center" style={{ width: 20, height: 20, background: GREEN }}><Chk cls="w-2.5 h-2.5" /></div>}
          <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-white text-[9px] font-semibold" style={{ background: 'rgba(0,0,0,0.5)', borderTopLeftRadius: 5 }}>
            {peso(price)}<span className="font-normal opacity-80 text-[8px]">/{priceUnit}</span>
          </div>
        </div>
        <div className="p-2">
          <p className="text-[11px] font-semibold" style={{ color: text }}>{name}</p>
          <p className="text-[9px] mt-0.5 leading-tight" style={{ color: text2 }}>{desc.split('.')[0]}.</p>
          <div className="flex flex-wrap gap-1 mt-1.5">{amenities.slice(0, 3).map(a => <Chip key={a} label={a} />)}</div>
          <div className="flex items-center gap-1 mt-1.5 text-[9px]" style={{ color: text3 }}><IUsers /> {capacity} pax</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3.5 pb-2">
        <div className="mb-3">
          <h2 className="text-[17px] font-semibold" style={{ color: text }}>Accommodation</h2>
          <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Choose a category then select your preferred option.</p>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => switchTab(tab.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{ background: localCategory === tab.id ? GREEN : 'white', color: localCategory === tab.id ? 'white' : '#6B7280', border: `1.5px solid ${localCategory === tab.id ? GREEN : '#E5E7EB'}`, boxShadow: localCategory === tab.id ? `0 2px 8px ${GREEN}33` : 'none' }}>
              {tab.label}
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: localCategory === tab.id ? 'rgba(255,255,255,0.25)' : '#F3F4F6', color: localCategory === tab.id ? 'white' : '#9CA3AF' }}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {localCategory === 'room' && ROOMS.map(r => <ItemCard key={r.id} id={r.id} img={r.img} name={r.name} desc={r.desc} price={r.price} priceUnit="night" capacity={r.capacity} amenities={r.amenities} />)}
          {localCategory === 'cottage' && COTTAGES.map(c => <ItemCard key={c.id} id={c.id} img={c.img} name={c.name} desc={c.desc} price={c.price} priceUnit="night" capacity={c.capacity} amenities={c.amenities} />)}
          {localCategory === 'restaurant' && RESTAURANT_MEALS.map(m => <ItemCard key={m.id} id={m.id} img={m.img} name={m.meal} desc={`${m.time} · ${m.desc}`} price={m.price} priceUnit="pax" capacity={m.capacity} amenities={['Breakfast', 'Set Menu', 'À la Carte', 'Buffet']} />)}
          {localCategory === 'venue' && VENUES.map(v => <ItemCard key={v.id} id={v.id} img={v.img} name={v.name} desc={v.desc} price={v.price} priceUnit="event" capacity={v.capacity} amenities={v.amenities} />)}
        </div>
      </div>
      <NavFooter step={2} total={5} onBack={onBack} onNext={onNext} />
    </>
  )
}

// ─── Step 3: Details (dynamic by category) ────────────────────────────────────
interface DetailsState {
  checkIn: string; checkOut: string
  resType: string; resDate: string; tables: number; wholeEvent: string
  eventType: string; startTime: string; endTime: string
  addOns: { catering: boolean; rooms: boolean; cottages: boolean }
  specialRequests: string
  unitLabel: string
}

// ─── Booking Calendar Popup ───────────────────────────────────────────────────
const UNIT_COLORS = ['#38875C','#2563EB','#D97706','#9333EA','#DB2777','#0891B2','#DC2626','#65A30D','#EA580C','#7C3AED']

function BookingCalendarPopup({ itemId, mode, checkIn, checkOut, onSelect, onClose }: {
  itemId: string
  mode: 'checkin' | 'checkout'
  checkIn: string; checkOut: string
  onSelect: (date: string) => void
  onClose: () => void
}) {
  const cfg = ITEM_UNITS[itemId]
  const { card, surface, border, text, text2, dm } = useTheme()

  const events = useMemo(() => {
    const occ = (cfg?.units ?? []).flatMap((unit, idx) =>
      unit.bookings.map(b => ({
        start: b.from, end: b.to,
        title: unit.label,
        backgroundColor: UNIT_COLORS[idx % UNIT_COLORS.length],
        borderColor: UNIT_COLORS[idx % UNIT_COLORS.length],
        textColor: '#fff', display: 'block' as const,
      }))
    )
    const bg = []
    if (checkIn && checkOut && checkIn < checkOut) {
      bg.push({ start: checkIn, end: checkOut, display: 'background' as const, color: 'rgba(56,135,92,0.18)' })
    }
    return [...occ, ...bg]
  }, [itemId, checkIn, checkOut])

  function handleDateClick(info: DateClickArg) {
    const ds = info.dateStr
    if (ds < AVAIL_TODAY) return
    if (mode === 'checkout' && checkIn && ds <= checkIn) return
    onSelect(ds)
  }

  return (
    <div className="fixed inset-0 z-[55] flex" onClick={onClose}>
      {/* Left panel — calendar popup */}
      <div className="hidden md:flex flex-col items-center justify-center" style={{ width: 'calc(100% - 440px)', padding: '24px' }} onClick={e => e.stopPropagation()}>
        <div className="w-full rounded-2xl shadow-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}`, maxWidth: 520, maxHeight: '90vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>
                {mode === 'checkin' ? '📅 Select Check-in Date' : '📅 Select Check-out Date'}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: text2 }}>
                {mode === 'checkout' && checkIn
                  ? `Check-in set: ${fmtLong(checkIn)} — now pick check-out`
                  : 'Tap a date on the calendar below'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full flex items-center justify-center text-xs" style={{ width: 28, height: 28, background: surface, color: text2 }}>✕</button>
          </div>
          {/* Calendar */}
          <div className={`fc-resort fc-resort-booking${dm ? ' fc-resort-dark' : ''}`} style={{ overflowY: 'auto' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={mode === 'checkout' && checkIn ? checkIn : AVAIL_TODAY}
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
              height="auto"
              fixedWeekCount={false}
              showNonCurrentDates={false}
              validRange={{ start: AVAIL_TODAY }}
              dayCellClassNames={info => {
                const cls: string[] = []
                if (info.dateStr === checkIn || info.dateStr === checkOut) cls.push('fc-resort-selected')
                if (info.dateStr < AVAIL_TODAY) cls.push('fc-resort-past')
                if (mode === 'checkout' && checkIn && info.dateStr <= checkIn) cls.push('fc-resort-past')
                return cls
              }}
            />
          </div>
          {/* Legend */}
          {cfg && cfg.units.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2.5 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
              <span className="text-[9px] font-semibold uppercase tracking-wider w-full mb-0.5" style={{ color: text2 }}>Occupied units</span>
              {cfg.units.map((unit, idx) => (
                <div key={unit.label} className="flex items-center gap-1">
                  <div className="rounded-sm w-2 h-2 shrink-0" style={{ background: UNIT_COLORS[idx % UNIT_COLORS.length] }} />
                  <span className="text-[9px]" style={{ color: text2 }}>{unit.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: full-screen popup */}
      <div className="flex md:hidden flex-col items-center justify-center w-full h-full p-4" onClick={e => e.stopPropagation()}>
        <div className="w-full rounded-2xl shadow-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}`, maxHeight: '92vh' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
            <p className="text-sm font-semibold" style={{ color: text }}>
              {mode === 'checkin' ? 'Select Check-in' : 'Select Check-out'}
            </p>
            <button onClick={onClose} className="rounded-full flex items-center justify-center text-xs" style={{ width: 28, height: 28, background: surface, color: text2 }}>✕</button>
          </div>
          <div className={`fc-resort fc-resort-booking${dm ? ' fc-resort-dark' : ''}`} style={{ overflowY: 'auto' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={mode === 'checkout' && checkIn ? checkIn : AVAIL_TODAY}
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
              height="auto"
              fixedWeekCount={false}
              showNonCurrentDates={false}
              validRange={{ start: AVAIL_TODAY }}
              dayCellClassNames={info => {
                const cls: string[] = []
                if (info.dateStr === checkIn || info.dateStr === checkOut) cls.push('fc-resort-selected')
                if (info.dateStr < AVAIL_TODAY || (mode === 'checkout' && checkIn && info.dateStr <= checkIn)) cls.push('fc-resort-past')
                return cls
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function S3Details({ category, itemId, g, details, setDetails, onBack, onNext }: {
  category: AccomTab; itemId: string; g: Guest
  details: DetailsState; setDetails: (d: DetailsState) => void
  onBack: () => void; onNext: () => void
}) {
  const up = (patch: Partial<DetailsState>) => setDetails({ ...details, ...patch })
  const { surface, surface2, card, text, text2, text3, border } = useTheme()

  function handleCheckIn(v: string) {
    up({ checkIn: v, checkOut: (details.checkOut && details.checkOut <= v) ? '' : details.checkOut })
  }
  function handleCheckOut(v: string) {
    if (!details.checkIn || v > details.checkIn) up({ checkOut: v })
  }

  const item = category === 'room' ? ROOMS.find(r => r.id === itemId)
    : category === 'cottage' ? COTTAGES.find(c => c.id === itemId)
    : category === 'restaurant' ? RESTAURANT_MEALS.find(m => m.id === itemId)
    : VENUES.find(v => v.id === itemId)

  const [calMode, setCalMode] = useState<'checkin' | 'checkout' | null>(null)

  // Room / Cottage: Stay & Dates
  if (category === 'room' || category === 'cottage') {
    const roomItem = item as typeof ROOMS[0]
    const n = calcNights(details.checkIn, details.checkOut)
    const total = n * (roomItem?.price ?? 0)

    function handleCalSelect(date: string) {
      if (calMode === 'checkin') {
        up({ checkIn: date, checkOut: details.checkOut && details.checkOut <= date ? '' : details.checkOut })
        setCalMode('checkout')
      } else {
        up({ checkOut: date })
        setCalMode(null)
      }
    }

    return (
      <>
        {calMode && (
          <BookingCalendarPopup
            itemId={itemId} mode={calMode}
            checkIn={details.checkIn} checkOut={details.checkOut}
            onSelect={handleCalSelect} onClose={() => setCalMode(null)}
          />
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-2 space-y-3">
          <div>
            <h2 className="text-[17px] font-semibold" style={{ color: text }}>Stay &amp; Dates</h2>
            <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Tap a field to pick dates from the availability calendar.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium mb-1" style={{ color: text2 }}>Check-in Date</p>
              <button onClick={() => setCalMode('checkin')} className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all" style={{ background: surface, color: details.checkIn ? text : text2, border: `1.5px solid ${calMode === 'checkin' ? GREEN : border}` }}>
                {details.checkIn ? fmtLong(details.checkIn) : 'Select date…'}
              </button>
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1" style={{ color: text2 }}>Check-out Date</p>
              <button onClick={() => setCalMode('checkout')} className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all" style={{ background: surface, color: details.checkOut ? text : text2, border: `1.5px solid ${calMode === 'checkout' ? GREEN : border}` }}>
                {details.checkOut ? fmtLong(details.checkOut) : 'Select date…'}
              </button>
            </div>
          </div>
          {details.checkIn && (() => {
            const allUnits = ITEM_UNITS[itemId]?.units ?? []
            if (allUnits.length === 0) return null
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium" style={{ color: text2 }}>Select Unit</p>
                  <p className="text-[10px]" style={{ color: text3 }}>Based on check-in: {fmtLong(details.checkIn)}</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {allUnits.map(unit => {
                    // A unit is occupied if check-in date falls within any of its bookings
                    const occupiedBooking = unit.bookings.find(b => details.checkIn >= b.from && details.checkIn < b.to)
                    const avail = !occupiedBooking
                    const sel = details.unitLabel === unit.label
                    return (
                      <button key={unit.label} disabled={!avail} onClick={() => up({ unitLabel: avail ? unit.label : details.unitLabel })}
                        className="px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all"
                        style={{ border: `1.5px solid ${sel ? GREEN : avail ? `${GREEN}55` : '#DC262650'}`, background: sel ? `${GREEN}18` : avail ? `${GREEN}0A` : '#DC262608', color: avail ? text : '#DC2626', cursor: avail ? 'pointer' : 'not-allowed' }}>
                        <div className="font-semibold">{unit.label}</div>
                        {avail
                          ? <div className="text-[9px] mt-0.5 font-normal" style={{ color: GREEN }}>Available</div>
                          : <div className="text-[9px] mt-0.5 font-normal" style={{ color: '#DC2626' }}>
                              Occupied {fmtLong(occupiedBooking!.from)} – {fmtLong(occupiedBooking!.to)}
                            </div>
                        }
                        {unit.group && <div className="text-[8px] mt-0.5 opacity-60">{unit.group}</div>}
                      </button>
                    )
                  })}
                </div>
                {!details.unitLabel && <p className="text-[10px] mt-1.5" style={{ color: '#D97706' }}>⚠ Please select an available unit to continue.</p>}
              </div>
            )
          })()}
          <FLabel label="Special Requests">
            <textarea className={ic + ' resize-none'} style={icStyle(surface, text)} rows={2} placeholder="Special arrangements, accessibility needs..." value={details.specialRequests} onChange={e => up({ specialRequests: e.target.value })} />
          </FLabel>
          <div className="rounded-xl p-3.5 space-y-2" style={{ background: surface }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: text2 }}>Selected {category === 'room' ? 'Room' : 'Cottage'}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: text }}>{roomItem?.name}</p>
              <p className="text-xs font-semibold" style={{ color: GREEN }}>{peso(roomItem?.price ?? 0)}<span className="text-[10px] font-normal" style={{ color: text2 }}>/night</span></p>
            </div>
            <div className="border-t pt-2 space-y-1" style={{ borderColor: border }}>
              <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Nights</span><span className="font-medium" style={{ color: text }}>{n || '—'}</span></div>
              <div className="flex justify-between text-xs border-t pt-1" style={{ borderColor: border }}>
                <span className="font-semibold" style={{ color: text2 }}>Total Stay</span>
                <span className="font-bold" style={{ color: text }}>{total ? peso(total) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
        <NavFooter step={3} total={5} onBack={onBack} onNext={onNext} />
      </>
    )
  }

  // Restaurant: Reservation Details
  if (category === 'restaurant') {
    const meal = item as typeof RESTAURANT_MEALS[0]
    const isWhole = details.resType === 'Whole Restaurant'
    const total = isWhole ? (meal?.price ?? 0) * (meal?.capacity ?? 0) : (meal?.price ?? 0) * g.pax
    return (
      <>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-2 space-y-3">
          <div>
            <h2 className="text-[17px] font-semibold" style={{ color: text }}>Reservation Details</h2>
            <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Set your dining preferences and reservation details.</p>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: surface }}>
            <img src={meal?.img} alt={meal?.meal} className="w-14 h-14 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>{meal?.meal}</p>
              <p className="text-[10px]" style={{ color: text2 }}>{meal?.time}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: GREEN }}>{peso(meal?.price ?? 0)}/pax</p>
            </div>
          </div>
          <FLabel label="Reservation Type" req>
            <select className={icSel} style={icStyle(surface, text)} value={details.resType} onChange={e => up({ resType: e.target.value })}>
              {RESERVATION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </FLabel>
          {isWhole && (
            <FLabel label="Event Type" req>
              <select className={icSel} style={icStyle(surface, text)} value={details.wholeEvent} onChange={e => up({ wholeEvent: e.target.value })}>
                <option value="">Select event type</option>
                {WHOLE_REST_EVENTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </FLabel>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium mb-1" style={{ color: text2 }}>Date</p>
              <button onClick={() => setCalMode('checkin')} className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all" style={{ background: surface, color: details.resDate ? text : text2, border: `1.5px solid ${calMode ? GREEN : border}` }}>
                {details.resDate ? fmtLong(details.resDate) : 'Select date…'}
              </button>
              {calMode && (
                <BookingCalendarPopup
                  itemId={itemId} mode="checkin"
                  checkIn={details.resDate} checkOut=""
                  onSelect={v => { up({ resDate: v }); setCalMode(null) }} onClose={() => setCalMode(null)}
                />
              )}
            </div>
            <FLabel label="Tables Reserved" req>

              <div className="flex rounded-lg overflow-hidden text-sm" style={{ background: surface }}>
                <span className="flex-1 px-3 py-2" style={{ color: text }}>{details.tables}</span>
                <div className="flex flex-col border-l border-white/10">
                  <button type="button" className="px-2.5 py-0.5 text-[11px] leading-snug hover:bg-black/10" style={{ color: text2 }} onClick={() => up({ tables: Math.min(20, details.tables + 1) })}>▲</button>
                  <button type="button" className="px-2.5 py-0.5 text-[11px] leading-snug hover:bg-black/10" style={{ color: text2 }} onClick={() => up({ tables: Math.max(1, details.tables - 1) })}>▼</button>
                </div>
              </div>
            </FLabel>
          </div>
          {details.resDate && (() => {
            const cfg = ITEM_UNITS[itemId]
            if (!cfg) return null
            const nextDs = nextDay(details.resDate)
            const groups = Array.from(new Set(cfg.units.map(u => u.group ?? 'Tables')))
            return (
              <div className="rounded-xl p-3 space-y-1" style={{ background: surface }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: text2 }}>Table Availability</p>
                {groups.map(grp => {
                  const grpUnits = cfg.units.filter(u => (u.group ?? 'Tables') === grp)
                  const availCount = grpUnits.filter(u => !u.bookings.some(b => b.from < nextDs && b.to > details.resDate)).length
                  return <div key={grp} className="flex justify-between text-xs"><span style={{ color: text2 }}>{grp} tables</span><span className="font-medium" style={{ color: availCount === 0 ? '#DC2626' : GREEN }}>{availCount}/{grpUnits.length} available</span></div>
                })}
                <p className="text-[9px] mt-1" style={{ color: text2 }}>Tables are assigned at check-in.</p>
              </div>
            )
          })()}
          <FLabel label="Special Requests">
            <textarea className={ic + ' resize-none'} style={icStyle(surface, text)} rows={2} placeholder="Dietary requirements, occasions..." value={details.specialRequests} onChange={e => up({ specialRequests: e.target.value })} />
          </FLabel>
          <div className="rounded-xl p-3 space-y-1" style={{ background: surface }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: text2 }}>Summary</p>
            <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Type</span><span className="font-medium" style={{ color: text }}>{details.resType}</span></div>
            <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Guests</span><span className="font-medium" style={{ color: text }}>{isWhole ? `${meal?.capacity} (whole)` : `${g.pax} pax`}</span></div>
            <div className="flex justify-between text-xs border-t pt-1" style={{ borderColor: border }}>
              <span className="font-semibold" style={{ color: text2 }}>Estimated Total</span>
              <span className="font-bold" style={{ color: GREEN }}>{peso(total)}</span>
            </div>
          </div>
        </div>
        <NavFooter step={3} total={5} onBack={onBack} onNext={onNext} />
      </>
    )
  }

  // Venue: Venue Details
  const venue = item as typeof VENUES[0]
  const addOnTotal = (details.addOns.catering ? 5000 : 0) + (details.addOns.rooms ? 3000 : 0) + (details.addOns.cottages ? 2000 : 0)
  const venueTotal = (venue?.price ?? 0) + addOnTotal

  function AddOnCheck({ field, label, price }: { field: keyof typeof details.addOns; label: string; price: number }) {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl transition-colors" style={{ border: `1.5px solid ${details.addOns[field] ? GREEN : border}`, background: details.addOns[field] ? `${GREEN}14` : card }}>
        <input type="checkbox" checked={details.addOns[field]} onChange={e => up({ addOns: { ...details.addOns, [field]: e.target.checked } })} className="rounded w-3.5 h-3.5 accent-[#38875C]" />
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: text }}>{label}</p>
          <p className="text-[10px]" style={{ color: text2 }}>+{peso(price)}</p>
        </div>
      </label>
    )
  }

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-2 space-y-3">
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: text }}>Venue Details</h2>
          <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Set your event details and optional add-ons.</p>
        </div>
        <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: surface }}>
          <img src={venue?.img} alt={venue?.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
          <div>
            <p className="text-sm font-semibold" style={{ color: text }}>{venue?.name}</p>
            <p className="text-[10px]" style={{ color: text2 }}>Up to {venue?.capacity} pax</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: GREEN }}>{peso(venue?.price ?? 0)}/event</p>
          </div>
        </div>
        <FLabel label="Event Type" req>
          <select className={icSel} style={icStyle(surface, text)} value={details.eventType} onChange={e => up({ eventType: e.target.value })}>
            {VENUE_EVENTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </FLabel>
        <div>
          <p className="text-[11px] font-medium mb-1" style={{ color: text2 }}>Event Date</p>
          <button onClick={() => setCalMode('checkin')} className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all" style={{ background: surface, color: details.resDate ? text : text2, border: `1.5px solid ${calMode ? GREEN : border}` }}>
            {details.resDate ? fmtLong(details.resDate) : 'Select date…'}
          </button>
          {calMode && (
            <BookingCalendarPopup
              itemId={itemId} mode="checkin"
              checkIn={details.resDate} checkOut=""
              onSelect={v => { up({ resDate: v }); setCalMode(null) }} onClose={() => setCalMode(null)}
            />
          )}
        </div>
        {details.resDate && (() => {
          const allUnits = ITEM_UNITS[itemId]?.units ?? []
          const toDs = nextDay(details.resDate)
          const availUnits = getAvailableUnitsForRange(itemId, details.resDate, toDs)
          const availLabels = new Set(availUnits.map(u => u.label))
          return (
            <div>
              <p className="text-[11px] font-medium mb-2" style={{ color: text2 }}>Select Unit</p>
              <div className="grid grid-cols-2 gap-1.5">
                {allUnits.map(unit => {
                  const avail = availLabels.has(unit.label)
                  const sel = details.unitLabel === unit.label
                  return (
                    <button key={unit.label} disabled={!avail} onClick={() => up({ unitLabel: unit.label })}
                      className="px-2 py-2 rounded-lg text-xs font-medium text-left transition-all"
                      style={{ border: `1.5px solid ${sel ? GREEN : avail ? `${GREEN}50` : '#DC262650'}`, background: sel ? `${GREEN}18` : avail ? `${GREEN}08` : '#DC262610', color: avail ? text : '#DC2626', opacity: avail ? 1 : 0.7, cursor: avail ? 'pointer' : 'not-allowed' }}>
                      <div>{unit.label}</div>
                      {!avail && <div className="text-[9px] mt-0.5" style={{ color: '#DC2626' }}>Occupied</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })()}
        <div className="grid grid-cols-2 gap-3">
          <FLabel label="Start Time" req><input className={ic} style={icStyle(surface, text)} type="time" value={details.startTime} onChange={e => up({ startTime: e.target.value })} /></FLabel>
          <FLabel label="End Time" req><input className={ic} style={icStyle(surface, text)} type="time" value={details.endTime} onChange={e => up({ endTime: e.target.value })} /></FLabel>
        </div>
        <div>
          <p className="text-[11px] font-medium mb-1.5" style={{ color: text2 }}>Optional Add-ons</p>
          <div className="space-y-1.5">
            <AddOnCheck field="catering" label="Restaurant Catering" price={5000} />
            <AddOnCheck field="rooms" label="Room Reservation Package" price={3000} />
            <AddOnCheck field="cottages" label="Cottage Reservation Package" price={2000} />
          </div>
        </div>
        <FLabel label="Special Requests">
          <textarea className={ic + ' resize-none'} style={icStyle(surface, text)} rows={2} placeholder="Decorations, AV requirements, catering notes..." value={details.specialRequests} onChange={e => up({ specialRequests: e.target.value })} />
        </FLabel>
        <div className="rounded-xl p-3 space-y-1" style={{ background: surface }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: text2 }}>Price Summary</p>
          <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Venue</span><span className="font-medium" style={{ color: text }}>{peso(venue?.price ?? 0)}</span></div>
          {details.addOns.catering && <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Catering</span><span className="font-medium" style={{ color: text }}>+₱5,000</span></div>}
          {details.addOns.rooms && <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Rooms Package</span><span className="font-medium" style={{ color: text }}>+₱3,000</span></div>}
          {details.addOns.cottages && <div className="flex justify-between text-xs"><span style={{ color: text2 }}>Cottages Package</span><span className="font-medium" style={{ color: text }}>+₱2,000</span></div>}
          <div className="flex justify-between text-xs border-t pt-1" style={{ borderColor: border }}>
            <span className="font-semibold" style={{ color: text2 }}>Total</span>
            <span className="font-bold" style={{ color: GREEN }}>{peso(venueTotal)}</span>
          </div>
        </div>
      </div>
      <NavFooter step={3} total={5} onBack={onBack} onNext={onNext} />
    </>
  )
}