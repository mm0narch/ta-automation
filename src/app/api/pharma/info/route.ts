import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET() {
    const { data, error } = await supabase
    .from('bpjsrecord')
    .select(`booking_id, doctor_id, diagnosisnotes, patients:patient_id (
      full_name,
      birthdate,
      phone_number,
      address,
      bpjs
    )`)
    .is('confirmed_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ patients: data || [] }, { status: 200 });
}
