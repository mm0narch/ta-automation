import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { hashPassword } from '../../../../lib/hashPassword';

export async function POST(req: NextRequest) {
  try {
    const { full_name, birthdate, phone_number, address, password } = await req.json();

    // Check for existing phone number (or other unique field)
    const { data: existingPatient, error: checkError } = await supabase
      .from('patients')
      .select('id')
      .eq('phone_number', phone_number)
      .single();

    if (existingPatient) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing patient:', checkError);
      return NextResponse.json({ error: 'Database check error' }, { status: 500 });
    }

    const hashedPassword = await hashPassword(password);

    const { data: newPatient, error: insertError } = await supabase
      .from('patients')
      .insert([
        {
          full_name,
          birthdate,
          phone_number,
          address,
          password: hashedPassword,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to register patient' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Patient account created successfully',
      patient: {
        id: newPatient.id,
        full_name: newPatient.full_name,
      },
    }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
