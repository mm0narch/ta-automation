import { NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('doctoravailability')
    .select('weekday')
    .neq('weekday', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const uniqueWeekdays = Array.from(new Set(data.map(d => d.weekday)))

  return NextResponse.json(uniqueWeekdays)
}
