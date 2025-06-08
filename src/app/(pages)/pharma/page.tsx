'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';



export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'prescription' | 'final'>('info');
  const [bookedPatients, setBookedPatients] = useState<any[]>([]);
  const [patientLoading, setPatientLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await fetch('/api/pharma/info');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch');
        setBookedPatients(json.patients || []);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setBookedPatients([]);
      } finally {
        setPatientLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <header className="relative w-full h-26">
        <Image
          src="/header-doc.jpg"
          alt="Header Background"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex flex-col space-y-1 items-end mt-1">
            <Image src="/vercel.svg" alt="Logo" width={76} height={38} />
            <span className="text-[#f9f9f9] text-sm font-semibold">pharmacist</span>
          </div>

          <div className="absolute left-[26%] flex space-x-6">
            {['info', 'prescription', 'final'].map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold hover:underline ${
                  activeTab === tab ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
                }`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab === 'info' ? 'patient info' : tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-1 bg-[#f9f9f9] my-1 mx-1 rounded-sm flex-1">
        {activeTab === 'info' && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold mb-4">Booked Patients</h2>

            {patientLoading ? (
              <p>Loading patient data...</p>
            ) : bookedPatients.length === 0 ? (
              <p>No patients booked yet.</p>
            ) : (
              <ul className="space-y-4">
                {bookedPatients.map((booking, idx) => (
                  <li
                    key={booking.booking_id || idx}
                    onClick={() => {
                      console.log('Patient booking clicked:', booking);
                      setSelectedBookingId(booking.booking_id || null);
                      setActiveTab('prescription'); 
                    }}
                    className={`p-4 border rounded shadow-sm bg-white cursor-pointer ${
                      selectedBookingId === booking.booking_id ? 'border-red-500 bg-red-50' : ''
                    }`}
                  >
                    <p><strong>Name:</strong> {booking.patients?.full_name || '-'}</p>
                    <p><strong>Diagnosis:</strong> {booking.diagnosisnotes || '-'}</p>
                    <p><strong>Booking ID:</strong> {booking.booking_id}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'prescription' && (
          <div className="h-[500px] flex items-center justify-center text-gray-500 text-xl">
            Prescription Section
          </div>
        )}

        {activeTab === 'final' && (
          <div className="h-[500px] flex items-center justify-center text-gray-500 text-xl">
            Finalization Section
          </div>
        )}
      </main>
    </div>
  );
}
