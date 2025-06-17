import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('pharmacists')
    .select('user_id, name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pharmacists:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
