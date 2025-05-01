import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase';

export async function GET(req) {
  const sessionCookie = req.cookies.get('session')

  if (!sessionCookie?.value) {
    return NextResponse.json({ loggedIn: false }, { status: 401 })
  }

  //det sesion
  const { data: session, error} = await supabase
    .from('sessions')
    .select('*, users:user_id(*)')
    .eq('token', sessionCookie.value)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (error || !session) {
    const response = NextResponse.json({ loggedIn: false }, { status: 401 })
    response.cookies.delete('session');
    return response;
  }
  
  //confusion 
  const { password, ...safeUserData} = session.users;
  return NextResponse.json({ loggedIn: true, user: safeUserData});
}
