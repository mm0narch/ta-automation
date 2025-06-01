'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type AvailableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

type TimeSlot = {
  time: string
  isBooked: boolean
}

export default function BPJSAppointmentPage() {
  const router = useRouter()
  const [availableWeekdays, setAvailableWeekdays] = useState<AvailableDay[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Fetch available weekdays on load
  useEffect(() => {
    fetch('/api/appointments/bpjs/availableweekdays')
      .then(res => res.json())
      .then(data => setAvailableWeekdays(data))
  }, [])

  // Fetch time slots when a date is selected
  useEffect(() => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    fetch(`/api/appointments/bpjs/timeslots?date=${dateStr}`)
      .then(res => res.json())
      .then(data => setTimeSlots(data))
  }, [selectedDate])

  // Disable dates not in availableWeekdays
  const isDateAvailable = (date: Date) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }) as AvailableDay
    return availableWeekdays.includes(weekday)
  }

  // Handle confirmation step
  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const query = new URLSearchParams({
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime
      })
      router.push(`/patient/bpjs/confirm?${query.toString()}`)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-center">BPJS Appointment</h1>

      {/* Calendar using react-datepicker */}
      <div>
        <label className="block mb-2 font-medium">Select a Date</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            if (date && isDateAvailable(date)) {
              setSelectedDate(date)
              setSelectedTime(null) // Reset time when date changes
            } else {
              alert('No doctor available on this day.')
              setSelectedDate(null)
              setTimeSlots([])
            }
          }}
          filterDate={isDateAvailable}
          placeholderText="Select a date"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Time Slot Picker */}
      {selectedDate && (
        <div>
          <label className="block mb-2 font-medium">Select a Time</label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={slot.isBooked}
                onClick={() => setSelectedTime(slot.time)}
                className={`p-2 rounded border text-sm ${
                  slot.isBooked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedTime === slot.time
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedDate && selectedTime && (
        <button
          onClick={handleContinue}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Continue to Confirmation
        </button>
      )}
    </div>
  )
}
