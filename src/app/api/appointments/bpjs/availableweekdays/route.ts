import { NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function GET() {
  // Step 1: Get doctor IDs where bpjs is true
  const { data: bpjsDoctors, error: doctorError } = await supabase
    .from('doctors')
    .select('user_id')
    .eq('bpjs', true)

  if (doctorError) return NextResponse.json({ error: doctorError.message }, { status: 500 })

  const bpjsDoctorIds = bpjsDoctors.map(doc => doc.user_id)

  // Step 2: Get availability only for those doctors
  const { data, error } = await supabase
    .from('doctoravailability')
    .select('weekday')
    .in('doctor_id', bpjsDoctorIds)
    .neq('weekday', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const uniqueWeekdays = Array.from(new Set(data.map(d => d.weekday)))

  return NextResponse.json(uniqueWeekdays)
  }
