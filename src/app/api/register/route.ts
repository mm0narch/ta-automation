import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { full_name, birthdate, phone_number, address, sex } = body;

    const { data, error } = await supabase
      .from('patients')
      .insert([
        { full_name, birthdate, phone_number, address, sex },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Registration successful', data }, { status: 200 });
  } catch (error) {
    console.error('Error processing registration:', error);
    return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
  }
}
