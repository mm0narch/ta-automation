// /api/appointments/nonbpjs/availableweekdaysnon/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function GET(req: NextRequest) {
  const doctorId = req.nextUrl.searchParams.get('doctor_id')
  if (!doctorId) {
    return NextResponse.json({ error: 'Missing doctor_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('doctoravailability')
    .select('weekday')
    .eq('doctor_id', doctorId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const uniqueWeekdays = Array.from(new Set(data.map(d => d.weekday)))

  return NextResponse.json(uniqueWeekdays)
}
