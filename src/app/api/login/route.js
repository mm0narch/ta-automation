import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";

function generateSessionToken(username) {
    return `${username}-${Date.now()}`
}

export async function POST(req) {
    const { username, password } = await req.json()

    const { data, error } = await supabase()
        .from('users')
        .select('*')
        .eq('username', username)
        .single()
    
    if (error || !data) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, data.password)
    if (!validPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const sessionToken = generateSessionToken(data.username)

    const response = NextResponse.json({ success: true })

    response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // valid 4 a day
    })
    
    return response
}