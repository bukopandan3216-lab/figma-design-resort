import { useState, useRef, createContext, useContext, useMemo, useEffect, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { DatesSetArg } from '@fullcalendar/core'
import JsBarcode from 'jsbarcode'
import { ITEM_UNITS } from './data/bookingInventory'
import { BOOKING_UNIT_COLORS, getAvailabilityErrorMessage, useBookingAvailability } from './hooks/useBookingAvailability'
import { getCurrentProfile, loadBookingInventorySummary, loadBookings, removeBooking, saveBooking, setBookingCompleted, signIn, signOut as supabaseSignOut, signUp, updateProfile, type BookingInventorySummary } from './lib/supabase'

// ===== START CUT: context/ThemeContext.jsx =====
const DarkCtx = createContext(false)
function useDark() { return useContext(DarkCtx) }
// Returns a set of theme-aware colors derived from the dark flag
function useTheme() {
  const dm = useDark()
  return {
    dm,
    bg: dm ? '#0C1810' : '#ffffff',
    surface: dm ? '#1D2E22' : '#F5F1E8',
    surface2: dm ? '#233628' : '#EDE8DD',
    card: dm ? '#162218' : '#ffffff',
    pageBg: dm ? '#0C1810' : '#F9FAFB',
    border: dm ? '#2A3E30' : '#E5E7EB',
    text: dm ? '#E8F0EA' : '#1B2E24',
    text2: dm ? '#8BAB96' : '#6B7280',
    text3: dm ? '#5E7D6A' : '#9CA3AF',
    navScrolled: dm ? '#0C1810' : '#ffffff',
    navScrolledShadow: dm ? '0 1px 16px rgba(0,0,0,0.4)' : '0 1px 16px rgba(0,0,0,0.08)',
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
// ===== START CUT: data/constants.js =====
const BG = 'https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=1920&h=1080&fit=crop&auto=format'
const POOL_IMG = 'https://images.unsplash.com/photo-1605537964076-3cb0ea2ff329?w=900&h=700&fit=crop&auto=format'
const BEACH_IMG = 'https://images.unsplash.com/photo-1605538032404-d7f061325b90?w=700&h=500&fit=crop&auto=format'

const GREEN = '#38875C'
const CREAM = '#F5F1E8'
const GOLD = '#D4A017'
const DARK = '#1B2E24'

type View = 'website' | 'booking' | 'login' | 'reservations' | 'profile'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  username: string
}
type AccomTab = 'room' | 'cottage' | 'restaurant' | 'venue'
type CatalogueTab = 'rooms' | 'cottages' | 'restaurant' | 'venues'
type PayMethod = 'credit' | 'debit' | 'gcash' | 'maya' | 'visa' | 'resort'
type PayPlan = 'downpayment' | 'full'
type DownpayOption = 'on-arrival' | 'follow-up'
interface Guest { firstName: string; lastName: string; email: string; phone: string; pax: number }

// Stored booking receipt
interface BookingRecord {
  id: string
  receiptId: string
  createdAt: string
  booking_status?: 'ongoing' | 'completed' | 'cancelled'
  paymentStatus?: 'pending' | 'paid' | 'cancelled'
  category: AccomTab
  g: Guest
  itemId: string
  // room/cottage
  checkIn: string
  checkOut: string
  nights: number
  // restaurant
  resType: string
  resDate: string
  tables: number
  // venue
  eventType: string
  startTime: string
  endTime: string
  addOns: { catering: boolean; rooms: boolean; cottages: boolean }
  specialRequests: string
  method: PayMethod
  total: number
  fee: number
  balance: number
  payPlan: PayPlan
  downpayOption: DownpayOption | null
  unitLabel: string
  userId: string
}

const BOOKING_STEPS = ['Guest Details', 'Accommodation', 'Details', 'Payment', 'Confirm']
const VIEW_STORAGE_KEY = 'palawan-paraiso-view'

// ─── Rooms Data ───────────────────────────────────────────────────────────────
// ===== START CUT: data/rooms.js =====
const ROOMS = [
  {
    id: 'premium',
    name: 'Premium Room',
    price: 9500,
    desc: 'The pinnacle of resort luxury. Sweeping ocean views, a private jacuzzi, and premium island amenities for an unforgettable stay.',
    amenities: ['King Bed', 'Ocean View', 'Jacuzzi', 'Balcony'],
    capacity: 3,
    img: 'https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    price: 6500,
    desc: 'Garden serenity with island elegance. Wake up to lush tropical greenery and the gentle sounds of nature.',
    amenities: ['King Bed', 'Garden View', 'Aircon', 'Mini Bar'],
    capacity: 2,
    img: 'https://images.unsplash.com/photo-1774280954999-9758f11f3d41?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'solo',
    name: 'Solo Room',
    price: 3500,
    desc: 'A perfectly appointed space for solo travellers seeking rest, focus, and island tranquility.',
    amenities: ['Single Bed', 'WiFi', 'Aircon', 'Work Desk'],
    capacity: 1,
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'family',
    name: 'Family Room',
    price: 12500,
    desc: 'Spacious and welcoming for the whole family. Two king beds, a living area, and garden terrace for all.',
    amenities: ['2 King Beds', 'Living Area', 'Kitchen', 'Garden View'],
    capacity: 6,
    img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'couple',
    name: 'Couple Room',
    price: 7500,
    desc: 'Romance and seclusion in paradise. Thoughtfully curated for two with ocean views and intimate amenities.',
    amenities: ['Queen Bed', 'Ocean View', 'Balcony', 'Romantic Setup'],
    capacity: 2,
    img: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&h=380&fit=crop&auto=format',
  },
]

// ─── Cottages Data ────────────────────────────────────────────────────────────
// ===== START CUT: data/cottages.js =====
const COTTAGES = [
  {
    id: 'premium-cottage',
    name: 'Premium Cottage',
    price: 10500,
    desc: 'Ultimate privacy with a private pool, lush gardens, and ocean views.',
    amenities: ['Private Pool', 'Garden', 'BBQ Area', 'Ocean View'],
    capacity: 4,
    img: 'https://images.unsplash.com/photo-1669123547602-46e60bf0eb72?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'open-deluxe',
    name: 'Open Space Deluxe',
    price: 8000,
    desc: 'Embrace the outdoors in this open-air cottage with wide terraces and panoramic resort views.',
    amenities: ['Open Air', 'Wide Terrace', 'Ocean Breeze', 'Garden'],
    capacity: 6,
    img: 'https://images.unsplash.com/photo-1710563138874-4bac91c14e51?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'deluxe-cottage',
    name: 'Deluxe Cottage',
    price: 7000,
    desc: 'A refined retreat nestled among tropical gardens. Perfect for comfort with a natural setting.',
    amenities: ['Garden', 'WiFi', 'Terrace', 'Kitchenette'],
    capacity: 4,
    img: 'https://images.unsplash.com/photo-1689132097047-319d66354205?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'solo-cottage',
    name: 'Solo Cottage',
    price: 4000,
    desc: 'A private sanctuary for the solo explorer tucked away in the gardens.',
    amenities: ['Private Garden', 'Hammock', 'WiFi', 'Aircon'],
    capacity: 1,
    img: 'https://images.unsplash.com/photo-1689308608685-27085e11e640?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'family-cottage',
    name: 'Family Cottage',
    price: 9000,
    desc: 'A spacious family haven with multiple sleeping areas and a large terrace.',
    amenities: ['2 Double Beds', 'Garden', 'Terrace', 'Kitchenette'],
    capacity: 8,
    img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'couple-cottage',
    name: 'Couple Cottage',
    price: 6000,
    desc: 'An intimate garden cottage designed for romance, secluded and surrounded by tropical blooms.',
    amenities: ['Queen Bed', 'Private Garden', 'Romantic Setup', 'Outdoor Bath'],
    capacity: 2,
    img: 'https://images.unsplash.com/photo-1689308608672-511decc38722?w=600&h=380&fit=crop&auto=format',
  },
]

// ─── Restaurant Data ──────────────────────────────────────────────────────────
// ===== START CUT: data/restaurant.js =====
const RESTAURANT_MEALS = [
  {
    id: 'breakfast',
    meal: 'Breakfast',
    time: '6:00 AM – 10:00 AM',
    price: 450,
    desc: 'Start your island morning right. Fresh tropical fruits, Filipino breakfast staples, and international selections.',
    img: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&h=380&fit=crop&auto=format',
    capacity: 80,
  },
  {
    id: 'lunch',
    meal: 'Lunch',
    time: '11:00 AM – 2:30 PM',
    price: 650,
    desc: 'A midday feast with fresh seafood, traditional Filipino dishes, and international cuisine.',
    img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=380&fit=crop&auto=format',
    capacity: 80,
  },
  {
    id: 'dinner',
    meal: 'Dinner',
    time: '6:00 PM – 10:00 PM',
    price: 850,
    desc: 'An elevated dining experience under the stars featuring the finest seafood and island flavors.',
    img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=380&fit=crop&auto=format',
    capacity: 80,
  },
]

const RESERVATION_TYPES = ['Solo', 'Couple', 'Family', 'Group', 'Whole Restaurant']
const WHOLE_REST_EVENTS = ['Birthday', 'Wedding', 'Reunion', 'Corporate Event', 'Private Party', 'Other']

// ─── Venues Data ─────────────────────────────────────────────────────────────
// ===== START CUT: data/venues.js =====
const VENUES = [
  {
    id: 'open-space',
    name: 'Open Space',
    price: 15000,
    desc: 'A breathtaking outdoor venue with sweeping resort views. Perfect for garden weddings and open-air celebrations.',
    capacity: 500,
    amenities: ['Outdoor', 'Scenic View', 'Garden Setting', 'Flexible Layout'],
    img: 'https://images.unsplash.com/photo-1600540520314-cbc1ddc91f3b?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'covered-hall',
    name: 'Covered Event Hall',
    price: 25000,
    desc: 'A grand air-conditioned event hall with a stage, built-in sound system, and elegant interiors.',
    capacity: 300,
    amenities: ['Air-conditioned', 'Stage', 'Sound System', 'LED Lighting'],
    img: 'https://images.unsplash.com/photo-1763616349199-3f753df17883?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'sports-center',
    name: 'Sports Center',
    price: 10000,
    desc: 'State-of-the-art indoor sports facilities with multiple courts, equipment rental, and spectator seating.',
    capacity: 200,
    amenities: ['Indoor Courts', 'Equipment', 'Spectator Seating', 'Locker Rooms'],
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=380&fit=crop&auto=format',
  },
  {
    id: 'sports-field',
    name: 'Sports Field',
    price: 8000,
    desc: 'A sprawling open-air sports field surrounded by lush greenery, ideal for team events and festivities.',
    capacity: 300,
    amenities: ['Open Field', 'Bleachers', 'Night Lighting', 'Parking'],
    img: 'https://images.unsplash.com/photo-1723713297155-12f305c78462?w=600&h=380&fit=crop&auto=format',
  },
]

const VENUE_EVENTS = ['Birthday', 'Wedding', 'Gathering', 'Reunion', 'Corporate Event', 'Other']

// ─── Payment Options ──────────────────────────────────────────────────────────
// ===== START CUT: data/paymentOptions.js =====
const PAY_OPTS: { id: PayMethod; label: string; sub: string; icon: 'card' | 'phone' | 'cash' }[] = [
  { id: 'gcash', label: 'GCash', sub: 'Send via GCash number', icon: 'phone' },
  { id: 'maya', label: 'Maya', sub: 'Send via Maya number', icon: 'phone' },
  { id: 'credit', label: 'Credit Card', sub: 'Visa • Mastercard • JCB', icon: 'card' },
  { id: 'debit', label: 'Debit Card', sub: 'Visa Debit • Mastercard Debit', icon: 'card' },
  { id: 'visa', label: 'Visa', sub: 'Visa credit or debit card', icon: 'card' },
  { id: 'resort', label: 'Resort Own Card', sub: 'Palawan Paraíso loyalty card', icon: 'cash' },
]

// ─── Utilities ────────────────────────────────────────────────────────────────
// ===== START CUT: utils/bookingUtils.js =====
function fmt(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function fmtLong(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
function nextDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}
function calcNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}
function peso(n: number) { return '₱' + n.toLocaleString() }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
function genReceiptId() { return `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}` }
function scrollToSection(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

function getItemName(category: AccomTab, itemId: string) {
  if (category === 'room') return ROOMS.find(r => r.id === itemId)?.name ?? ''
  if (category === 'cottage') return COTTAGES.find(c => c.id === itemId)?.name ?? ''
  if (category === 'restaurant') return RESTAURANT_MEALS.find(m => m.id === itemId)?.meal ?? ''
  return VENUES.find(v => v.id === itemId)?.name ?? ''
}

function calcTotal(category: AccomTab, itemId: string, nights: number, pax: number, resType: string, addOns: { catering: boolean; rooms: boolean; cottages: boolean }) {
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

// ─── Icons ────────────────────────────────────────────────────────────────────
// ===== START CUT: components/icons/Icons.jsx =====
function Chk({ cls = 'w-4 h-4' }: { cls?: string }) {
  return <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5l4 4 7-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ChevL() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ChevR() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Cal() {
  return <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M1.5 6.5h13M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
}
function ICard({ active }: { active?: boolean }) {
  const c = active ? GREEN : '#9CA3AF'
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2" y="4.5" width="16" height="11" rx="2" stroke={c} strokeWidth="1.4" /><path d="M2 8.5h16M5 12h3" stroke={c} strokeWidth="1.4" strokeLinecap="round" /></svg>
}
function IPhone({ active }: { active?: boolean }) {
  const c = active ? GREEN : '#9CA3AF'
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="5.5" y="2" width="9" height="16" rx="2" stroke={c} strokeWidth="1.4" /><circle cx="10" cy="15" r="0.7" fill={c} /></svg>
}
function ICash({ active }: { active?: boolean }) {
  const c = active ? GREEN : '#9CA3AF'
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="10" rx="1.5" stroke={c} strokeWidth="1.4" /><circle cx="10" cy="10" r="2.5" stroke={c} strokeWidth="1.4" /></svg>
}
function DlIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7.5l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IMapPin() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 4.5-6 10-6 10S4 12.5 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" /></svg>
}
function IEnvelope() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function IClock() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IPhoneOutline() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="15" r="0.75" fill="currentColor" /></svg>
}
function IStar() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.472 5.01 5.528.803-4 3.897.944 5.504L10 14.01l-4.944 2.704.944-5.504-4-3.897 5.528-.803L10 1.5z" /></svg>
}
function ILeaf() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M3 17c2-4 5-8 12-9-1 7-5 9-12 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M3 17c1-3 3-6 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function IBed() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2" y="9" width="16" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M2 13h16M6 9V6.5a1 1 0 011-1h6a1 1 0 011 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function ISpa() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M10 3C7 3 4 6 4 10c0 3 2 5 6 6 4-1 6-3 6-6 0-4-3-7-6-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 3v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function IIsland() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M4 14c0 0 2-3 6-3s6 3 6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 11V6M7 8l3-2 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function IInstagram() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="2.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="14.5" cy="5.5" r="0.75" fill="currentColor" /></svg>
}
function IFacebook() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M11.5 6H10a1.5 1.5 0 00-1.5 1.5V10H7l.5 2.5H8.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ITwitter() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M3 15L17 5M3 5l14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 5h5v5M3 10h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IArrowRight() {
  return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IUsers() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M11 12c0-2-1.343-3-3-3S5 10 5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M13.5 12c0-1.5-1-2.5-2.5-2.5M2.5 12c0-1.5 1-2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" /><circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>
}
function IBookmark() {
  return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M5 3h10a1 1 0 011 1v12l-6-4-6 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
}
function IEye({ off = false }: { off?: boolean }) {
  return off ? (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M8.5 8.6A3 3 0 0013.4 13.4M6.3 6.3C4.3 7.6 2.7 10 2.7 10s2.8 5 7.3 5c1.3 0 2.5-.4 3.5-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 5c4.5 0 7.3 5 7.3 5s-.8 1.6-2.2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><path d="M2.7 10S5.5 5 10 5s7.3 5 7.3 5-2.8 5-7.3 5-7.3-5-7.3-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /></svg>
  )
}
function IGoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.252 17.64 11.944 17.64 9.2z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
}
function IFBIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
}
function IIGIcon() {
  return (
    <span className="flex items-center justify-center rounded-md shrink-0" style={{ width: 18, height: 18, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" /></svg>
    </span>
  )
}

// ─── Chip / shared ────────────────────────────────────────────────────────────
// ===== START CUT: components/shared/FormComponents.jsx =====
function Chip({ label }: { label: string }) {
  return <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: '#FDE8E4', color: '#B85050' }}>{label}</span>
}
const ic = 'rounded-lg px-3 py-2 text-sm outline-none w-full placeholder-gray-400 transition-all'
const icSel = 'rounded-lg px-3 py-2 text-sm outline-none w-full transition-all'
// Apply these inline styles alongside ic/icSel classes
function icStyle(surface: string, text: string): React.CSSProperties {
  return { background: surface, color: text }
}

function FLabel({ label, req, helper, children }: { label: string; req?: boolean; helper?: string; children: React.ReactNode }) {
  const { text2 } = useTheme()
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium" style={{ color: text2 }}>{label}{req && <span style={{ color: GREEN }}>*</span>}</label>
      {children}
      {helper && <p className="text-[10px] mt-0.5" style={{ color: text2 }}>{helper}</p>}
    </div>
  )
}

function DateInput({ label, value, onChange, minDate }: { label: string; value: string; onChange: (v: string) => void; minDate?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const { surface, text, text2 } = useTheme()
  return (
    <FLabel label={label} req>
      <div className="relative cursor-pointer rounded-lg" style={{ background: surface }}>
        <span className="block px-3 py-2 text-sm pr-9" style={{ color: value ? text : text2 }}>{value ? fmt(value) : 'dd/mm/yyyy'}</span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><Cal /></span>
        <input ref={ref} type="date" value={value} min={minDate} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </FLabel>
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
// ===== START CUT: components/auth/LoginView.jsx =====
function LoginView({ onBack, onSuccess }: { onBack: () => void; onSuccess: (u: UserProfile) => void | Promise<void> }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [authError, setAuthError] = useState('')
  const { surface, text, text2, card, border, dm } = useTheme()
  const icAuth = 'rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400 transition-all'

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault()
    setAuthError('')
    try {
      const profile = await signIn(username, password)
      if (profile) await onSuccess(profile)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.'
      setAuthError(message.toLowerCase().includes('email not confirmed') ? 'Please confirm your email address before signing in.' : message)
    }
  }

  async function submitSignup(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirmPwd) {
      setAuthError('Passwords do not match.')
      return
    }
    setAuthError('')
    try {
      const profile = await signUp({ firstName, lastName, email, phone, password })
      if (profile) await onSuccess(profile)
      else setAuthError('Check your email to confirm your account.')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account.')
    }
  }

  function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
      <button type="button" onClick={() => setAuthError('Social sign-in is not configured. Please use email and password.')} className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">{icon}{label}</button>
    )
  }
  function Divider({ text }: { text: string }) {
    return (
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{text}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0.24) 100%)' }} />

      {/* Desktop */}
      <div className="hidden md:flex relative z-10 h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-white select-none px-8 relative">
          <button onClick={onBack} className="absolute top-5 left-5 flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
            <ChevL /> Back to Website
          </button>
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h1 className="text-5xl font-bold text-white mt-2 text-center leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
          <p className="text-xl text-white/90 mt-1" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
          <p className="text-white/60 text-[11px] tracking-[0.32em] uppercase mt-4 font-light">Reserve your slice of paradise</p>
        </div>
        <div className="flex items-center justify-center p-5" style={{ width: 440 }}>
          <div className="rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)', background: card, border: `1px solid ${border}` }}>
            <div className="flex-1 min-h-0 overflow-y-auto px-7 py-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD}60, transparent)` }} />
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Palawan Paraíso</p>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${GOLD}60, transparent)` }} />
              </div>
              {authError && <p className="text-[11px] mb-3" style={{ color: '#DC2626' }}>{authError}</p>}
              {mode === 'login' ? (
                <>
                  <div className="mb-5">
                    <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Welcome Back</h2>
                    <p className="text-[11px] mt-1" style={{ color: text2 }}>Sign in to your Palawan account</p>
                  </div>
                  <form onSubmit={submitLogin} className="space-y-3">
                    <FLabel label="Email Address" req><input className={icAuth} style={icStyle(surface, text)} type="email" placeholder="Enter your email" value={username} onChange={e => setUsername(e.target.value)} required /></FLabel>
                    <FLabel label="Password" req>
                      <div className="relative">
                        <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showPwd} /></button>
                      </div>
                    </FLabel>
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded w-3.5 h-3.5 accent-[#38875C]" />
                        <span className="text-[11px]" style={{ color: text2 }}>Remember me</span>
                      </label>
                      <button type="button" className="text-[11px] font-medium hover:underline" style={{ color: GREEN }}>Forgot password?</button>
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 hover:shadow-lg transition-all mt-1" style={{ background: GREEN }}>Sign In</button>
                  </form>
                  <Divider text="or sign up using" />
                  <div className="space-y-2">
                    <SocialBtn icon={<IGoogleIcon />} label="Continue with Google" />
                    <SocialBtn icon={<IFBIcon />} label="Continue with Facebook" />
                    <SocialBtn icon={<IIGIcon />} label="Continue with Instagram" />
                  </div>
                  <p className="text-center text-[11px] mt-5" style={{ color: text2 }}>Don&apos;t have an account? <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign up</button></p>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Create Account</h2>
                    <p className="text-[11px] mt-1" style={{ color: text2 }}>Join Palawan Paraíso Resort &amp; Spa</p>
                  </div>
                  <form onSubmit={submitSignup} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FLabel label="First Name" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Maria" value={firstName} onChange={e => setFirstName(e.target.value)} required /></FLabel>
                      <FLabel label="Last Name" req><input className={icAuth} style={icStyle(surface, text)} placeholder="Santos" value={lastName} onChange={e => setLastName(e.target.value)} required /></FLabel>
                    </div>
                    <FLabel label="Email Address" req><input className={icAuth} style={icStyle(surface, text)} type="email" placeholder="maria@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></FLabel>
                    <FLabel label="Password" req>
                      <div className="relative">
                        <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showPwd} /></button>
                      </div>
                    </FLabel>
                    <FLabel label="Confirm Password" req>
                      <div className="relative">
                        <input className={icAuth + ' pr-10'} style={icStyle(surface, text)} type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
                        <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: text2 }}><IEye off={showConfirm} /></button>
                      </div>
                      {confirmPwd && password !== confirmPwd && <p className="text-[10px]" style={{ color: '#B45555' }}>Passwords do not match</p>}
                    </FLabel>
                    <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 hover:shadow-lg transition-all mt-1" style={{ background: GREEN }}>Create Account</button>
                  </form>
                  <Divider text="or sign up using" />
                  <div className="space-y-2">
                    <SocialBtn icon={<IGoogleIcon />} label="Sign up with Google" />
                    <SocialBtn icon={<IFBIcon />} label="Sign up with Facebook" />
                    <SocialBtn icon={<IIGIcon />} label="Sign up with Instagram" />
                  </div>
                  <p className="text-center text-[11px] mt-5" style={{ color: text2 }}>Already have an account? <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign in</button></p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden relative z-10 flex-col h-full overflow-y-auto safe-top">
        <div className="shrink-0 pt-3 pb-4 px-5 text-center text-white select-none relative">
          <button onClick={onBack} className="absolute left-4 top-4 flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors">
            <ChevL /> Back
          </button>
          <p className="text-[9px] font-medium tracking-[0.28em] uppercase mt-1" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
          <h1 className="text-2xl font-bold text-white leading-tight mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
          <p className="text-sm text-white/85" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
        </div>
        {/* ── Mobile card ── */}
        <div className={`${mode === 'login' ? 'shrink-0' : 'flex-1'} mx-3 mb-3 rounded-2xl shadow-2xl overflow-hidden flex flex-col safe-bottom`} style={{ background: card }}>
          <div className="overflow-y-auto px-5 py-5">
            {/* branding line */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD}60, transparent)` }} />
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Palawan Paraíso</p>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${GOLD}60, transparent)` }} />
            </div>
            {authError && <p className="text-[11px] mb-3" style={{ color: '#DC2626' }}>{authError}</p>}

            {mode === 'login' ? (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Welcome Back</h2>
                <p className="text-[11px] mb-4" style={{ color: text2 }}>Sign in to your Palawan account</p>
                  <form onSubmit={submitLogin} className="space-y-3">
                  <FLabel label="Email Address" req><input className={ic} style={icStyle(surface, text)} type="email" placeholder="Enter your email" value={username} onChange={e => setUsername(e.target.value)} required /></FLabel>
                  <FLabel label="Password" req>
                    <div className="relative">
                      <input className={ic + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text2 }}><IEye off={showPwd} /></button>
                    </div>
                  </FLabel>
                  <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90" style={{ background: GREEN }}>Sign In</button>
                </form>
                <Divider text="or sign in using" />
                <div className="space-y-2">
                  <SocialBtn icon={<IGoogleIcon />} label="Continue with Google" />
                  <SocialBtn icon={<IFBIcon />} label="Continue with Facebook" />
                  <SocialBtn icon={<IIGIcon />} label="Continue with Instagram" />
                </div>
                <p className="text-center text-[11px] mt-4 pb-2" style={{ color: text2 }}>Don&apos;t have an account? <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign up</button></p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Create Account</h2>
                <p className="text-[11px] mb-4" style={{ color: text2 }}>Join Palawan Paraíso Resort &amp; Spa</p>
                <form onSubmit={submitSignup} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FLabel label="First Name" req><input className={ic} style={icStyle(surface, text)} placeholder="Maria" value={firstName} onChange={e => setFirstName(e.target.value)} required /></FLabel>
                    <FLabel label="Last Name" req><input className={ic} style={icStyle(surface, text)} placeholder="Santos" value={lastName} onChange={e => setLastName(e.target.value)} required /></FLabel>
                  </div>
                  <FLabel label="Email" req><input className={ic} style={icStyle(surface, text)} type="email" placeholder="maria@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></FLabel>
                  <FLabel label="Phone"><input className={ic} style={icStyle(surface, text)} placeholder="+63 9XX XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} /></FLabel>
                  <FLabel label="Password" req>
                    <div className="relative">
                      <input className={ic + ' pr-10'} style={icStyle(surface, text)} type={showPwd ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text2 }}><IEye off={showPwd} /></button>
                    </div>
                  </FLabel>
                  <FLabel label="Confirm Password" req>
                    <div className="relative">
                      <input className={ic + ' pr-10'} style={icStyle(surface, text)} type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text2 }}><IEye off={showConfirm} /></button>
                    </div>
                    {confirmPwd && password !== confirmPwd && <p className="text-[10px] mt-1" style={{ color: '#B45555' }}>Passwords do not match</p>}
                  </FLabel>
                  <button type="submit" className="w-full py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90" style={{ background: GREEN }}>Create Account</button>
                </form>
                <Divider text="or sign up using" />
                <div className="space-y-2">
                  <SocialBtn icon={<IGoogleIcon />} label="Sign up with Google" />
                  <SocialBtn icon={<IFBIcon />} label="Sign up with Facebook" />
                  <SocialBtn icon={<IIGIcon />} label="Sign up with Instagram" />
                </div>
                <p className="text-center text-[11px] mt-4 pb-2" style={{ color: text2 }}>Already have an account? <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: GREEN }}>Sign in</button></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Booking Shared Components ────────────────────────────────────────────────
// ===== START CUT: components/booking/Stepper.jsx =====
function Stepper({ cur, steps }: { cur: number; steps: string[] }) {
  const { card, border, text3 } = useTheme()
  return (
    <div className="flex items-start px-3 py-3 shrink-0 border-b" style={{ borderColor: border }}>
      {steps.map((label, i) => {
        const done = cur > i + 1
        const active = cur === i + 1
        const total = steps.length
        return (
          <div key={i} className="flex-1 flex flex-col items-center relative">
            {i > 0 && <div className="absolute z-0 h-[2px]" style={{ top: 13, left: 0, right: '50%', background: cur > i ? GREEN : border }} />}
            {i < total - 1 && <div className="absolute z-0 h-[2px]" style={{ top: 13, left: '50%', right: 0, background: cur > i + 1 ? GREEN : border }} />}
            <div className="relative z-10 rounded-full flex items-center justify-center" style={{ width: 26, height: 26, background: done ? GREEN : card, border: done ? 'none' : `2px solid ${active ? GREEN : border}`, color: done ? 'white' : active ? GREEN : text3, fontSize: 11, fontWeight: 600 }}>
              {done ? <Chk cls="w-3 h-3" /> : i + 1}
            </div>
            <p className="mt-1 text-center leading-tight" style={{ fontSize: 8, color: done || active ? GREEN : text3, fontWeight: done || active ? 600 : 400, maxWidth: 46 }}>{label}</p>
          </div>
        )
      })}
    </div>
  )
}

// ===== START CUT: components/booking/NavFooter.jsx =====
function NavFooter({ step, total, onBack, onNext, nextLabel = 'Continue', disableBack = false, disableNext = false }: {
  step: number; total: number; onBack: () => void; onNext: () => void; nextLabel?: string; disableBack?: boolean; disableNext?: boolean
}) {
  const { border, text2, text3 } = useTheme()
  return (
    <div className="flex items-center justify-between px-4 py-3 shrink-0 border-t" style={{ borderColor: border }}>
      <button onClick={onBack} disabled={disableBack} className="flex items-center gap-1 px-3.5 py-1.5 text-xs rounded-full font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: text2, border: `1px solid ${border}` }}>
        <ChevL /> Back
      </button>
      <span className="text-[11px] font-medium" style={{ color: text3 }}>Step {step} of {total}</span>
      <button onClick={onNext} disabled={disableNext} className="flex items-center gap-1 px-4 py-1.5 text-xs text-white rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: GREEN }}>
        {nextLabel} <ChevR />
      </button>
    </div>
  )
}

// ─── Step 1: Guest Details ────────────────────────────────────────────────────
// ===== START CUT: components/booking/GuestDetails.jsx =====
function S1GuestDetails({ g, setG, onNext }: { g: Guest; setG: (g: Guest) => void; onNext: () => void }) {
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

// ─── Step 2: Accommodation ────────────────────────────────────────────────────
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
function BookingCalendarPopup({ itemId, mode, checkIn, checkOut, onSelect, onClose }: {
  itemId: string
  mode: 'checkin' | 'checkout'
  checkIn: string; checkOut: string
  onSelect: (date: string) => void
  onClose: () => void
}) {
  const { card, surface, border, text, text2, dm } = useTheme()
  const [visibleRange, setVisibleRange] = useState({ from: AVAIL_TODAY, to: nextDay(AVAIL_TODAY) })
  const handleDatesSet = useCallback((info: DatesSetArg) => {
    const from = info.startStr.slice(0, 10)
    const to = info.endStr.slice(0, 10)
    setVisibleRange(current => current.from === from && current.to === to ? current : { from, to })
  }, [])
  const { events: occupiedEvents, loading, error } = useBookingAvailability(itemId, visibleRange.from, visibleRange.to)
  const events = useMemo(() => {
    const background = checkIn && checkOut && checkIn < checkOut
      ? [{ start: checkIn, end: checkOut, display: 'background' as const, color: 'rgba(56,135,92,0.18)' }]
      : []
    return [...occupiedEvents, ...background]
  }, [occupiedEvents, checkIn, checkOut])

  function handleDateClick(info: DateClickArg) {
    const ds = info.dateStr
    if (ds < AVAIL_TODAY) return
    if (mode === 'checkout' && checkIn && ds <= checkIn) return
    onSelect(ds)
  }

  return (
    <div className="fixed inset-0 z-[55] flex" onClick={onClose}>
      <div className="flex w-full flex-col items-center justify-center p-4 md:w-[calc(100%-440px)] md:p-6" onClick={e => e.stopPropagation()}>
        <div className="w-full max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl md:max-h-[90vh]" style={{ background: card, border: `1px solid ${border}`, maxWidth: 520 }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>
                {mode === 'checkin' ? 'Select Check-in Date' : 'Select Check-out Date'}
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: text2 }}>
                {mode === 'checkout' && checkIn
                  ? `Check-in set: ${fmtLong(checkIn)} — now pick check-out`
                  : 'Tap a date on the calendar below'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full flex items-center justify-center text-xs" style={{ width: 28, height: 28, background: surface, color: text2 }}>✕</button>
          </div>
          <div className={`fc-resort fc-resort-booking${dm ? ' fc-resort-dark' : ''}`} style={{ overflowY: 'auto' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={mode === 'checkout' && checkIn ? checkIn : AVAIL_TODAY}
              events={events}
              dateClick={handleDateClick}
              datesSet={handleDatesSet}
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
          {ITEM_UNITS[itemId]?.units.length > 0 && (
            <div className="hidden flex-wrap gap-x-3 gap-y-1 px-4 py-2.5 md:flex" style={{ borderTop: `1px solid ${border}` }}>
              <span className="mb-0.5 w-full text-[9px] font-semibold uppercase tracking-wider" style={{ color: text2 }}>Occupied units</span>
              {ITEM_UNITS[itemId].units.map((unit, idx) => (
                <div key={unit.label} className="flex items-center gap-1">
                  <div className="h-2 w-2 shrink-0 rounded-sm" style={{ background: BOOKING_UNIT_COLORS[idx % BOOKING_UNIT_COLORS.length] }} />
                  <span className="text-[9px]" style={{ color: text2 }}>{unit.label}</span>
                </div>
              ))}
            </div>
          )}
          {loading && <p className="px-4 py-2 text-[10px]" style={{ color: text2 }}>Loading live availability…</p>}
          {error && <p role="alert" className="px-4 py-2 text-[10px] text-red-600">{error}</p>}
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
  const availabilityFrom = category === 'room' || category === 'cottage'
    ? details.checkIn || AVAIL_TODAY
    : details.resDate || AVAIL_TODAY
  const availabilityTo = category === 'room' || category === 'cottage'
    ? details.checkOut && details.checkOut > availabilityFrom ? details.checkOut : nextDay(availabilityFrom)
    : nextDay(availabilityFrom)
  const availability = useBookingAvailability(itemId, availabilityFrom, availabilityTo)

  useEffect(() => {
    if (!details.unitLabel || availability.loading || availability.error) return
    if (category !== 'room' && category !== 'cottage' && category !== 'venue') return
    const from = category === 'room' || category === 'cottage' ? availabilityFrom : details.resDate
    const to = category === 'room' || category === 'cottage' ? availabilityTo : nextDay(details.resDate)
    const timeAvailable = category === 'venue' && (!details.startTime || !details.endTime)
      ? true
      : availability.isUnitAvailable(details.unitLabel, from, to, details.startTime, details.endTime)
    if (!from || !to || !timeAvailable) {
      up({ unitLabel: '' })
    }
  }, [category, details.unitLabel, details.resDate, details.startTime, details.endTime, availability.loading, availability.error, availability.records])

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
                    const unitRangeEnd = details.checkOut && details.checkOut > details.checkIn ? details.checkOut : nextDay(details.checkIn)
                    const availabilityKnown = !availability.loading && !availability.error
                    const avail = availabilityKnown && availability.isUnitAvailable(unit.label, details.checkIn, unitRangeEnd)
                    const unavailable = availabilityKnown && !avail
                    const sel = details.unitLabel === unit.label
                    return (
                      <button key={unit.label} disabled={!avail} onClick={() => up({ unitLabel: avail ? unit.label : details.unitLabel })}
                        className="px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all"
                        style={{ border: `1.5px solid ${sel ? GREEN : avail ? `${GREEN}55` : unavailable ? '#DC262650' : border}`, background: sel ? `${GREEN}18` : avail ? `${GREEN}0A` : 'transparent', color: unavailable ? '#DC2626' : text, cursor: avail ? 'pointer' : 'not-allowed' }}>
                        <div className="font-semibold">{unit.label}</div>
                        {avail
                          ? <div className="text-[9px] mt-0.5 font-normal" style={{ color: GREEN }}>Available</div>
                          : <div className="text-[9px] mt-0.5 font-normal" style={{ color: unavailable ? '#DC2626' : text2 }}>
                            {availability.loading ? 'Checking…' : availability.error ? 'Availability unknown' : 'Unavailable'}
                          </div>
                        }
                        {unit.group && <div className="text-[8px] mt-0.5 opacity-60">{unit.group}</div>}
                      </button>
                    )
                  })}
                </div>
                {availability.loading && <p className="text-[10px]" style={{ color: text2 }}>Checking live availability…</p>}
                {availability.error && <p role="alert" className="text-[10px] text-red-600">{availability.error}</p>}
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
                  <button type="button" className="px-2.5 py-0.5 text-[11px] leading-snug hover:bg-black/10" style={{ color: text2 }} onClick={() => up({ tables: Math.min(ITEM_UNITS[itemId]?.units.length ?? 1, details.tables + 1) })}>▲</button>
                  <button type="button" className="px-2.5 py-0.5 text-[11px] leading-snug hover:bg-black/10" style={{ color: text2 }} onClick={() => up({ tables: Math.max(1, details.tables - 1) })}>▼</button>
                </div>
              </div>
            </FLabel>
          </div>
          {details.resDate && (() => {
            const cfg = ITEM_UNITS[itemId]
            if (!cfg) return null
            const groups = Array.from(new Set(cfg.units.map(u => u.group ?? 'Tables')))
            return (
              <div className="rounded-xl p-3 space-y-1" style={{ background: surface }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: text2 }}>Table Availability</p>
                {groups.map(grp => {
                  const grpUnits = cfg.units.filter(u => (u.group ?? 'Tables') === grp)
                  const availabilityKnown = !availability.loading && !availability.error
                  const availCount = availabilityKnown
                    ? grpUnits.filter(unit => availability.isUnitAvailable(unit.label, details.resDate, nextDay(details.resDate))).length
                    : null
                  return <div key={grp} className="flex justify-between text-xs"><span style={{ color: text2 }}>{grp} tables</span><span className="font-medium" style={{ color: availCount === 0 ? '#DC2626' : availCount === null ? text2 : GREEN }}>{availCount === null ? 'Availability unknown' : `${availCount}/${grpUnits.length} available`}</span></div>
                })}
                {availability.loading && <p className="text-[10px]" style={{ color: text2 }}>Checking live availability…</p>}
                {availability.error && <p role="alert" className="text-[10px] text-red-600">{availability.error}</p>}
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
          return (
            <div>
              <p className="text-[11px] font-medium mb-2" style={{ color: text2 }}>Select Unit</p>
              <div className="grid grid-cols-2 gap-1.5">
              {allUnits.map(unit => {
                const availabilityKnown = !availability.loading && !availability.error
                const avail = availabilityKnown
                  && ((!details.startTime || !details.endTime)
                    || availability.isUnitAvailable(unit.label, details.resDate, nextDay(details.resDate), details.startTime, details.endTime))
                const unavailable = availabilityKnown && !avail
                const sel = details.unitLabel === unit.label
                  return (
                    <button key={unit.label} disabled={!avail} onClick={() => up({ unitLabel: unit.label })}
                      className="px-2 py-2 rounded-lg text-xs font-medium text-left transition-all"
                      style={{ border: `1.5px solid ${sel ? GREEN : avail ? `${GREEN}50` : unavailable ? '#DC262650' : border}`, background: sel ? `${GREEN}18` : avail ? `${GREEN}08` : 'transparent', color: unavailable ? '#DC2626' : text, opacity: avail ? 1 : 0.7, cursor: avail ? 'pointer' : 'not-allowed' }}>
                      <div>{unit.label}</div>
                      {!avail && <div className="text-[9px] mt-0.5" style={{ color: unavailable ? '#DC2626' : text2 }}>
                        {availability.loading ? 'Checking…' : availability.error ? 'Availability unknown' : 'Occupied'}
                      </div>}
                    </button>
                  )
                })}
              </div>
              {availability.loading && <p className="text-[10px] mt-1" style={{ color: text2 }}>Checking live availability…</p>}
              {availability.error && <p role="alert" className="text-[10px] mt-1 text-red-600">{availability.error}</p>}
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

// ─── Step 4: Payment ──────────────────────────────────────────────────────────
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
function S5Confirm({ category, itemId, g, details, method, total, payPlan, downpayOption, onBack, onNext, isSubmitting, error }: {
  category: AccomTab; itemId: string; g: Guest
  details: DetailsState; method: PayMethod; total: number
  payPlan: PayPlan; downpayOption: DownpayOption | null
  onBack: () => void; onNext: () => void
  isSubmitting: boolean; error: string | null
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
      {error && <p role="alert" className="px-5 pb-2 text-[11px] text-red-600">{error}</p>}
      <NavFooter step={5} total={5} onBack={onBack} onNext={onNext} nextLabel={isSubmitting ? 'Saving…' : 'Confirm &amp; Pay'} disableBack={isSubmitting} disableNext={isSubmitting} />
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
  const receiptId = booking.receiptId || booking.id

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
          <p className="text-[10px] opacity-70">#{receiptId}</p>
        </div>
        <div className="px-4 py-3 text-center" style={{ background: surface }}>
          <ReceiptBarcode value={receiptId} />
          <p className="text-[10px] font-mono font-bold tracking-widest mt-1" style={{ color: text2 }}>{receiptId}</p>
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

function ReceiptBarcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current) return
    JsBarcode(ref.current, value, {
      format: 'CODE128',
      displayValue: false,
      height: 48,
      margin: 0,
      background: 'transparent',
      lineColor: '#1B2E24',
    })
  }, [value])

  return <svg ref={ref} className="w-full" style={{ height: 48, maxWidth: 240 }} aria-label={`Barcode for receipt ${value}`} />
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
function BookingLoginGate({ onBack, onSuccess }: { onBack: () => void; onSuccess: (u: UserProfile) => void | Promise<void> }) {
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
  const [authError, setAuthError] = useState('')
  const { surface, text, text2, border } = useTheme()
  const icAuth = 'rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400 transition-all'

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault()
    setAuthError('')
    try {
      const profile = await signIn(username, password)
      if (profile) await onSuccess(profile)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.'
      setAuthError(message.toLowerCase().includes('email not confirmed') ? 'Please confirm your email address before signing in.' : message)
    }
  }

  async function submitSignup(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirmPwd) {
      setAuthError('Passwords do not match.')
      return
    }
    setAuthError('')
    try {
      const profile = await signUp({ firstName, lastName, email, phone, password })
      if (profile) await onSuccess(profile)
      else setAuthError('Check your email to confirm your account.')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account.')
    }
  }

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
      {authError && <p className="text-[11px] mb-2" style={{ color: '#DC2626' }}>{authError}</p>}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('login')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: mode === 'login' ? GREEN : surface, color: mode === 'login' ? '#fff' : text2 }}>Sign In</button>
        <button onClick={() => setMode('signup')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: mode === 'signup' ? GREEN : surface, color: mode === 'signup' ? '#fff' : text2 }}>Register</button>
      </div>
      {mode === 'login' ? (
        <form onSubmit={submitLogin} className="space-y-2">
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
        <form onSubmit={submitSignup} className="space-y-2">
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
        <button type="button" onClick={() => setAuthError('Social sign-in is not configured. Please use email and password.')} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${border}`, color: text, background: 'transparent' }}>
          <IGoogleIcon /> Continue with Google
        </button>
        <button type="button" onClick={() => setAuthError('Social sign-in is not configured. Please use email and password.')} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${border}`, color: text, background: 'transparent' }}>
          <IFBIcon /> Continue with Facebook
        </button>
        <button type="button" onClick={() => setAuthError('Social sign-in is not configured. Please use email and password.')} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${border}`, color: text, background: 'transparent' }}>
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
  onBookingComplete: (b: BookingRecord) => Promise<BookingRecord>
  onViewReservations: () => void
  user: UserProfile | null
  onLoginSuccess: (u: UserProfile) => void | Promise<void>
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const bookingRequestId = useRef(genId())

  const total = calcTotal(localCategory, itemId, calcNights(details.checkIn, details.checkOut), g.pax, details.resType, details.addOns)
  const feeAmt = payPlan === 'full' ? total : Math.round(total * 0.3)
  const balAmt = total - feeAmt
  const fee = feeAmt
  const bal = balAmt

  async function handleConfirm() {
    if (!user) {
      setLoginGate(true)
      return
    }

    const record: BookingRecord = {
      id: bookingRequestId.current,
      receiptId: '',
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
      userId: user.username,
    }
    setIsSubmitting(true)
    setBookingError(null)
    try {
      const saved = await onBookingComplete(record)
      setConfirmedBooking(saved)
      setStep(6)
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Unable to save this booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const next = () => {
    setBookingError(null)
    if (step === 1) {
      if (!g.firstName.trim() || !g.lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email.trim()) || !g.phone.trim()) {
        setBookingError('Enter the guest name, a valid email address, and phone number to continue.')
        return
      }
    }
    if (step === 3) {
      if (localCategory === 'room' || localCategory === 'cottage') {
        if (!details.checkIn || !details.checkOut || details.checkIn < AVAIL_TODAY || details.checkOut <= details.checkIn || !details.unitLabel) {
          setBookingError('Select valid stay dates and an available unit.')
          return
        }
        const selected = localCategory === 'room' ? ROOMS.find(item => item.id === itemId) : COTTAGES.find(item => item.id === itemId)
        if (!selected || g.pax > selected.capacity) {
          setBookingError('The selected accommodation cannot fit this number of guests.')
          return
        }
      } else if (localCategory === 'restaurant') {
        if (!details.resDate || details.resDate < AVAIL_TODAY || details.tables < 1 || details.tables > (ITEM_UNITS[itemId]?.units.length ?? 0)) {
          setBookingError('Select a valid restaurant date and an available table count.')
          return
        }
      } else if (!details.resDate || details.resDate < AVAIL_TODAY || !details.unitLabel
        || !details.startTime || !details.endTime || details.endTime <= details.startTime) {
        setBookingError('Select an available venue, event date, and valid start/end times.')
        return
      }
      if (!user) { setLoginGate(true); return }
    }
    if (step === 4 && payPlan === 'downpayment' && !downpayOption) {
      setBookingError('Select how you will pay the remaining balance.')
      return
    }
    if (step === 5) { void handleConfirm(); return }
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
          {bookingError && step !== 5 && !loginGate && <p role="alert" className="px-5 py-2 text-[11px] text-red-600">{bookingError}</p>}
          {loginGate
            ? <BookingLoginGate onBack={() => setLoginGate(false)} onSuccess={async u => { await onLoginSuccess(u); setLoginGate(false); setStep(4) }} />
            : <>
              {step === 1 && <S1GuestDetails g={g} setG={setG} onNext={next} />}
              {step === 2 && <S2Accommodation localCategory={localCategory} setLocalCategory={setLocalCategory} itemId={itemId} setItemId={id => { setItemId(id); setDetails(current => ({ ...current, unitLabel: '' })) }} onBack={back} onNext={next} />}
              {step === 3 && <S3Details category={localCategory} itemId={itemId} g={g} details={details} setDetails={setDetails} onBack={back} onNext={next} />}
              {step === 4 && <S4Payment method={method} setMethod={setMethod} phone={phone} setPhone={setPhone} total={total} payPlan={payPlan} setPayPlan={setPayPlan} downpayOption={downpayOption} setDownpayOption={setDownpayOption} onBack={back} onNext={next} />}
              {step === 5 && <S5Confirm category={localCategory} itemId={itemId} g={g} details={details} method={method} total={total} payPlan={payPlan} downpayOption={downpayOption} onBack={back} onNext={next} isSubmitting={isSubmitting} error={bookingError} />}
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
        <div className="flex-1 mx-3 mb-3 rounded-2xl shadow-2xl overflow-hidden flex flex-col safe-bottom" style={{ background: '#ffffff' }}>
          {!loginGate && step < 6 && <Stepper cur={step} steps={dynamicSteps} />}
          {bookingError && step !== 5 && !loginGate && <p role="alert" className="px-5 py-2 text-[11px] text-red-600">{bookingError}</p>}
          {loginGate
            ? <BookingLoginGate onBack={() => setLoginGate(false)} onSuccess={async u => { await onLoginSuccess(u); setLoginGate(false); setStep(4) }} />
            : <>
              {step === 1 && <S1GuestDetails g={g} setG={setG} onNext={next} />}
              {step === 2 && <S2Accommodation localCategory={localCategory} setLocalCategory={setLocalCategory} itemId={itemId} setItemId={id => { setItemId(id); setDetails(current => ({ ...current, unitLabel: '' })) }} onBack={back} onNext={next} />}
              {step === 3 && <S3Details category={localCategory} itemId={itemId} g={g} details={details} setDetails={setDetails} onBack={back} onNext={next} />}
              {step === 4 && <S4Payment method={method} setMethod={setMethod} phone={phone} setPhone={setPhone} total={total} payPlan={payPlan} setPayPlan={setPayPlan} downpayOption={downpayOption} setDownpayOption={setDownpayOption} onBack={back} onNext={next} />}
              {step === 5 && <S5Confirm category={localCategory} itemId={itemId} g={g} details={details} method={method} total={total} payPlan={payPlan} downpayOption={downpayOption} onBack={back} onNext={next} isSubmitting={isSubmitting} error={bookingError} />}
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
            <Row l="Payment Plan" v={(b.payPlan ?? 'downpayment') === 'full' ? 'Pay in Full' : b.downpayOption === 'on-arrival' ? 'Pay on Arrival' : 'Follow-up Payment'} />
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="text-xs" style={{ color: bt3 }}>Status</span>
              <span className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full" style={b.paymentStatus === 'paid' ? { background: '#DCFCE7', color: '#16A34A' } : { background: '#FEF3C7', color: '#D97706' }}>
                {b.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
              </span>
            </div>
            <Row l={(b.payPlan ?? 'downpayment') === 'full' ? 'Amount Due' : 'Downpayment Due'} v={peso(b.fee)} />
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

// ===== START CUT: components/sections/Navbar.jsx =====
function Navbar({ scrolled, onBook, onSignIn, onOpenProfile, onLogout, onReservations, reservationCount, user, toggleDark }: {
  scrolled: boolean; onBook: () => void; onSignIn: () => void
  onOpenProfile: () => void; onLogout: () => void
  onReservations: () => void; reservationCount: number
  user: UserProfile | null; toggleDark: () => void
}) {
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
// ===== START CUT: components/sections/Hero.jsx =====
function HeroSection({ onBook }: { onBook: () => void }) {
  return (
    <section id="home" className="-mt-[58px] min-h-screen relative flex flex-col">
      <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 50%, rgba(27,46,36,0.55) 100%)' }} />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 pt-[58px]">
        <p className="text-[10px] sm:text-xs font-medium tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>✦ Palawan, Philippines ✦</p>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Palawan Paraíso</h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Resort &amp; Spa</p>
        <p className="text-white/65 text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-8 sm:mb-10 font-light">Reserve your slice of paradise</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
          <button onClick={onBook} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-xl" style={{ background: GREEN }}>
            Book Now <IArrowRight />
          </button>
          <button onClick={() => scrollToSection('catalogue')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:bg-white/20" style={{ border: '1.5px solid rgba(255,255,255,0.6)' }}>
            Explore Catalogue
          </button>
        </div>
      </div>
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-1 text-white/50">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 animate-bounce" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
// ===== START CUT: components/sections/About.jsx =====
function AboutSection() {
  const { bg, surface, text, text2, text3 } = useTheme()
  const stats = [{ value: '50+', label: 'Rooms & Cottages' }, { value: '10K+', label: 'Happy Guests' }, { value: '8', label: 'Years of Service' }, { value: '4.9', label: 'Customer Rating' }]
  const features = [
    { icon: <ILeaf />, title: 'Nature-Inspired Design', desc: "Architecture seamlessly woven into Palawan's lush tropical landscape." },
    { icon: <IBed />, title: 'Rooms & Cottages', desc: 'Premium, Deluxe, Solo, Family, and Couple accommodations for every guest.' },
    { icon: <ISpa />, title: 'Restaurant & Venues', desc: 'Signature dining and event spaces for gatherings, weddings, and celebrations.' },
    { icon: <IIsland />, title: 'Island Experience', desc: 'Discover pristine beaches, crystal waters, and guided island adventures.' },
  ]

  return (
    <section id="about" className="py-20 lg:py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={POOL_IMG} alt="Palawan Paraíso pool" className="w-full h-80 lg:h-[460px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-44 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-white hidden lg:block">
              <img src={BEACH_IMG} alt="Palawan beach" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:pl-4">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>About Us</p>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Welcome to<br />Palawan Paraíso</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: text2 }}>Nestled on the pristine shores of Palawan, the Philippines' last frontier, Palawan Paraíso Resort &amp; Spa is a sanctuary where luxury meets nature. Since 2016, we have been the premier destination for travellers seeking an unparalleled island escape.</p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: text2 }}>From Premium and Deluxe rooms to Family and Couple cottages, our signature restaurant, versatile event venues, and curated island experiences — every detail has been thoughtfully crafted to ensure your stay is nothing short of extraordinary.</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0" style={{ color: GREEN }}>{f.icon}</div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: text }}>{f.title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: text3 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(s => (
                <div key={s.label} className="text-center rounded-xl py-3 px-2" style={{ background: surface }}>
                  <p className="text-xl font-bold" style={{ color: GREEN, fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
                  <p className="text-[9px] mt-0.5 leading-tight font-medium" style={{ color: text2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Gallery & Review data per item ──────────────────────────────────────────
const ITEM_GALLERIES: Record<string, string[]> = {
  premium:         ['https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1587985064135-0366536eab42?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=900&h=600&fit=crop'],
  deluxe:          ['https://images.unsplash.com/photo-1774280954999-9758f11f3d41?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&h=600&fit=crop'],
  solo:            ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop'],
  family:          ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=600&fit=crop'],
  couple:          ['https://images.unsplash.com/photo-1559599101-f09722fb4948?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop'],
  'premium-cottage':['https://images.unsplash.com/photo-1669123547602-46e60bf0eb72?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=900&h=600&fit=crop'],
  'open-deluxe':   ['https://images.unsplash.com/photo-1710563138874-4bac91c14e51?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&h=600&fit=crop'],
  'deluxe-cottage':['https://images.unsplash.com/photo-1689132097047-319d66354205?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1515263487990-61b07816b324?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1464146072230-91cabc968266?w=900&h=600&fit=crop'],
  'solo-cottage':  ['https://images.unsplash.com/photo-1689308608685-27085e11e640?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900&h=600&fit=crop'],
  'family-cottage':['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&h=600&fit=crop'],
  'couple-cottage':['https://images.unsplash.com/photo-1689308608672-511decc38722?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1534595038511-9f219fe0c979?w=900&h=600&fit=crop'],
  breakfast:       ['https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&h=600&fit=crop'],
  lunch:           ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1544025162-d76694265947?w=900&h=600&fit=crop'],
  dinner:          ['https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1559847844-5315695dadae?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1600891964092-4316c288032e?w=900&h=600&fit=crop'],
  'open-space':    ['https://images.unsplash.com/photo-1600540520314-cbc1ddc91f3b?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&h=600&fit=crop'],
  'covered-hall':  ['https://images.unsplash.com/photo-1763616349199-3f753df17883?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1478147427282-58a87a5acbed?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&h=600&fit=crop'],
  'sports-center': ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&h=600&fit=crop'],
  'sports-field':  ['https://images.unsplash.com/photo-1723713297155-12f305c78462?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1551958219-acbc595d6e64?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1540747913346-19212a4b423e?w=900&h=600&fit=crop'],
}

interface ReviewEntry { name: string; rating: number; date: string; comment: string; avatar: string }
const ITEM_REVIEWS: Record<string, ReviewEntry[]> = {
  premium: [
    { name: 'Maria Santos', rating: 5, date: 'March 2025', avatar: 'MS', comment: 'Absolutely breathtaking! The jacuzzi with ocean views was unreal. We will definitely be back for our anniversary.' },
    { name: 'James Reyes', rating: 5, date: 'January 2025', avatar: 'JR', comment: 'The service matched the incredible views. Every detail felt luxurious. Worth every peso.' },
    { name: 'Ana Cruz', rating: 4, date: 'December 2024', avatar: 'AC', comment: 'Stunning room and amazing staff. The balcony sunsets were something else entirely.' },
  ],
  deluxe: [
    { name: 'Carlo Mendoza', rating: 5, date: 'February 2025', avatar: 'CM', comment: 'Waking up to the garden every morning was so peaceful. Clean, comfortable, and beautifully designed.' },
    { name: 'Lia Torres', rating: 4, date: 'November 2024', avatar: 'LT', comment: 'Great value for the price. The garden view from bed is stunning. Mini bar was well-stocked.' },
  ],
  solo: [
    { name: 'Ben Lim', rating: 5, date: 'April 2025', avatar: 'BL', comment: 'Perfect for solo travel. Quiet, cozy, and everything I needed. The work desk was a nice touch.' },
    { name: 'Sofia Tan', rating: 4, date: 'March 2025', avatar: 'ST', comment: 'Clean and comfortable. Great WiFi for remote work. Will definitely return.' },
  ],
  family: [
    { name: 'The Dela Cruz Family', rating: 5, date: 'April 2025', avatar: 'DC', comment: 'The kids loved the garden terrace! Plenty of space for all 6 of us. Staff was incredibly helpful.' },
    { name: 'Rosa Aquino', rating: 5, date: 'February 2025', avatar: 'RA', comment: 'Spacious and comfortable for our whole family. The kitchen made breakfast mornings so easy.' },
  ],
  couple: [
    { name: 'Marco & Isla', rating: 5, date: 'March 2025', avatar: 'MI', comment: 'The romantic setup was perfect for our honeymoon. Ocean views from bed — absolutely dreamy.' },
    { name: 'Javier Ramos', rating: 5, date: 'January 2025', avatar: 'JR', comment: 'Surprised my wife here for our anniversary. She cried happy tears. The resort exceeded every expectation.' },
  ],
  'premium-cottage': [
    { name: 'Diego Flores', rating: 5, date: 'April 2025', avatar: 'DF', comment: 'Having a private pool all to ourselves was incredible. The BBQ area made our evenings perfect.' },
    { name: 'Camille Reyes', rating: 5, date: 'March 2025', avatar: 'CR', comment: 'Stunning cottage with impeccable privacy. Felt like our own private island resort.' },
  ],
  'open-deluxe': [
    { name: 'Nathan Park', rating: 4, date: 'February 2025', avatar: 'NP', comment: 'The open-air design was refreshing and unique. Ocean breeze all day. A real gem.' },
    { name: 'Hannah Lee', rating: 5, date: 'January 2025', avatar: 'HL', comment: 'Waking up to the breeze and panoramic views — nothing compares. Absolutely loved it.' },
  ],
  'deluxe-cottage': [
    { name: 'Petra Santos', rating: 5, date: 'March 2025', avatar: 'PS', comment: 'The tropical garden setting made every moment magical. Great kitchenette for morning coffee.' },
    { name: 'Ray Villanueva', rating: 4, date: 'February 2025', avatar: 'RV', comment: 'Comfortable and private. The terrace was our favourite spot to relax in the evenings.' },
  ],
  'solo-cottage': [
    { name: 'Yuki Tanaka', rating: 5, date: 'April 2025', avatar: 'YT', comment: 'Perfect solo retreat. The hammock in the private garden was where I spent most of my time.' },
  ],
  'family-cottage': [
    { name: 'The Batungbakal Family', rating: 5, date: 'March 2025', avatar: 'TB', comment: 'Huge space for our big family. The large terrace was our dining room every evening. Perfect.' },
    { name: 'Grace Lim', rating: 4, date: 'December 2024', avatar: 'GL', comment: 'Enough room for everyone. Kids loved the garden. Will book again for the holidays.' },
  ],
  'couple-cottage': [
    { name: 'Alicia & Paolo', rating: 5, date: 'February 2025', avatar: 'AP', comment: 'The outdoor bath surrounded by tropical flowers was the most romantic experience of our lives.' },
    { name: 'Tanya Go', rating: 5, date: 'January 2025', avatar: 'TG', comment: 'So secluded and intimate. The private garden with blooming flowers was breathtaking.' },
  ],
  breakfast: [
    { name: 'Leo Bautista', rating: 5, date: 'April 2025', avatar: 'LB', comment: 'Best breakfast spread I have ever had at a resort. The tropical fruits were so fresh and delicious.' },
    { name: 'Mia Santos', rating: 4, date: 'March 2025', avatar: 'MS', comment: 'Great variety with Filipino and international options. Coffee was excellent.' },
  ],
  lunch: [
    { name: 'Chris Navarro', rating: 5, date: 'March 2025', avatar: 'CN', comment: 'The seafood at lunch was incredibly fresh. Kinilaw and grilled fish were absolutely divine.' },
    { name: 'Karen Uy', rating: 5, date: 'February 2025', avatar: 'KU', comment: 'Loved the traditional Filipino spread. Every dish was bursting with flavor and love.' },
  ],
  dinner: [
    { name: 'Paolo Herrera', rating: 5, date: 'April 2025', avatar: 'PH', comment: 'Dinner under the stars with the finest seafood. This was the highlight of our entire trip.' },
    { name: 'Isabel Ramos', rating: 5, date: 'March 2025', avatar: 'IR', comment: 'Romantic and refined. The food quality rivaled top Manila restaurants. Truly exceptional.' },
    { name: 'Marcus Tan', rating: 4, date: 'January 2025', avatar: 'MT', comment: 'Great atmosphere and flavors. The grilled lobster was the best I have ever tasted.' },
  ],
  'open-space': [
    { name: 'Wedding Planner PH', rating: 5, date: 'March 2025', avatar: 'WP', comment: 'Hosted a 300-guest garden wedding here. The scenic backdrop was everything our couple dreamed of.' },
    { name: 'Events by Claudia', rating: 5, date: 'February 2025', avatar: 'EC', comment: 'Stunning venue. The resort team was professional and accommodating throughout the event.' },
  ],
  'covered-hall': [
    { name: 'Samantha Diaz', rating: 5, date: 'April 2025', avatar: 'SD', comment: 'Perfect for our corporate event. Sound system was excellent and the LED lighting made it magical.' },
    { name: 'Reunion Group 2025', rating: 5, date: 'March 2025', avatar: 'RG', comment: 'Air-conditioning was great, stage setup was professional. Highly recommend for large gatherings.' },
  ],
  'sports-center': [
    { name: 'Coach Rivera', rating: 5, date: 'February 2025', avatar: 'CR', comment: 'Top-notch indoor courts and equipment. Perfect for our team tournament. Staff was very helpful.' },
    { name: 'Active Palawan', rating: 4, date: 'January 2025', avatar: 'AP', comment: 'Clean facilities with great locker rooms. Spectator seating was comfortable and well-positioned.' },
  ],
  'sports-field': [
    { name: 'Team Katipunan', rating: 5, date: 'March 2025', avatar: 'TK', comment: 'Night lighting made our evening tournament so much fun. The field is well-maintained and spacious.' },
    { name: 'Events Manila', rating: 4, date: 'February 2025', avatar: 'EM', comment: 'Great open-air venue. Bleachers provided good visibility for spectators. Easy parking too.' },
  ],
}

// ─── Unit occupancy data ──────────────────────────────────────────────────────
function palawanToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())
}
const AVAIL_TODAY = palawanToday()

function getAvailInfo(itemId: string, summary: Record<string, BookingInventorySummary>): { label: string; status: AvailStatus } {
  const info = summary[itemId]
  if (!info) return { label: 'Availability unknown', status: 'Unknown' }
  if (info.available_units === 0) return { label: 'Full', status: 'Full' }
  if (info.available_units === info.total_units) return { label: 'Available', status: 'Available' }
  return {
    label: `${info.available_units} ${info.unit_type}${info.available_units !== 1 ? 's' : ''} available`,
    status: info.available_units / info.total_units <= 0.4 ? 'Limited' : 'Available',
  }
}

function AvailabilityCalendar({ itemId }: { itemId: string }) {
  const cfg = ITEM_UNITS[itemId]
  if (!cfg) return null
  const { dm, surface, border, text, text2, text3 } = useTheme()
  const [visibleRange, setVisibleRange] = useState({ from: AVAIL_TODAY, to: nextDay(AVAIL_TODAY) })
  const handleDatesSet = useCallback((info: DatesSetArg) => {
    const from = info.startStr.slice(0, 10)
    const to = info.endStr.slice(0, 10)
    setVisibleRange(current => current.from === from && current.to === to ? current : { from, to })
  }, [])
  const { events, loading, error } = useBookingAvailability(itemId, visibleRange.from, visibleRange.to)

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: text3 }}>Availability Calendar</p>
      <div className={`rounded-xl overflow-hidden fc-resort${dm ? ' fc-resort-dark' : ''}`} style={{ background: surface, border: `1px solid ${border}` }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate={AVAIL_TODAY}
          events={events}
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          datesSet={handleDatesSet}
          height="auto"
          dayMaxEvents={3}
          eventDisplay="block"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          dayCellClassNames={info => info.dateStr === AVAIL_TODAY ? ['fc-resort-today'] : []}
        />
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5" style={{ borderTop: `1px solid ${border}` }}>
          {cfg.units.map((unit, idx) => (
            <div key={unit.label} className="flex items-center gap-1.5">
              <div className="rounded-sm w-2.5 h-2.5 shrink-0" style={{ background: BOOKING_UNIT_COLORS[idx % BOOKING_UNIT_COLORS.length] }} />
              <span className="text-[9px]" style={{ color: text2 }}>{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
      {loading && <p className="mt-1 text-[10px]" style={{ color: text2 }}>Loading live availability…</p>}
      {error && <p role="alert" className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  )
}

interface CardDetailItem {
  id: string; name: string; img: string; desc: string
  price: number; priceUnit: string; capacity: number
  amenities: string[]; availability: AvailStatus
  category: AccomTab
}

function CardDetailModal({ item, onClose, onReserve }: { item: CardDetailItem; onClose: () => void; onReserve: () => void }) {
  const { card, surface, border, text, text2, text3 } = useTheme()
  const [photoIdx, setPhotoIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const photos = ITEM_GALLERIES[item.id] ?? [item.img]
  const reviews = ITEM_REVIEWS[item.id] ?? []
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0

  function Stars({ n, size = 12 }: { n: number; size?: number }) {
    return (
      <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill={i <= n ? GOLD : 'none'} stroke={i <= n ? GOLD : '#D1D5DB'} strokeWidth="1">
            <path d="M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 7.8 3.4 9.2l.5-3L1.7 4.1l3-.4z" />
          </svg>
        ))}
      </span>
    )
  }

  return (
    <>
    {lightboxOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.93)' }} onClick={() => setLightboxOpen(false)}>
        <img src={photos[photoIdx]} alt="" className="rounded-lg object-contain" style={{ maxWidth: '95vw', maxHeight: '90vh' }} />
        <button className="absolute top-4 right-4 rounded-full flex items-center justify-center text-white text-sm" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)' }} onClick={() => setLightboxOpen(false)}>✕</button>
        {photos.length > 1 && <>
          <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>}
        <div className="absolute bottom-4 text-white/70 text-xs">{photoIdx + 1} / {photos.length}</div>
      </div>
    )}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}`, maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>

        {/* Main photo — click to view full */}
        <div className="relative shrink-0 cursor-zoom-in" style={{ height: 260 }} onClick={() => setLightboxOpen(true)}>
          <img src={photos[photoIdx]} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
          {/* Close */}
          <button onClick={onClose} className="absolute top-3 right-3 rounded-full text-white flex items-center justify-center transition-colors hover:bg-black/40" style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.35)' }}>✕</button>
          {/* Availability + price */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <AvailBadge status={item.availability} />
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {reviews.length > 0 && <><Stars n={Math.round(avgRating)} /><span className="text-white/80 text-[10px]">{avgRating.toFixed(1)} ({reviews.length})</span></>}
                <span className="flex items-center gap-1 text-white/70 text-[10px]"><IUsers />{item.capacity} pax</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{peso(item.price)}</p>
              <p className="text-white/65 text-[10px]">per {item.priceUnit}</p>
            </div>
          </div>
          {/* Photo nav arrows */}
          {photos.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length) }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white transition-colors hover:bg-black/50" style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.35)' }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length) }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white transition-colors hover:bg-black/50" style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.35)' }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </>}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 px-4 pt-3 shrink-0">
            {photos.map((p, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)} className="rounded-lg overflow-hidden shrink-0 transition-all" style={{ width: 54, height: 38, outline: i === photoIdx ? `2px solid ${GREEN}` : '2px solid transparent', opacity: i === photoIdx ? 1 : 0.6 }}>
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            <div className="flex-1" />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: text2 }}>{item.desc}</p>
            {/* Amenities */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: text3 }}>Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {item.amenities.map(a => (
                  <span key={a} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: surface, color: text2, border: `1px solid ${border}` }}>{a}</span>
                ))}
              </div>
            </div>
            {/* Availability calendar */}
            <AvailabilityCalendar itemId={item.id} />
            {/* Reviews */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: text3 }}>
                Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
              </p>
              {reviews.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: text3 }}>No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {/* Rating summary */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: surface }}>
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: text, fontFamily: "'Playfair Display', serif" }}>{avgRating.toFixed(1)}</p>
                      <Stars n={Math.round(avgRating)} size={14} />
                      <p className="text-[10px] mt-1" style={{ color: text3 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length
                        const pct = reviews.length ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-[10px] w-2" style={{ color: text3 }}>{star}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: border }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: GOLD }} />
                            </div>
                            <span className="text-[10px] w-4 text-right" style={{ color: text3 }}>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Individual reviews */}
                  {reviews.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: surface, border: `1px solid ${border}` }}>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${GREEN}, #2a6647)` }}>{r.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-xs font-semibold" style={{ color: text }}>{r.name}</p>
                            <p className="text-[10px] shrink-0" style={{ color: text3 }}>{r.date}</p>
                          </div>
                          <Stars n={r.rating} size={11} />
                          <p className="text-xs mt-2 leading-relaxed" style={{ color: text2 }}>{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="px-4 py-3 flex gap-2 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-xs font-medium border transition-colors" style={{ borderColor: border, color: text2 }}>Close</button>
          <button onClick={() => { onClose(); onReserve() }} className="flex-1 py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: GREEN }}>Reserve Now</button>
        </div>
      </div>
    </div>
    </>
  )
}

// ─── Catalogue ────────────────────────────────────────────────────────────────
type AvailStatus = 'Available' | 'Limited' | 'Full' | 'Unknown'

function AvailBadge({ status, label }: { status: AvailStatus; label?: string }) {
  const colors: Record<AvailStatus, { bg: string; text: string }> = {
    Available: { bg: '#DCFCE7', text: '#16A34A' },
    Limited: { bg: '#FEF9C3', text: '#CA8A04' },
    Full: { bg: '#FEE2E2', text: '#DC2626' },
    Unknown: { bg: '#F3F4F6', text: '#6B7280' },
  }
  const c = colors[status]
  return <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.text }}>{label ?? status}</span>
}

function CatalogueCard({ img, name, desc, price, priceUnit, capacity, amenities, availability, availLabel, onReserve, onViewDetails }: {
  img: string; name: string; desc: string; price: number; priceUnit: string
  capacity: number; amenities: string[]; availability: AvailStatus; availLabel?: string; onReserve: () => void; onViewDetails: () => void
}) {
  const { card, text, text2, text3, border } = useTheme()
  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col" style={{ background: card, border: `1px solid ${border}` }}>
      <div className="relative h-48 overflow-hidden shrink-0" style={{ background: '#1a2e1f' }}>
        <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3"><AvailBadge status={availability} label={availLabel} /></div>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-semibold" style={{ background: GREEN }}>
          {peso(price)}<span className="font-normal opacity-80">/{priceUnit}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>{name}</h3>
          <span className="flex items-center gap-1 text-[10px] mt-0.5 shrink-0 ml-2" style={{ color: text3 }}><IUsers />{capacity}</span>
        </div>
        <p className="text-[11px] leading-relaxed mb-3 flex-1" style={{ color: text2 }}>{desc}</p>
        <div className="flex flex-wrap gap-1 mb-4">{amenities.slice(0, 4).map(a => <Chip key={a} label={a} />)}</div>
        <div className="flex gap-2">
          <button onClick={onViewDetails} className="flex-1 py-2 rounded-full text-xs font-medium border transition-colors hover:opacity-80" style={{ borderColor: border, color: text2 }}>View Details</button>
          <button onClick={onReserve} className="flex-1 py-2 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: GREEN }}>Reserve</button>
        </div>
      </div>
    </div>
  )
}


function CatalogueSection({ onReserve, availabilitySummary, availabilityError }: {
  onReserve: (category: AccomTab, id: string) => void
  availabilitySummary: Record<string, BookingInventorySummary>
  availabilityError: string | null
}) {
  const { surface, card, text, text2, border } = useTheme()
  const [activeTab, setActiveTab] = useState<CatalogueTab>('rooms')
  const [detailItem, setDetailItem] = useState<CardDetailItem | null>(null)

  const tabs: { id: CatalogueTab; label: string; count: number }[] = [
    { id: 'rooms', label: 'Rooms', count: ROOMS.length },
    { id: 'cottages', label: 'Cottages', count: COTTAGES.length },
    { id: 'restaurant', label: 'Restaurant', count: RESTAURANT_MEALS.length },
    { id: 'venues', label: 'Venues', count: VENUES.length },
  ]

  function openDetail(item: CardDetailItem) { setDetailItem(item) }

  return (
    <section id="catalogue" className="py-20 lg:py-28" style={{ background: surface }}>
      {detailItem && (
        <CardDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onReserve={() => { setDetailItem(null); onReserve(detailItem.category, detailItem.id) }}
        />
      )}
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Catalogue</p>
          <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>What We Offer</h2>
          <p className="text-sm mt-3 max-w-xl mx-auto leading-relaxed" style={{ color: text2 }}>Explore our full range of accommodations, dining, and event spaces. Everything you need for the perfect Palawan experience.</p>
        </div>
        {availabilityError && <p role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">{availabilityError} Live booking checks remain disabled until this issue is resolved.</p>}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0"
              style={{ background: activeTab === tab.id ? GREEN : card, color: activeTab === tab.id ? 'white' : text2, boxShadow: activeTab === tab.id ? `0 2px 12px ${GREEN}33` : `0 1px 4px rgba(0,0,0,0.06)`, border: `1px solid ${activeTab === tab.id ? 'transparent' : border}` }}>
              {tab.label}
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : border, color: activeTab === tab.id ? 'white' : text2 }}>{tab.count}</span>
            </button>
          ))}
        </div>
        {activeTab === 'rooms' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROOMS.map(r => { const av = getAvailInfo(r.id, availabilitySummary); return <CatalogueCard key={r.id} img={r.img} name={r.name} desc={r.desc} price={r.price} priceUnit="night" capacity={r.capacity} amenities={r.amenities} availability={av.status} availLabel={av.label} onReserve={() => onReserve('room', r.id)} onViewDetails={() => openDetail({ id: r.id, name: r.name, img: r.img, desc: r.desc, price: r.price, priceUnit: 'night', capacity: r.capacity, amenities: r.amenities, availability: av.status, category: 'room' })} /> })}
          </div>
        )}
        {activeTab === 'cottages' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COTTAGES.map(c => { const av = getAvailInfo(c.id, availabilitySummary); return <CatalogueCard key={c.id} img={c.img} name={c.name} desc={c.desc} price={c.price} priceUnit="night" capacity={c.capacity} amenities={c.amenities} availability={av.status} availLabel={av.label} onReserve={() => onReserve('cottage', c.id)} onViewDetails={() => openDetail({ id: c.id, name: c.name, img: c.img, desc: c.desc, price: c.price, priceUnit: 'night', capacity: c.capacity, amenities: c.amenities, availability: av.status, category: 'cottage' })} /> })}
          </div>
        )}
        {activeTab === 'restaurant' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESTAURANT_MEALS.map(m => { const av = getAvailInfo(m.id, availabilitySummary); return <CatalogueCard key={m.id} img={m.img} name={m.meal} desc={`${m.time} · ${m.desc}`} price={m.price} priceUnit="pax" capacity={m.capacity} amenities={['Breakfast', 'Set Menu', 'À la Carte', 'Buffet']} availability={av.status} availLabel={av.label} onReserve={() => onReserve('restaurant', m.id)} onViewDetails={() => openDetail({ id: m.id, name: m.meal, img: m.img, desc: `${m.time} · ${m.desc}`, price: m.price, priceUnit: 'pax', capacity: m.capacity, amenities: ['Breakfast', 'Set Menu', 'À la Carte', 'Buffet'], availability: av.status, category: 'restaurant' })} /> })}
          </div>
        )}
        {activeTab === 'venues' && (
          <div className="grid sm:grid-cols-2 gap-6">
            {VENUES.map(v => { const av = getAvailInfo(v.id, availabilitySummary); return <CatalogueCard key={v.id} img={v.img} name={v.name} desc={v.desc} price={v.price} priceUnit="event" capacity={v.capacity} amenities={v.amenities} availability={av.status} availLabel={av.label} onReserve={() => onReserve('venue', v.id)} onViewDetails={() => openDetail({ id: v.id, name: v.name, img: v.img, desc: v.desc, price: v.price, priceUnit: 'event', capacity: v.capacity, amenities: v.amenities, availability: av.status, category: 'venue' })} /> })}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────
// ===== START CUT: components/sections/Contact.jsx =====
function ContactSection() {
  const { bg, surface, text, text2, border } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const infoItems = [
    { icon: <IMapPin />, label: 'Address', value: 'Palawan Island, Philippines\nEl Nido, Palawan 5313' },
    { icon: <IPhoneOutline />, label: 'Phone', value: '+63 917 123 4567\n+63 928 765 4321' },
    { icon: <IEnvelope />, label: 'Email', value: 'reservations@palawanparaiso.com\nhello@palawanparaiso.com' },
    { icon: <IClock />, label: 'Business Hours', value: 'Monday – Sunday\n7:00 AM – 10:00 PM' },
  ]

  return (
    <section id="contact" className="py-20 lg:py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Get in Touch</p>
          <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Contact Us</h2>
          <p className="text-sm mt-3 max-w-xl mx-auto leading-relaxed" style={{ color: text2 }}>{"We'd love to hear from you. Reach out to us for reservations, inquiries, or just to say hello."}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="text-white rounded-full flex items-center justify-center mb-4 shadow-md" style={{ width: 56, height: 56, background: GREEN }}><Chk cls="w-7 h-7" /></div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Message Sent!</h3>
                <p className="text-sm" style={{ color: text2 }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-5 text-sm font-medium underline" style={{ color: GREEN }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Full Name *</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="Maria Santos" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Email Address *</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="maria@email.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Phone Number</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Subject *</label><input className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400" style={icStyle(surface, text)} placeholder="Reservation Inquiry" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium" style={{ color: text2 }}>Message *</label><textarea className="rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder-gray-400 resize-none" style={icStyle(surface, text)} placeholder="Tell us about your inquiry..." rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required /></div>
                <button type="submit" className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2" style={{ background: GREEN }}>Send Message <IArrowRight /></button>
              </form>
            )}
          </div>
          <div className="space-y-5">
            {infoItems.map(item => (
              <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: surface }}>
                <div className="mt-0.5 shrink-0" style={{ color: GREEN }}>{item.icon}</div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: text }}>{item.label}</p>
                  {item.value.split('\n').map((line, i) => <p key={i} className="text-xs" style={{ color: text2 }}>{line}</p>)}
                </div>
              </div>
            ))}
            <div className="rounded-xl overflow-hidden" style={{ height: 180, background: '#E8F0EB', position: 'relative' }}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #38875C 0, #38875C 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #38875C 0, #38875C 1px, transparent 1px, transparent 32px)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="text-white rounded-full flex items-center justify-center shadow-lg" style={{ width: 40, height: 40, background: GREEN }}><IMapPin /></div>
                <div className="text-center px-4 py-2 rounded-lg bg-white/90 shadow-sm">
                  <p className="text-xs font-semibold text-gray-800">Palawan Paraíso Resort &amp; Spa</p>
                  <p className="text-[10px] text-gray-500">El Nido, Palawan, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
// ===== START CUT: components/sections/Footer.jsx =====
function Footer({ onBook }: { onBook: () => void }) {
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
function ReceiptPopup({ booking, onClose }: { booking: BookingRecord; onClose: () => void }) {
  const { card, surface, border, text, text2, text3 } = useTheme()
  const catLabels: Record<AccomTab, string> = { room: 'Room', cottage: 'Cottage', restaurant: 'Restaurant', venue: 'Venue' }
  const mLabel = PAY_OPTS.find(p => p.id === booking.method)?.label ?? ''
  const itemName = getItemName(booking.category, booking.itemId)
  const meal = RESTAURANT_MEALS.find(m => m.id === booking.itemId)
  const isWhole = booking.resType === 'Whole Restaurant'
  const receiptId = booking.receiptId || booking.id

  function Row({ l, v }: { l: string; v: string }) {
    return (
      <div className="flex justify-between text-xs py-1" style={{ borderBottom: `1px solid ${border}` }}>
        <span style={{ color: text2 }}>{l}</span>
        <span className="font-medium text-right ml-4" style={{ color: text, maxWidth: '60%' }}>{v}</span>
      </div>
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
          <div className="mb-2 mx-auto" style={{ maxWidth: 240 }}><ReceiptBarcode value={receiptId} /></div>
          <p className="text-[11px] font-mono font-bold tracking-widest" style={{ color: text2 }}>#{receiptId}</p>
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
          <Row l="Payment Plan" v={(booking.payPlan ?? 'downpayment') === 'full' ? 'Pay in Full' : booking.downpayOption === 'on-arrival' ? 'Pay on Arrival' : 'Follow-up Payment'} />
          <Row l="Payment Status" v={booking.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'} />
          {booking.unitLabel && <Row l="Unit" v={booking.unitLabel} />}
          <Row l="Pax" v={`${booking.g.pax}`} />
        </div>

        {/* Footer totals */}
        <div className="px-5 pb-5 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${border}`, background: surface }}>
          <div className="flex justify-between text-xs"><span style={{ color: text2 }}>{(booking.payPlan ?? 'downpayment') === 'full' ? 'Amount Due' : 'Downpayment Due'}</span><span style={{ color: text }}>{peso(booking.fee)}</span></div>
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

// ===== START CUT: components/profile/ProfileView.jsx =====
function ProfileView({ user, bookings, completedIds, onMarkComplete, onCancel, onBack, onBook, onSaveProfile, toggleDark }: {
  user: UserProfile
  bookings: BookingRecord[]
  completedIds: string[]
  onMarkComplete: (id: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
  onBack: () => void
  onBook: () => void
  onSaveProfile: (profile: UserProfile) => Promise<void> | void
  toggleDark: () => void
}) {
  const { card, surface, border, text, text2, text3, pageBg } = useTheme()
  const dark = useDark()
  const [tab, setTab] = useState<'incoming' | 'completed'>('incoming')
  const [editMode, setEditMode] = useState(false)
  const [editUser, setEditUser] = useState<UserProfile>({ ...user })
  const [receiptBooking, setReceiptBooking] = useState<BookingRecord | null>(null)
  const [reservationError, setReservationError] = useState<string | null>(null)

  const incoming = bookings.filter(b => !completedIds.includes(b.id))
  const completed = bookings.filter(b => completedIds.includes(b.id))
  const shown = tab === 'incoming' ? incoming : completed

  const catColors: Record<AccomTab, string> = { room: '#3B82F6', cottage: '#10B981', restaurant: '#F59E0B', venue: '#8B5CF6' }
  const catLabels: Record<AccomTab, string> = { room: 'Room', cottage: 'Cottage', restaurant: 'Restaurant', venue: 'Venue' }

  function getDateLabel(b: BookingRecord) {
    if (b.category === 'room' || b.category === 'cottage') return b.checkIn ? `${fmtLong(b.checkIn)} → ${fmtLong(b.checkOut)}` : '—'
    return b.resDate ? fmtLong(b.resDate) : '—'
  }

  function getBookingInterval(b: BookingRecord) {
    const zone = '+08:00'
    if (b.category === 'room' || b.category === 'cottage') {
      return {
        start: new Date(`${b.checkIn}T00:00:00${zone}`).getTime(),
        end: new Date(`${b.checkOut}T00:00:00${zone}`).getTime(),
      }
    }
    if (b.category === 'venue') {
      return {
        start: new Date(`${b.resDate}T${b.startTime}:00${zone}`).getTime(),
        end: new Date(`${b.resDate}T${b.endTime}:00${zone}`).getTime(),
      }
    }
    const mealTimes: Record<string, [string, string]> = {
      breakfast: ['06:00', '10:00'],
      lunch: ['11:00', '14:30'],
      dinner: ['18:00', '22:00'],
    }
    const [startTime, endTime] = mealTimes[b.itemId] ?? ['', '']
    return {
      start: new Date(`${b.resDate}T${startTime}:00${zone}`).getTime(),
      end: new Date(`${b.resDate}T${endTime}:00${zone}`).getTime(),
    }
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
                  <button className="px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: GREEN }} onClick={async () => { await onSaveProfile(editUser); setEditMode(false) }}>Save Changes</button>
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

            {reservationError && <p role="alert" className="px-4 py-2 text-xs text-red-600">{reservationError}</p>}
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
                  const interval = getBookingInterval(b)
                  const canCancel = interval.start > Date.now()
                  const canMarkComplete = interval.end <= Date.now()
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
                          <button disabled={!canCancel} onClick={async () => { setReservationError(null); try { await onCancel(b.id) } catch (error) { setReservationError(error instanceof Error ? error.message : 'Unable to cancel this booking.') } }} className="flex-1 py-1.5 rounded-full text-[10px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                            Cancel
                          </button>
                          <button disabled={!canMarkComplete} onClick={async () => { setReservationError(null); try { await onMarkComplete(b.id) } catch (error) { setReservationError(error instanceof Error ? error.message : 'Unable to complete this booking.') } }} className="flex-1 py-1.5 rounded-full text-[10px] font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: GREEN }}>
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
function Website({ onReserve, onBook, onSignIn, onReservations, onOpenProfile, onLogout, reservationCount, user, toggleDark, availabilitySummary, availabilityError }: {
  onReserve: (category: AccomTab, id: string) => void
  onBook: () => void; onSignIn: () => void
  onReservations: () => void; onOpenProfile: () => void; onLogout: () => void
  reservationCount: number; user: UserProfile | null; toggleDark: () => void
  availabilitySummary: Record<string, BookingInventorySummary>
  availabilityError: string | null
}) {
  const [scrolled, setScrolled] = useState(false)
  return (
    <div className="h-screen overflow-y-auto safe-bottom" onScroll={e => setScrolled(e.currentTarget.scrollTop > 60)}>
      <Navbar scrolled={scrolled} onBook={onBook} onSignIn={onSignIn} onOpenProfile={onOpenProfile} onLogout={onLogout} onReservations={onReservations} reservationCount={reservationCount} user={user} toggleDark={toggleDark} />
      <HeroSection onBook={onBook} />
      <AboutSection />
      <CatalogueSection onReserve={onReserve} availabilitySummary={availabilitySummary} availabilityError={availabilityError} />
      <ContactSection />
      <Footer onBook={onBook} />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>('website')
  const [bookingCategory, setBookingCategory] = useState<AccomTab>('room')
  const [bookingItemId, setBookingItemId] = useState('premium')
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [dark, setDark] = useState(false)
  const [availabilitySummary, setAvailabilitySummary] = useState<Record<string, BookingInventorySummary>>({})
  const [availabilitySummaryError, setAvailabilitySummaryError] = useState<string | null>(null)

  useEffect(() => {
    const savedView = localStorage.getItem(VIEW_STORAGE_KEY) as View | null
    if (savedView === 'website' || savedView === 'booking' || savedView === 'login' || savedView === 'reservations' || savedView === 'profile') {
      setView(savedView)
    }

    getCurrentProfile()
      .then(profile => {
        if (profile) setUser(profile)
      })
      .catch(error => console.error('Unable to restore session:', error))

    loadBookings()
      .then(saved => {
        setBookings(saved.map(({ completed, ...booking }) => booking as unknown as BookingRecord))
        setCompletedIds(saved.filter(booking => booking.completed).map(booking => booking.id))
      })
      .catch(error => console.error('Unable to load reservations:', error))

    loadBookingInventorySummary(nextDay(palawanToday()))
      .then(summary => {
        setAvailabilitySummary(Object.fromEntries(summary.map(item => [item.item_key, item])))
        setAvailabilitySummaryError(null)
      })
      .catch(error => setAvailabilitySummaryError(getAvailabilityErrorMessage(error)))
  }, [])

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view)
  }, [view])

  function toggleDark() {
    setDark(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  function openBooking(category: AccomTab, itemId: string) {
    setBookingCategory(category)
    setBookingItemId(itemId)
    setView('booking')
  }

  async function handleBookingComplete(record: BookingRecord): Promise<BookingRecord> {
    const saved = await saveBooking(record) as unknown as BookingRecord
    setBookings(prev => [...prev, saved])
    return saved
  }

  async function handleLogin(u: UserProfile) {
    setUser(u)
    try {
      const saved = await loadBookings()
      setBookings(saved.map(({ completed, ...booking }) => booking as unknown as BookingRecord))
      setCompletedIds(saved.filter(booking => booking.completed).map(booking => booking.id))
    } catch (error) {
      console.error('Unable to load reservations after sign-in:', error)
    }
    if (view !== 'booking') setView('website')
  }

  async function handleProfileUpdate(updated: UserProfile) {
    const saved = await updateProfile(updated)
    setUser(saved)
  }

  async function handleLogout() {
    await supabaseSignOut()
    setUser(null)
    setView('website')
  }

  async function markComplete(id: string) {
    await setBookingCompleted(id, true)
    setCompletedIds(prev => [...prev, id])
  }

  async function cancelBooking(id: string) {
    await removeBooking(id)
    setBookings(prev => prev.filter(b => b.id !== id))
    setCompletedIds(prev => prev.filter(cid => cid !== id))
  }

  const incomingCount = bookings.filter(b => !completedIds.includes(b.id)).length

  let content: React.ReactNode

  if (view === 'login') {
    content = <LoginView onBack={() => setView('website')} onSuccess={handleLogin} />
  } else if (view === 'reservations') {
    if (!user) {
      content = <LoginView onBack={() => setView('website')} onSuccess={handleLogin} />
    } else {
      content = <ReservationsView bookings={bookings.filter(b => b.userId === (user.username ?? user.email))} onBack={() => setView('profile')} />
    }
  } else if (view === 'profile') {
    if (!user) {
      content = <LoginView onBack={() => setView('website')} onSuccess={handleLogin} />
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
          onSaveProfile={handleProfileUpdate}
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
        availabilitySummary={availabilitySummary}
        availabilityError={availabilitySummaryError}
      />
    )
  }

  return (
    <DarkCtx.Provider value={dark}>
      {content}
    </DarkCtx.Provider>
  )
}
