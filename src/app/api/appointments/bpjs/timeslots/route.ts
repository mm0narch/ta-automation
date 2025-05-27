import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date')
  if (!dateParam) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const inputDate = new Date(dateParam)
  const weekday = inputDate.toLocaleDateString('en-US', { weekday: 'long' })

  // 1. Get all doctors available on that weekday
  const { data: availabilities, error } = await supabase
    .from('doctoravailability')
    .select('doctor_id, start_time, end_time')
    .eq('weekday', weekday)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 2. Generate time slots for each doctor
  const slotsMap: { [time: string]: boolean } = {}

  for (const avail of availabilities) {
    const startHour = parseInt(avail.start_time.split(':')[0])
    const endHour = parseInt(avail.end_time.split(':')[0])

    for (let hour = startHour; hour < endHour; hour++) {
      const slot = `${hour.toString().padStart(2, '0')}:00`
      slotsMap[slot] = false // false = not booked
    }
  }

  // 3. Get booked times from doctorbooking
  const { data: bookings, error: bookingError } = await supabase
    .from('doctorbooking')
    .select('book_time')
    .eq('book_date', dateParam)

  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 })

  bookings.forEach(b => {
    const bookedHour = b.book_time.split(':')[0]
    const slot = `${bookedHour.padStart(2, '0')}:00`
    if (slot in slotsMap) {
      slotsMap[slot] = true
    }
  })

  // 4. Convert to [{ time: "08:00", isBooked: false }, ...]
  const timeslots = Object.entries(slotsMap)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([time, isBooked]) => ({ time, isBooked }))

  return NextResponse.json(timeslots)
}
