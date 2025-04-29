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
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', sessionCookie.value)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  //in invalid returns to login page
  if (error || !data) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.delete('session');
    return response;
  }
  
  //everything checks
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/pharma/:path*'],
};