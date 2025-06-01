'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type ApiResponse = {
  queue: number
  doctorName: string
  error?: string
  book_date: string
  book_time: string
}

function formatDate(dateStr: string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateStr).toLocaleDateString(undefined, options)
}

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function NonBpjsSuccessPage() {
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<number | null>(null)
  const [doctorName, setDoctorName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [book_date, setBookDate] = useState<string>('')
  const [book_time, setBooktime] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    async function fetchBookingInfo() {
      try {
        const res = await fetch('/api/appointments/nonbpjs/success')
        if (!res.ok) throw new Error('Failed to fetch booking info')
        const data: ApiResponse = await res.json()

        if (data.error) {
          setError(data.error)
        } else {
          setQueue(data.queue)
          setDoctorName(data.doctorName)
          setBookDate(data.book_date)
          setBooktime(data.book_time)
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchBookingInfo()
  }, [])

  const goToDashboard = () => {
    router.push('/patient')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <p>Loading your booking info...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={goToDashboard}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-blue-100 text-blue-800 px-6 py-5 rounded-2xl shadow-md max-w-md">
        <h1 className="text-2xl font-bold mb-3">Booking Confirmed ✅</h1>
        <p className="mb-2">Your booking info has been submitted!</p>
        <p className="mb-2 font-medium">Here is your queue number:</p>
        <p className="text-3xl font-bold text-blue-700 mb-4">{queue}</p>
        <p className="text-lg mb-4">{doctorName}</p>
        {book_date && book_time && (
          <p className="mb-2">
            Your appointment is scheduled for{' '}
            <strong>{formatDate(book_date)}</strong> at{' '}
            <strong>{formatTime(book_time)}</strong>.
          </p>
        )}

        <button
          onClick={goToDashboard}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
