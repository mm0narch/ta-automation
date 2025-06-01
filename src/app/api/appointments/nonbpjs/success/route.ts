import { NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('patient_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'No patient session' }, { status: 401 })
    }

    // get user_id from patient session (same table and column assumed)
    const { data: sessionData, error: sessionError } = await supabase
      .from('patientsession')
      .select('user_id')
      .eq('token', sessionToken)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
    }

    const patientId = sessionData.user_id

    // get latest booking for patient_id (same doctorbooking table)
    const { data: bookingData, error: bookingError } = await supabase
      .from('doctorbooking')
      .select('queue, doctor_id, book_date, book_time')
      .eq('patient_id', patientId)
      .order('book_date', { ascending: false })
      .order('book_time', { ascending: false })
      .limit(1)
      .single()

    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'No booking found for this patient' }, { status: 404 })
    }

    const { queue, doctor_id, book_date, book_time } = bookingData

    // get doctor name from doctors table
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('name')
      .eq('user_id', doctor_id)
      .single()

    if (doctorError || !doctorData) {
      return NextResponse.json({ error: 'Doctor info not found' }, { status: 404 })
    }

    const doctorName = doctorData.name

    return NextResponse.json({
      queue,
      doctorName,
      book_date,
      book_time
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
