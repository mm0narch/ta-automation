import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name } = body;

    if (!username || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user_id = userData.id;

    const { data: pharmacistData, error: insertError } = await supabase
      .from('pharmacists')
      .insert([{ user_id, name }]);

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Pharmacist registered successfully',
      pharmacist: pharmacistData,
    });
  } catch (err) {
    console.error('Unhandled error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
