import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function POST(req: NextRequest) {
  const { doctor_id, patient_id, book_date, book_time } = await req.json()

  if (!doctor_id || !patient_id || !book_date || !book_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('doctorbooking')
    .insert([{ doctor_id, patient_id, book_date, book_time }])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Booking confirmed' })
}
