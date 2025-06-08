import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Step 1: Get the prescription_id from prescription table
    const { data: prescription, error: prescError } = await supabase
      .from('prescription')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (prescError || !prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const prescriptionId = prescription.id;

    // Step 2: Get medicine data from prescriptionitem table
    const { data: items, error: itemsError } = await supabase
      .from('prescriptionitem')
      .select('*')
      .eq('prescription_id', prescriptionId);

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch prescription items' }, { status: 500 });
    }

    return NextResponse.json({ prescriptionId, items }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
