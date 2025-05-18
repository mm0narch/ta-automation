import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { hashPassword } from '../../../../lib/hashPassword';

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password: hashedPassword, role }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created', data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
