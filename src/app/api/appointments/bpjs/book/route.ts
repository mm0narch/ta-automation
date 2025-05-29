import { NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'

export async function POST(req: Request) {
  const body = await req.json()
  const { date, time } = body

  //get session info
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('patient_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ error: 'No patient session' }, { status: 401 })
  }

  //get user_id from patientsession table
  const { data: sessionData, error: sessionError } = await supabase
    .from('patientsession')
    .select('user_id')
    .eq('token', sessionToken)
    .single()

  if (sessionError || !sessionData) {
    return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
  }

  const patientId = sessionData.user_id

  if (!date || !time || !patientId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  const weekday = dayjs(date).format('dddd')

  //check available doctors
  const { data: availableDoctors, error: availabilityError } = await supabase
    .from('doctoravailability')
    .select('doctor_id, start_time, end_time, weekday')
    .eq('weekday', weekday)

  if (availabilityError) {
    return NextResponse.json({ error: availabilityError.message }, { status: 500 })
  }

  const paddedTime = time.length === 5 ? `${time}:00` : time
  const targetTime = dayjs(`1970-01-01T${paddedTime}`)

  for (const doctor of availableDoctors) {
    const start = dayjs(`1970-01-01T${doctor.start_time}`)
    const end = dayjs(`1970-01-01T${doctor.end_time}`)

    if (targetTime.isBefore(start) || !targetTime.isBefore(end.subtract(59, 'minute'))) {
      continue
    }

    //check if doctor is already booked at this exact time
    const { data: existingBookings, error: bookingCheckError } = await supabase
      .from('doctorbooking')
      .select('id')
      .eq('doctor_id', doctor.doctor_id)
      .eq('book_date', date)
      .eq('book_time', time)

    if (bookingCheckError) {
      return NextResponse.json({ error: bookingCheckError.message }, { status: 500 })
    }

    //get current queue count for that doctor on that day
    if (existingBookings.length === 0) {
      const { count: currentQueueCount, error: countError } = await supabase
        .from('doctorbooking')
        .select('id', { count: 'exact', head: true })
        .eq('doctor_id', doctor.doctor_id)
        .eq('book_date', date)

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 })
      }

      const queueNumber = (currentQueueCount || 0) + 1

      //insert booking knfo
      const { error: insertError } = await supabase
        .from('doctorbooking')
        .insert({
          doctor_id: doctor.doctor_id,
          patient_id: patientId,
          book_date: date,
          book_time: time,
          queue: queueNumber,
        })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, queue: queueNumber })
    }
  }

  return NextResponse.json({ error: 'No available doctors at that time' }, { status: 400 })
}
