import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase';

export async function GET(req) {
  const sessionCookie = req.cookies.get('patient_session')

  if (!sessionCookie?.value) {
    return NextResponse.json({ loggedIn: false }, { status: 401 })
  }

  //det sesion
  const { data: session, error} = await supabase
    .from('patientsession')
    .select('*, patients:user_id(*)')
    .eq('token', sessionCookie.value)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (error || !session) {
    const response = NextResponse.json({ loggedIn: false }, { status: 401 })
    response.cookies.delete('session');
    return response;
  }

  //confusion 
  const { password, ...safeUserData} = session.patients;
  return NextResponse.json({ loggedIn: true, user: safeUserData});
}