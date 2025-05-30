'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type PatientUser = {
  id: string
  full_name: string
  phone_number: string
}

export default function PatientDashboard() {
  const [user, setUser] = useState<PatientUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/patientme', {
          credentials: 'include',
        })

        if (!res.ok) {
          router.replace('/patientlogin')
          return
        }

        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error('Error checking session:', err)
        router.replace('/patientlogin')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (loading) return <div className="p-6">Loading patient dashboard...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.full_name}</h1>

      <div className="grid gap-4 w-full max-w-sm">
        <button
          onClick={() => router.push('/patient/bpjs/register')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
        >
          Register BPJS Membership
        </button>

        <button
          onClick={() => router.push('/patient/bpjs')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
        >
          BPJS
        </button>

        <button
          onClick={() => router.push('/patient/nonbpjs')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
        >
          Non-BPJS
        </button>
      </div>
    </div>
  )
}