// ===== START CUT: utils/bookingUtils.js =====
function fmt(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function fmtLong(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
function nextDay(iso) {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}
function calcNights(a, b) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}
function peso(n) { return '₱' + n.toLocaleString() }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

function getItemName(category, itemId) {
  if (category === 'room') return ROOMS.find(r => r.id === itemId)?.name ?? ''
  if (category === 'cottage') return COTTAGES.find(c => c.id === itemId)?.name ?? ''
  if (category === 'restaurant') return RESTAURANT_MEALS.find(m => m.id === itemId)?.meal ?? ''
  return VENUES.find(v => v.id === itemId)?.name ?? ''
}

function calcTotal(category, itemId, nights, pax, resType, addOns) {
  if (category === 'room') {
    const r = ROOMS.find(x => x.id === itemId)
    return (r?.price ?? 0) * nights
  }
  if (category === 'cottage') {
    const c = COTTAGES.find(x => x.id === itemId)
    return (c?.price ?? 0) * nights
  }
  if (category === 'restaurant') {
    const m = RESTAURANT_MEALS.find(x => x.id === itemId)
    if (!m) return 0
    return resType === 'Whole Restaurant' ? m.price * m.capacity : m.price * pax
  }
  // venue
  const v = VENUES.find(x => x.id === itemId)
  const base = v?.price ?? 0
  const extras = (addOns.catering ? 5000 : 0) + (addOns.rooms ? 3000 : 0) + (addOns.cottages ? 2000 : 0)
  return base + extras
}
