import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../../lib/supabase'

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id

  const { data, error } = await supabase
    .from('doctors')
    .select('name')
    .eq('user_id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
