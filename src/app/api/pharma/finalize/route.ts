import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { cookies } from 'next/headers'

interface PrescriptionItem {
  name: string;
  sub_kelas_terapi?: string;
  sediaan?: string;
  harga_obat?: number;
  similarity_percentage: number;
  frequency?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prescription_id, medicine, booking_id } = body

    console.log('[INFO] Request body received:', body)

    const cookieStore = await cookies(); 
    const sessionToken = cookieStore.get('session')?.value
    console.log('[INFO] Session token extracted:', sessionToken)

    if (!sessionToken) {
      console.warn('[WARN] No valid session token found in cookies.')
      return NextResponse.json({ error: 'No valid session' }, { status: 401 })
    }

    const { data: pharmaData, error: pharmaError } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('token', sessionToken)
    .single()

    if (!pharmaData || pharmaError) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
    }

    const pharmacistId = pharmaData.user_id

    console.log('[INFO] Pharmacist ID:', pharmacistId)

    const { data: prescriptionCode, error: prescriptionError } = await supabase
      .from('prescription')
      .select('id')
      .eq('booking_id', booking_id)
      .single()

    if (!prescriptionCode || prescriptionError) {
      console.error('[ERROR] Failed to retrieve prescription ID ', prescriptionError?.message)
      return NextResponse.json({ error: 'Prescription ID not found' }, { status: 401 })
    }

    const prescriptionId = prescriptionCode.id
    console.log('[INFO] Found prescription ID:', prescriptionId)

    const { error: updateError } = await supabase
      .from('bpjsrecord')
      .update({
        pharmacist_id: pharmacistId,
        prescription_id: prescriptionId,
        updated_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
      })
      .eq('booking_id', booking_id)

    if (updateError) {
      console.error('[ERROR] Failed to update bpjsrecord:', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('[SUCCESS] bpjsrecord updated successfully for booking_id:', booking_id)
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (e) {
    console.error('[FATAL ERROR]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
