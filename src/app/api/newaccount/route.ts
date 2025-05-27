import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { hashPassword } from '../../../../lib/hashPassword';

export async function POST(req: NextRequest) {
  const { username, password, role } = await req.json();

  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Database error while checking username' }, { status: 500 });
  }

  if (existingUsers) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ username, password: hashedPassword, role }])

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'User created successfully', 
  }, { status: 201 });
}
