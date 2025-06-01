  'use client'

  import { useEffect, useState } from 'react'
  import { useRouter, useSearchParams } from 'next/navigation'
  import DatePicker from 'react-datepicker'
  import 'react-datepicker/dist/react-datepicker.css'

  type AvailableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

  type TimeSlot = {
    time: string
    isBooked: boolean
  }

  export default function NonBPJSAppointmentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const doctorId = searchParams.get('doctor_id')    

    const [availableWeekdays, setAvailableWeekdays] = useState<AvailableDay[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Fetch available weekdays for the doctor
    useEffect(() => {
      if (!doctorId) {
        console.warn('No doctor_id found in search params')
        return
      }
      console.log(`Fetching available weekdays for doctor_id=${doctorId}`)
      fetch(`/api/appointments/nonbpjs/availableweekdaysnon?doctor_id=${doctorId}`)
        .then(res => res.json())
        .then(data => {
          console.log('Available weekdays response:', data)
          setAvailableWeekdays(data)
        })
        .catch(error => console.error('Error fetching available weekdays:', error))
    }, [doctorId])

    // Fetch time slots based on selected date
    useEffect(() => {
      if (!selectedDate || !doctorId) return
      const dateStr = selectedDate.toISOString().split('T')[0]
      console.log(`Fetching time slots for date=${dateStr}, doctor_id=${doctorId}`)
      fetch(`/api/appointments/nonbpjs/timeslotsnon?doctor_id=${doctorId}&date=${dateStr}`)
        .then(res => {
          if (!res.ok) {
              throw new Error('HTTP error! status: ${res.status}')
          } return res.json()
        })
        .then(data => {
          console.log('Time slots response:', data)
          setTimeSlots(data)
        })
        .catch(error => console.error('Error fetching time slots:', error))
    }, [selectedDate, doctorId])

    const isDateAvailable = (date: Date) => {
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }) as AvailableDay
      const result = availableWeekdays.includes(weekday)
      console.log(`Checking if date ${date.toDateString()} (${weekday}) is available:`, result)
      return result
    }

    const handleContinue = () => {
      if (selectedDate && selectedTime && doctorId) {
        const query = new URLSearchParams({
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          doctor_id: doctorId
        })
        console.log('Navigating to confirmation page with params:', query.toString())
        router.push(`/patient/nonbpjs/confirm?${query.toString()}`)
      } else {
        console.warn('Missing selectedDate, selectedTime, or doctorId:', {
          selectedDate,
          selectedTime,
          doctorId
        })
      }
    }

    return (
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-center">Non-BPJS Appointment</h1>

        {/* Calendar using react-datepicker */}
        <div>
          <label className="block mb-2 font-medium">Select a Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              if (date) {
                console.log('Date selected:', date)
                if (isDateAvailable(date)) {
                  setSelectedDate(date)
                  setSelectedTime(null)
                } else {
                  alert('No doctor available on this day.')
                  console.warn('Date selected is not available:', date)
                  setSelectedDate(null)
                  setTimeSlots([])
                }
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
                  onClick={() => {
                    console.log('Time selected:', slot.time)
                    setSelectedTime(slot.time)
                  }}
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
