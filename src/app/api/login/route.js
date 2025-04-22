import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";

function generateSessionToken() {
    return uuidv4();
}

export async function POST(req) {
    const { username, password } = await req.json()

    //get user and password
    const { data: user, error } = await supabase()
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    //compare password
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    //sesh token
    const sessionToken = generateSessionToken(user.username)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    //store sesh in db
    const { error: sessionError } = await supabase()
        .from('sessions')
        .insert({
            user_id: user.id,
            token: sessionToken,
            expires_at: expiresAt.toISOString(),
        });

    if (sessionError) {
        console.error("Session creation error:", sessionError);
        return NextResponse.json({error: 'Server Error'},  { status: 500 })
    }
    
    const response = NextResponse.json({ success: true })

    response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // valid 4 a day
    });
    
    return response
}