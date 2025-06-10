import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    const { booking_id } = await req.json();

    if (!booking_id || typeof booking_id !== 'string') {
        return NextResponse.json({ error: 'Invalid booking_id' }, { status: 400 });
    }
     
    const { data: bookingData, error: bookingError} = await supabase
    .from('prescription')
    .select('id')
    .eq('booking_id', booking_id)
    .single()

    if (!bookingData || bookingError) {
        return NextResponse.json({ error: 'No booking data' }, { status: 401 })
    }

    const prescriptionId = bookingData.id

    const { data: prescriptionData, error: prescriptError } = await supabase
    .from('prescriptionitem')
    .select(`medicine_name, sub_kelas_terapi, sediaan, frequency, harga_obat`)
    .eq('prescription_id', prescriptionId)

    if (!prescriptionData || prescriptError) {
        return NextResponse.json({ error: 'No prescription data' }, { status: 401 })
    }
    
    return NextResponse.json({ medicine: prescriptionData }, { status: 200 })
}