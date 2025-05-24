import { NextResponse } from "next/server";
import { supabase } from '../../../../lib/supabase';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

function generateSessionToken() {
  return uuidv4();
}

export async function POST(req: Request) {
  const { phone_number, password } = await req.json();

  // get patient by phone number
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('phone_number', phone_number)
    .single();

  if (error || !patient) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // check password
  const validPassword = await bcrypt.compare(password, patient.password);
  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // generate session token
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 1 day session

  // insert into patientsession table
  const { error: sessionError } = await supabase
    .from('patientsession')
    .insert({
      user_id: patient.id,
      token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });

  if (sessionError) {
    console.error("Session creation error:", sessionError);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  // send response and set cookie
  const { password: _, ...safePatientData } = patient;

  const response = NextResponse.json({
    success: true,
    patient: safePatientData,
  });

  response.cookies.set('patient_session', sessionToken, {
    httpOnly: true,
    secure: false, // set to true in production
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
