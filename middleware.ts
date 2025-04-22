import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {

  const protectedPaths = ['/...', '/...'];

  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`)
  );
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/...', request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', sessionCookie.value)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
};