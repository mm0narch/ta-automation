import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
        return NextResponse.json({ error: 'No Valid Session'}, { status: 401})

    }

    //get user_id from sessions
    const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('user_id')
        .eq('token',    sessionToken)
        .single()

    if ( sessionError || !sessionData) {
        return NextResponse.json({ error: 'Invalid session token'}, { status: 400 })

    }

    const doctorId = sessionData.user_id

    const { data: patientData, error: dataError } = await supabase
        .from('doctorbooking')
        .select(`id, book_date, book_time, 
            patients:patient_id (full_name, birthdate, phone_number, address, bpjs)`)
        .eq('doctor_id', doctorId)
        .order('book_date', { ascending: true})
    
    if ( dataError || !patientData) {
        return NextResponse.json({ error: 'Mising data' }, { status: 400 })
    }

    return NextResponse.json({ patientData }, { status: 200 })
}