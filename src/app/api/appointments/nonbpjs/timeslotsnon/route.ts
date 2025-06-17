// /api/appointments/nonbpjs/timeslotsnon/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function GET(req: NextRequest) {
  const doctorId = req.nextUrl.searchParams.get('doctor_id')
  const bookDate = req.nextUrl.searchParams.get('date')

  if (!doctorId || !bookDate) {
    return NextResponse.json({ error: 'Missing doctor_id or date' }, { status: 400 })
  }

  // Get doctor's availability
  const { data: availability, error: availError } = await supabase
    .from('doctoravailability')
    .select('start_time, end_time')
    .eq('doctor_id', doctorId)
    .single()

  if (availError || !availability) {
    console.error('Availability error:', availError)
    return NextResponse.json({ error: 'Doctor availability not found' }, { status: 404 })
  }

  const { start_time, end_time } = availability

  // Generate time slots (1 hour interval)
  const slots: string[] = []
  const start = parseInt(start_time.split(':')[0])
  const end = parseInt(end_time.split(':')[0])
  for (let hour = start; hour < end; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    slots.push(time)
  }

  // Get already booked times
  const { data: bookings, error: bookingError } = await supabase
    .from('doctorbooking')
    .select('book_time')
    .eq('doctor_id', doctorId)
    .eq('book_date', bookDate)

  if (bookingError) {
    console.error('Booking error:', bookingError)
    return NextResponse.json({ error: 'Could not fetch bookings' }, { status: 500 })
  }

  const bookedTimes = bookings.map(b => b.book_time)

  const timeSlots = slots.map(time => ({
    time,
    isBooked: bookedTimes.includes(time)
  }))

  return NextResponse.json(timeSlots)
}
