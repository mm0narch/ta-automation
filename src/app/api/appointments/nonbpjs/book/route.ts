import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { doctor_id, book_date, book_time } = await req.json()

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('patient_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ error: 'No patient session' }, { status: 401 })
  }

  // Get patient_id from session token
  const { data: sessionData, error: sessionError } = await supabase
    .from('patientsession')
    .select('user_id')
    .eq('token', sessionToken)
    .single()

  if (sessionError || !sessionData) {
    return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
  }

  const patient_id = sessionData.user_id

  if (!doctor_id || !book_date || !book_time || !patient_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if patient already has booking for this date and time (optional)
  const { data: existingBookings, error: existingError } = await supabase
    .from('doctorbooking')
    .select('*')
    .eq('patient_id', patient_id)
    .eq('book_date', book_date)
    .eq('book_time', book_time)

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (existingBookings && existingBookings.length > 0) {
    return NextResponse.json({ error: 'You already have a booking at this time.' }, { status: 400 })
  }

  // Calculate queue number: count how many bookings already exist for this doctor and date
  const { count: currentQueueCount, error: countError } = await supabase
    .from('doctorbooking')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctor_id)
    .eq('book_date', book_date)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const queueNumber = (currentQueueCount || 0) + 1

  // Insert new booking with queue number
  const { error: insertError } = await supabase
    .from('doctorbooking')
    .insert({
      doctor_id,
      patient_id,
      book_date,
      book_time,
      queue: queueNumber,
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, queue: queueNumber })
}
