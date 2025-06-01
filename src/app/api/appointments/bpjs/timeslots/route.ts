import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date')
  if (!dateParam) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const inputDate = new Date(dateParam)

  //get bpjs user_id
  const { data: bpjsDoctors, error: bpjsError } = await supabase
    .from('doctors')
    .select('user_id')
    .eq('bpjs', true)

  if (bpjsError) return NextResponse.json({ error: bpjsError.message }, { status: 500 })

  const bpjsDoctorIds = bpjsDoctors.map(doc => doc.user_id)
  if (bpjsDoctorIds.length === 0) {
    return NextResponse.json([], { status: 200 })
  }

  //get bpjs availability
  const { data: availabilities, error: availError } = await supabase
    .from('doctoravailability')
    .select('doctor_id, start_time, end_time, weekday')
    .in('doctor_id', bpjsDoctorIds)

  if (availError) return NextResponse.json({ error: availError.message }, { status: 500 })

  //time slots
  const slotsMap: { [time: string]: boolean } = {}

  for (const avail of availabilities) {
    const startHour = parseInt(avail.start_time.split(':')[0])
    const endHour = parseInt(avail.end_time.split(':')[0])

    for (let hour = startHour; hour < endHour; hour++) {
      const slot = `${hour.toString().padStart(2, '0')}:00`
      if (!(slot in slotsMap)) {
        slotsMap[slot] = false //false is available
      }
    }
  }

  //get booked hours
  const { data: bookings, error: bookingError } = await supabase
    .from('doctorbooking')
    .select('book_time, doctor_id')
    .eq('book_date', dateParam)
    .in('doctor_id', bpjsDoctorIds)

  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 })

  bookings.forEach(b => {
    const bookedHour = b.book_time.split(':')[0]
    const slot = `${bookedHour.padStart(2, '0')}:00`
    if (slot in slotsMap) {
      slotsMap[slot] = true //true is booked
    }
  })

  const timeslots = Object.entries(slotsMap)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([time, isBooked]) => ({ time, isBooked }))

  return NextResponse.json(timeslots)
}
