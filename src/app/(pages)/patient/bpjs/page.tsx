'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00']

export default function BPJSAppointmentPage() {
  const [date, setDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
    if (!date || !selectedTime) {
      alert('Please select a date and time slot')
      return
    }

    router.push(`/patient/bpjs/confirm?date=${date}&time=${selectedTime}`)
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book BPJS Appointment</h1>

      <label className="block mb-4">
        <span className="text-sm">Select Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </label>

      <div className="mb-4">
        <span className="block text-sm mb-2">Select Time Slot</span>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedTime(slot)}
              className={`p-2 rounded border ${
                selectedTime === slot ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Confirm Appointment
      </button>
    </div>
  )
}