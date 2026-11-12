import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export interface StoredBooking {
  id: string
  completed?: boolean
  booking_status?: 'ongoing' | 'completed' | 'cancelled'
  [key: string]: unknown
}

export interface BookingAvailability {
  item_key: string
  unit_label: string
  group_label: string | null
  start_date: string
  end_date: string
  start_time: string
  end_time: string
}

export interface BookingInventorySummary {
  item_key: string
  unit_type: string
  total_units: number
  available_units: number
}

const availabilityRequests = new Map<string, Promise<BookingAvailability[]>>()
const inventorySummaryRequests = new Map<string, Promise<BookingInventorySummary[]>>()

function shareInFlightRequest<T>(requests: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  const existing = requests.get(key)
  if (existing) return existing

  const request = load()
  requests.set(key, request)
  const clear = () => {
    if (requests.get(key) === request) requests.delete(key)
  }
  void request.then(clear, clear)
  return request
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
  const { data: authData, error: authError } = await supabase.auth.getSession()
  if (authError) throw authError
  if (!authData.session?.user) return null

  const fallback = profileFromUser(authData.session.user)
  const { data: accountData, error: accountError } = await supabase
    .from('customer_account')
    .select('full_name, email, phone, username')
    .eq('username', authData.session.user.id)
    .maybeSingle()

  if (accountError || !accountData) return fallback

  const fullName = String(accountData.full_name ?? '').trim()
  const nameParts = fullName ? fullName.split(/\s+/) : []
  const firstName = nameParts.shift() ?? fallback.firstName
  const lastName = nameParts.join(' ') || fallback.lastName

  return {
    firstName,
    lastName,
    email: accountData.email ?? fallback.email,
    phone: accountData.phone ?? fallback.phone,
    username: accountData.username ?? fallback.username,
  }
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

export async function updateProfile(profile: AuthUserProfile) {
  if (!supabase) return profile

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const userId = userData?.user?.id
  if (!userId) return profile

  const { error: authError } = await supabase.auth.updateUser({
    email: profile.email,
    data: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    },
  })
  if (authError) throw authError

  const fullName = `${profile.firstName} ${profile.lastName}`.trim()
  const { error: accountError } = await supabase.from('customer_account').upsert({
    username: userId,
    full_name: fullName || 'Guest User',
    email: profile.email,
    phone: profile.phone,
  }, { onConflict: 'username' })
  if (accountError) throw accountError

  return {
    ...profile,
    username: userId,
  }
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

export async function loadBookings(): Promise<StoredBooking[]> {
  if (!supabase) return []

  const { data: authData, error: authError } = await supabase.auth.getSession()
  if (authError) throw authError
  if (!authData.session?.user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('data, completed, booking_status')
    .eq('user_id', authData.session.user.id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? [])
    .map(row => ({ ...(row.data as object), completed: row.completed, booking_status: row.booking_status }))
    .filter(booking => booking.booking_status !== 'cancelled') as StoredBooking[]
}

export async function saveBooking(booking: object) {
  if (!supabase) throw new Error('Supabase is not configured; secure bookings are unavailable.')

  const { data, error } = await supabase.rpc('create_customer_booking', { p_booking: booking })
  if (error) throw error
  if (!data || typeof data !== 'object') throw new Error('The server did not return the saved booking.')
  return data as StoredBooking
}

export async function removeBooking(id: string) {
  if (!supabase) throw new Error('Supabase is not configured; secure booking changes are unavailable.')
  const { error } = await supabase.rpc('cancel_customer_booking', { p_booking_id: id })
  if (error) throw error
}

export async function setBookingCompleted(id: string, completed: boolean) {
  if (!completed) throw new Error('Completed bookings cannot be reopened.')
  if (!supabase) throw new Error('Supabase is not configured; secure booking changes are unavailable.')
  const { error } = await supabase.rpc('complete_customer_booking', { p_booking_id: id })
  if (error) throw error
}

export function loadBookingAvailability(itemKey: string, fromDate: string, toDate: string): Promise<BookingAvailability[]> {
  const key = JSON.stringify([itemKey, fromDate, toDate])
  return shareInFlightRequest(availabilityRequests, key, async () => {
    if (!supabase) throw new Error('Live availability requires Supabase configuration.')
    const { data, error } = await supabase.rpc('get_booking_availability', {
      p_item_key: itemKey,
      p_from_date: fromDate,
      p_to_date: toDate,
    })
    if (error) throw error
    return (data ?? []) as BookingAvailability[]
  })
}

export function loadBookingInventorySummary(date: string): Promise<BookingInventorySummary[]> {
  return shareInFlightRequest(inventorySummaryRequests, date, async () => {
    if (!supabase) throw new Error('Live availability requires Supabase configuration.')
    const { data, error } = await supabase.rpc('get_booking_inventory_summary', { p_date: date })
    if (error) throw error
    return (data ?? []) as BookingInventorySummary[]
  })
}
