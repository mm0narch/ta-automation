import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
    const sessionCookie = req.cookies.get('session')
    
    //db
    try {
    if (sessionCookie?.value) {
        await supabase
            .from('sessions')
            .delete()
            .eq('token', sessionCookie.value)            
        }
    } catch(error) {
        console.error('Failed to remove session from DB', error)
    }
            
    const response = NextResponse.json({ success:true }, { status: 200 })
    response.cookies.delete('session')
    
    return response
}