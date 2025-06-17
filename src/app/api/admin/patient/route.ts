import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, birthdate, phone_number, address, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
