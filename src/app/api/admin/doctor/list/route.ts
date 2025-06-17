import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';

export async function GET() {
  console.log('[GET] /api/admin/doctor/list - Fetching doctor list...');

  const { data, error } = await supabase
    .from('doctors')
    .select('user_id, name, specialization, bpjs, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ERROR] Failed to fetch doctors:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[SUCCESS] Retrieved ${data.length} doctor(s).`);
  console.log('[DATA]', data);

  return NextResponse.json(data);
}
