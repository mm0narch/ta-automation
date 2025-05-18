// app/api/patient/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../../lib/supabase'; // adjust path if needed

export async function POST(req: Request) {
  try {
    const {
      full_name,
      birthdate,
      phone_number,
      address,
      patient_type,
      email,
      password,
    } = await req.json();

    if (
      !full_name ||
      !birthdate ||
      !phone_number ||
      !address ||
      !patient_type ||
      !email ||
      !password
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('patients')
      .insert([
        {
          full_name,
          birthdate,
          phone_number,
          address,
          patient_type,
          email,
          password: hashedPassword,
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Patient registered successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
