import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

const LOCAL_KEY = 'palawan-paraiso-bookings'

export interface StoredBooking {
  id: string
  completed?: boolean
  booking_status?: 'ongoing' | 'completed' | 'cancelled'
  [key: string]: unknown
}

export interface AuthUserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  username: string
}

function profileFromUser(user: { id: string; email?: string; phone?: string; user_metadata?: Record<string, string> }): AuthUserProfile {
  const metadata = user.user_metadata ?? {}
  return {
    firstName: metadata.firstName ?? metadata.first_name ?? 'Guest',
    lastName: metadata.lastName ?? metadata.last_name ?? 'User',
    email: user.email ?? '',
    phone: user.phone ?? metadata.phone ?? '',
    username: user.id,
  }
}

export async function getCurrentProfile() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return profileFromUser(data.user)
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user ? profileFromUser(data.user) : null
}

export async function signUp(profile: Omit<AuthUserProfile, 'username'> & { password: string }) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signUp({
    email: profile.email,
    password: profile.password,
    options: {
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      },
    },
  })
  if (error) throw error
    return data.user && data.session ? profileFromUser(data.user) : null
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

export async function loadBookings(): Promise<StoredBooking[]> {
  if (!supabase) {
    const saved = localStorage.getItem(LOCAL_KEY)
    return saved ? JSON.parse(saved) as StoredBooking[] : []
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('data, completed, booking_status')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? [])
    .map(row => ({ ...(row.data as object), completed: row.completed, booking_status: row.booking_status }))
    .filter(booking => booking.booking_status !== 'cancelled') as StoredBooking[]
}

export async function saveBooking(booking: object) {
  if (!supabase) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...saved, { ...booking, booking_status: 'ongoing' }]))
    return
  }

  const record = booking as {
    id: string
    userId: string
    receiptId?: string
    total?: number
    fee?: number
    balance?: number
  }
  const { error } = await supabase.from('bookings').upsert({
    id: record.id,
    user_id: record.userId,
    data: booking,
    booking_status: 'ongoing',
  })
  if (error) throw error

  const { error: receiptError } = await supabase.from('receipt').upsert({
    booking_id: record.id,
    receipt_number: record.receiptId ?? record.id,
    total_amount: record.total ?? 0,
    downpayment_amount: record.fee ?? 0,
    balance_amount: record.balance ?? 0,
  }, { onConflict: 'booking_id' })
  if (receiptError) throw receiptError
}

export async function removeBooking(id: string) {
  if (!supabase) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
    localStorage.setItem(LOCAL_KEY, JSON.stringify(saved.map((booking: { id: string }) => booking.id === id ? { ...booking, booking_status: 'cancelled' } : booking)))
    return
  }

  const { error } = await supabase.from('bookings').update({ booking_status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function setBookingCompleted(id: string, completed: boolean) {
  if (!supabase) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
    localStorage.setItem(LOCAL_KEY, JSON.stringify(saved.map((booking: { id: string }) => booking.id === id ? { ...booking, completed, booking_status: completed ? 'completed' : 'ongoing' } : booking)))
    return
  }

  const { error } = await supabase.from('bookings').update({ completed, booking_status: completed ? 'completed' : 'ongoing', completed_at: completed ? new Date().toISOString() : null }).eq('id', id)
  if (error) throw error
}
