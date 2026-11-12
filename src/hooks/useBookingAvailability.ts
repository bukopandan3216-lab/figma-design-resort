import { useEffect, useMemo, useState } from 'react'
import { loadBookingAvailability, type BookingAvailability } from '../lib/supabase'

export const BOOKING_UNIT_COLORS = ['#38875C', '#2563EB', '#D97706', '#9333EA', '#DB2777', '#0891B2', '#DC2626', '#65A30D', '#EA580C', '#7C3AED']

export function getAvailabilityErrorMessage(cause: unknown) {
  const message = cause instanceof Error
    ? cause.message
    : typeof cause === 'object' && cause !== null && 'message' in cause && typeof cause.message === 'string'
      ? cause.message
      : ''
  const code = typeof cause === 'object' && cause !== null && 'code' in cause && typeof cause.code === 'string'
    ? cause.code
    : ''

  if (/failed to fetch|network|name_not_resolved/i.test(message)) {
    return 'Live availability cannot be reached. Check the Supabase project URL and network connection.'
  }
  if (code === 'PGRST202' || /could not find the function|schema cache/i.test(message)) {
    return 'Supabase is reachable, but its booking availability function is missing. Apply the secure booking migration, or refresh the Supabase API schema cache if it was already applied.'
  }
  return message || 'Unable to load live availability.'
}

export function useBookingAvailability(itemKey: string, fromDate: string, toDate: string) {
  const [records, setRecords] = useState<BookingAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    loadBookingAvailability(itemKey, fromDate, toDate)
      .then(result => {
        if (active) setRecords(result)
      })
      .catch(cause => {
        if (active) {
          setRecords([])
          setError(getAvailabilityErrorMessage(cause))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [itemKey, fromDate, toDate])

  const events = useMemo(() => records.map((record, index) => ({
    title: record.group_label ? `${record.unit_label} · ${record.group_label}` : record.unit_label,
    start: record.start_date,
    end: record.end_date,
    backgroundColor: BOOKING_UNIT_COLORS[index % BOOKING_UNIT_COLORS.length],
    borderColor: BOOKING_UNIT_COLORS[index % BOOKING_UNIT_COLORS.length],
    textColor: '#fff',
    display: 'block' as const,
    extendedProps: record,
  })), [records])

  function isUnitAvailable(unitLabel: string, startDate: string, endDate: string, startTime?: string, endTime?: string) {
    return !records.some(record => {
      if (record.unit_label !== unitLabel || record.start_date >= endDate || record.end_date <= startDate) return false
      if (startTime && endTime && record.start_date === startDate && record.end_date === endDate) {
        return startTime < record.end_time && endTime > record.start_time
      }
      return true
    })
  }

  return { records, events, loading, error, isUnitAvailable }
}
