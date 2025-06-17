import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';

export async function GET(req: NextRequest) {
  const doctorId = req.nextUrl.searchParams.get('doctor_id');

  if (!doctorId) {
    return NextResponse.json({ message: 'Missing doctor_id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('doctoravailability')
    .select('weekday, start_time, end_time')
    .eq('doctor_id', doctorId)
    .order('weekday', { ascending: true });

  if (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ message: 'Failed to fetch availability' }, { status: 500 });
  }

  return NextResponse.json(data);
}
