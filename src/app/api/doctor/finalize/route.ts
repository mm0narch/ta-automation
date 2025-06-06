import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    const body = await req.json()
    const {} = body

}