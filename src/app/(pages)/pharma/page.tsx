'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BookedPatient {
  booking_id: string;
  diagnosisnotes: string;
  patients: {
    full_name: string;
    birthdate: string;
    phone_number: string;
    address: string;
    bpjs: boolean;
  };
}

interface PrescriptionItem {
  medicine_name: string;
  sub_kelase_terapi?: string;
  sediaan?: string;
  frequency?: string;
  harga_obat?: number;
}

export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'prescription' | 'final'>('info');
  const [username, setUsername] = useState('');

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookedPatients, setBookedPatients] = useState<any[]>([]);
  const [patientLoading, setPatientLoading] = useState(true);

  const [medicineList, setMedicineList] = useState<any[] | null>(null);
  const [medicineLoading, setMedicineLoading] = useState(false);

  // Fetch booked patients on mount
  useEffect(() => {
    const fetchPatientData = async () => {
      console.log('Fetching patient data...');
      try {
        const res = await fetch('/api/pharma/info');
        console.log('Patient data response status:', res.status);

        const json = await res.json();
        console.log('Patient data parsed JSON:', json);

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

  // Fetch medicine data whenever selectedBookingId changes
  useEffect(() => { 
    if (!selectedBookingId) {
      console.log('No selected booking ID, clearing medicine list');

      setMedicineList(null);
      return;
    }

    const fetchMedicineData = async () => {
      console.log(`Fetching medicines for booking_id: ${selectedBookingId}`);

      setMedicineLoading(true);
      try {
        const res = await fetch('/api/pharma/prescript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: selectedBookingId }),
        });

        const json = await res.json();
        console.log('Medicine fetch parsed JSON:', json);

        if (!res.ok) throw new Error(json.error || 'Failed to fetch medicines');

        setMedicineList(json.medicine);
      } catch (err) {
        console.error('Medicine fetch failed', err);
        setMedicineList(null);
      } finally {
        setMedicineLoading(false);
      }
    };

    fetchMedicineData();
  }, [selectedBookingId]);

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
            <button
              onClick={() => setActiveTab('info')}
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'info' ? 'text-[#ee0035] font-bold' : 'text-[#f9f9f9]'
              }`}
            >
              patient info
            </button>
            <button
              onClick={() => {
                if (selectedBookingId) setActiveTab('prescription');
              }}
              disabled={!selectedBookingId}
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'prescription' ? 'text-[#ee0035] font-bold' : 'text-[#f9f9f9]'
              } ${!selectedBookingId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              prescription
            </button>
            <button
              onClick={() => {
                if (selectedBookingId) setActiveTab('final');
              }}
              disabled={!selectedBookingId}
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'final' ? 'text-[#ee0035] font-bold' : 'text-[#f9f9f9]'
              } ${!selectedBookingId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              finalization
            </button>
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
                      console.log('Selected booking:', booking.booking_id);
                      setSelectedBookingId(booking.booking_id || null);
                      setActiveTab('prescription');
                    }}
                    className={`p-4 border rounded shadow-sm bg-white cursor-pointer ${
                      selectedBookingId === booking.booking_id ? 'border-red-500 bg-red-50' : ''
                    }`}
                  >
                    <p>
                      <strong>Name:</strong> {booking.patients?.full_name || '-'}
                    </p>
                    <p>
                      <strong>Diagnosis:</strong> {booking.diagnosisnotes || '-'}
                    </p>
                    <p>
                      <strong>Booking ID:</strong> {booking.booking_id}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'prescription' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Prescription Details</h2>

            {medicineLoading ? (
              <p className="text-gray-600">Loading medicines...</p>
            ) : !medicineList ? (
              <p className="text-gray-500">No prescription loaded.</p>
            ) : medicineList.length === 0 ? (
              <p className="text-gray-500">No medicines prescribed for this booking.</p>
            ) : (
              <ul className="space-y-3">
                {medicineList.map((med, idx) => (
                  <li key={idx} className="border rounded p-4 bg-white shadow-sm">
                    <p>
                      <strong>Medicine Name:</strong> {med.medicine_name}
                    </p>
                    <p>
                      <strong>Therapy Class:</strong> {med.sub_kelase_terapi}
                    </p>
                    <p>
                      <strong>Form:</strong> {med.sediaan}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {med.frequency}
                    </p>
                    <p>
                      <strong>Price:</strong> Rp {med.harga_obat}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'final' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Finalize Prescription</h2>

            <p className="text-gray-600">Click the button below to finalize and submit the prescription for this patient.</p>

            <button
              onClick={async () => {
                if (!selectedBookingId || !medicineList) {
                  alert('Missing booking ID or medicine list.');
                  return;
                }

                try {
                  const res = await fetch('/api/pharma/finalize', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      booking_id: selectedBookingId,
                      prescription_id: null, // this is optional if your API gets it itself
                      medicine: medicineList.map(med => ({
                        name: med.medicine_name,
                        sub_kelas_terapi: med.sub_kelase_terapi,
                        sediaan: med.sediaan,
                        frequency: med.frequency,
                        harga_obat: med.harga_obat,
                        similarity_percentage: 0, // or something default
                      })),
                    }),
                  });

                  const json = await res.json();

                  if (!res.ok) {
                    console.error('Finalization failed:', json.error);
                    alert('Failed to finalize prescription: ' + json.error);
                    return;
                  }

                  alert('Prescription finalized successfully!');
                  setActiveTab('info');
                  setSelectedBookingId(null);
                  setMedicineList(null);
                } catch (err) {
                  console.error('Finalization error:', err);
                  alert('Unexpected error during finalization.');
                }
              }}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
            >
              Confirm & Submit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}