import { NextResponse } from 'next/server'

export async function GET(req) {
  const session = req.cookies.get('session')

  if (!session) {
    return NextResponse.json({ loggedIn: false }, { status: 401 })
  }

  return NextResponse.json({ loggedIn: true, session: session.value })
}
