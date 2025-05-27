import { NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'

export async function POST(req: Request) {
  const body = await req.json()
  const { date, time } = body
  
  const cookieStore = await cookies()
  const session = cookieStore.get('patient_session')

  if (!session) {
    return NextResponse.json({ error: 'No patient session'}, { status: 401 })
  }

  const { patientId } = JSON.parse(session.value)

  if (!date || !time || !patientId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  const weekday = dayjs(date).format('dddd') // e.g., "Monday"

  // Get all doctors available on that weekday
  const { data: availableDoctors, error: availabilityError } = await supabase
    .from('doctoravailability')
    .select('doctor_id, start_time, end_time')
    .eq('weekday', weekday)

  if (availabilityError) {
    return NextResponse.json({ error: availabilityError.message }, { status: 500 })
  }

  const targetTime = dayjs(time, 'HH:mm')

  for (const doctor of availableDoctors) {
    const start = dayjs(doctor.start_time, 'HH:mm')
    const end = dayjs(doctor.end_time, 'HH:mm')

    // Check if time is within range and not too close to end
    if (targetTime.isBefore(start) || !targetTime.isBefore(end.subtract(1, 'hour'))) {
      continue
    }

    // Check if this doctor is already booked at that date and time
    const { data: existingBookings, error: bookingCheckError } = await supabase
      .from('doctorbooking')
      .select('id')
      .eq('doctor_id', doctor.doctor_id)
      .eq('book_date', date)
      .eq('book_time', time)

    if (bookingCheckError) {
      return NextResponse.json({ error: bookingCheckError.message }, { status: 500 })
    }

    if (existingBookings.length === 0) {
      // This doctor is available — insert booking
      const { error: insertError } = await supabase
        .from('doctorbooking')
        .insert({
          doctor_id: doctor.doctor_id,
          patient_id: patientId,
          book_date: date,
          book_time: time,
        })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ error: 'No available doctors at that time' }, { status: 400 })
}
