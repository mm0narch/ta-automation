import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../../lib/supabase';

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Missing schedule ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('doctoravailability')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Schedule deleted' });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}