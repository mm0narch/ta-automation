'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type PatientUser = {
  id: string
  full_name: string
  phone_number: string
  // add other fields if needed
}

export default function PatientDashboard() {
  const [user, setUser] = useState<PatientUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/patientme', {
          credentials: 'include', // 👈 IMPORTANT to send cookies like patient_session
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

  if (loading) return <div>Loading patient dashboard...</div>

  if (!user) return null // already redirected if unauthorized

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.full_name}</h1>
      {/* Add more dashboard UI here */}
    </div>
  )
}
