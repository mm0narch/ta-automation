'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BPJSConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const date = searchParams.get('date')
  const time = searchParams.get('time')

  const [isPast, setIsPast] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!date || !time) return

    const selectedDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    setIsPast(selectedDateTime < now)
  }, [date, time])

  const handleConfirm = async () => {
    if (!date || !time || isPast) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/appointments/bpjs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date, time }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert('Failed to book appointment: ' + err.message)
        return
      }

      router.push('/patient/bpjs/success')
    } catch (err) {
      alert('Something went wrong.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!date || !time) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-red-600">Invalid appointment data.</h1>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Confirm BPJS Appointment</h1>
      <p className="mb-2">Date: <strong>{date}</strong></p>
      <p className="mb-4">Time: <strong>{time}</strong></p>

      {isPast && (
        <p className="text-red-600 mb-4">
          You cannot schedule an appointment in the past. Please go back and choose another time.
        </p>
      )}

      <button
        onClick={handleConfirm}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={isPast || submitting}
      >
        {submitting ? 'Booking...' : 'Confirm Appointment'}
      </button>
    </div>
  )
}
