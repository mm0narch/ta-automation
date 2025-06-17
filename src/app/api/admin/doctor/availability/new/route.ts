import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const { doctor_id, weekday, start_time, end_time } = await req.json();

    if (!doctor_id || !weekday || !start_time || !end_time) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('doctoravailability')
      .insert([{ doctor_id, weekday, start_time, end_time }]);

    if (error) throw error;

    return NextResponse.json({ message: 'Schedule created', data });
  } catch (err) {
    console.error('Error creating schedule:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}