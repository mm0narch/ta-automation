'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NonBPJSConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const doctor_id = searchParams.get('doctor_id')
  const date = searchParams.get('date')
  const time = searchParams.get('time')

  // Replace this with real patient ID from session/context
  const patient_id = 'dummy-patient-id'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Redirect back if missing required params
    if (!doctor_id || !date || !time) {
      router.replace('/patient/nonbpjs')
    }
  }, [doctor_id, date, time, router])

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/appointments/nonbpjs/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id, patient_id, date, time }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to book appointment')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/patient/nonbpjs/success'), 1500)
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg">
      <h1 className="text-xl font-semibold mb-4">Confirm Your Appointment</h1>

      <p className="mb-2">
        👨‍⚕️ Doctor ID: <strong>{doctor_id}</strong>
      </p>
      <p className="mb-2">
        📅 Date: <strong>{date}</strong>
      </p>
      <p className="mb-4">
        ⏰ Time: <strong>{time}</strong>
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">✅ Appointment confirmed!</p>}

      <button
        onClick={handleConfirm}
        disabled={loading || success}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50"
      >
        {loading ? 'Confirming...' : 'Confirm Appointment'}
      </button>
    </div>
  )
}
