import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name, specialization, bpjs } = body;

    if (!username || !name || !specialization || bpjs === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Look up user by username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user_id = userData.id;

    // 2. Insert into doctors table
    const { data: doctorData, error: insertError } = await supabase
      .from('doctors')
      .insert([{ user_id, name, specialization, bpjs }]);

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Doctor registered successfully', doctor: doctorData });
  } catch (err) {
    console.error('Unhandled error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
