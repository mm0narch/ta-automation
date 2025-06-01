import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get('specialization');

  if (!specialization) {
    return NextResponse.json({ error: 'Specialization required' }, { status: 400 });
  }

  //get doctors with corresponding specialization, no bpjs docs
  const { data, error } = await supabase
    .from('doctors')
    .select('user_id, name, specialization')
    .eq('specialization', specialization)
    .eq('bpjs', false); 

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
