import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { cookies } from 'next/headers'

interface PatientBooking {
  id: string
  book_date: string;
  book_time: string;
  patients: {
    full_name: string;
    birthdate: string;
    phone_number: string;
    address: string;
    bpjs: boolean;
  };
}

interface MedicineItem {
  name: string;
  sub_kelas_terapi?: string;
  sediaan?: string;
  frequency?: string;
  harga_obat?: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { icd10, booking_id, diagnosisnotes, medicine } = body
    console.log('[DEBUG] Request body:', body)

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value
    console.log('[DEBUG] Session token:', sessionToken)

    if (!sessionToken) {
      console.error('[ERROR] No session token found')
      return NextResponse.json({ error: 'No valid session' }, { status: 401 })
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('token', sessionToken)
      .single()

    if (sessionError || !sessionData) {
      console.error('[ERROR] Session fetch error:', sessionError)
      return NextResponse.json({ error: 'Invalid session token' }, { status: 400 })
    }

    const doctorId = sessionData.user_id
    console.log('[DEBUG] Logged in doctor ID:', doctorId)

    const { data: bookingInfo, error: bookingError } = await supabase
      .from('doctorbooking')
      .select('patient_id')
      .eq('id', booking_id)
      .single()

    if (bookingError || !bookingInfo) {
      console.error('[ERROR] Failed to fetch patient_id from booking:', bookingError)
      return NextResponse.json({ error: 'Failed to retrieve patient info' }, { status: 500 })
    }

    const patientId = bookingInfo.patient_id
    console.log('[DEBUG] Fetched patient_id:', patientId)

    if (!booking_id || !diagnosisnotes || !Array.isArray(icd10)) {
      console.error('[ERROR] Missing required fields:', { booking_id, diagnosisnotes, icd10 })
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const { data: recordData, error: recordError } = await supabase
      .from('bpjsrecord')
      .insert({
        booking_id,
        doctor_id: doctorId,
        patient_id: patientId,
        icd10,
        diagnosisnotes
      })

    if (recordError) {
      console.error('[ERROR] Inserting bpjsrecord:', recordError)
      return NextResponse.json({ error: recordError.message }, { status: 500 })
    }

    console.log('[DEBUG] BPJS record inserted')

    const { data: prescriptionData, error: prescriptionError } = await supabase
      .from('prescription')
      .insert({ booking_id, diagnosisnotes })
      .select('id')
      .single()

    if (prescriptionError || !prescriptionData) {
      console.error('[ERROR] Inserting prescription:', prescriptionError)
      return NextResponse.json({ error: 'Failed storing prescription data' }, { status: 400 })
    }

    const prescriptionId = prescriptionData.id
    console.log('[DEBUG] Prescription ID:', prescriptionId)

    const medItems = medicine.map((med: MedicineItem) => ({
      prescription_id: prescriptionId,
      frequency: med.frequency,
      harga_obat: med.harga_obat,
      medicine_name: med.name,
      sediaan: med.sediaan,
      sub_kelas_terapi: med.sub_kelas_terapi
    }))

    console.log('[DEBUG] Medicine items to insert:', medItems)

    const { error: itemError } = await supabase
      .from('prescriptionitem')
      .insert(medItems) // insert array, not as object
      // no `.single()` here since it's an array insert

    if (itemError) {
      console.error('[ERROR] Inserting prescription items:', itemError)
      return NextResponse.json({ error: 'Failed storing prescription items' }, { status: 400 })
    }

    console.log('[DEBUG] Prescription items inserted successfully')
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (e) {
    console.error('[FATAL ERROR]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
