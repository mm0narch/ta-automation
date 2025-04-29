import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  
  //det protected paths
  const protectedPaths = ['/admin', '/doctor', '/pharma'];

  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`)
  );
  
  //if not on protected path can proceed
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  //checks cookie
  const sessionCookie = request.cookies.get('session');
  
  //if invalid returns to login page
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url  ));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  //checks cookie expiration  
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', sessionCookie.value)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  //if invalid returns to login page
  if (sessionError || !session) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.delete('session');
    return response;
  }

  //checks user credentials
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user_id)
    .single()

  //user role check
  if (userError || !user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (path.startsWith('/admin') && user.role !=='admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  if (path.startsWith('/doctor') && user.role !=='doctor') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  if (path.startsWith('/pharma') && user.role !=='pharma') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  //everything checks 
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/pharma/:path*'],
};