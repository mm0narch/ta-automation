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
    const fetchUser = async () => {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUsername(data.user?.username || '');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
    });

    if (res.ok) {
      window.location.href = '/dashboard';
    } else {
      console.error('Logout failed');
    }
  };
  
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
        
        <div className="absolute inset-0 flex justify-between items-center px-6">
          {/* Left section: logo + role */}
          <div className="flex flex-col space-y-1 mt-1">
            <Image src="/vercel.svg" alt="Logo" width={76} height={38} />
            <span className="text-[#f9f9f9] text-sm font-semibold">pharmacist</span>
          </div>

          {/* Right section: greeting + logout */}
          <div className="flex items-center space-x-6">
            <span className="text-[#f9f9f9] text-lg font-semibold">
              {username ? `hello, ${username}` : 'loading...'}
            </span>
            <button
              onClick={() => {
                console.log('Logout button clicked');
                handleLogout();
              }}
              className="p-1 rounded-lg hover:bg-white transition duration-200 group"
            >
              <Image src="/logout_final.png" alt="Logout" width={24} height={24} className="group-hover:hidden" />
              <Image src="/logout_colored.png" alt="Logout Hover" width={24} height={24} className="hidden group-hover:block" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 bg-[#f9f9f9] my-1 mx-1 rounded-sm flex-1">
        <div className="mt-4 px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 lowercase tracking-wide">patients & prescriptions</h2>

          {patientLoading ? (
            <p>Loading patient data...</p>
          ) : bookedPatients.length === 0 ? (
            <p>No patients booked yet.</p>
          ) : (
            <ul className="space-y-4">
              {bookedPatients.map((booking, idx) => (
                <li
                  key={booking.booking_id || idx}
                  className={`rounded-md border border-gray-300 bg-gray-100 cursor-pointer transition duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-md hover:bg-indigo-100 ${
                    selectedBookingId === booking.booking_id ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  <button
                    className="w-full text-left p-4"
                    onClick={() => {
                      if (selectedBookingId === booking.booking_id) {
                        setSelectedBookingId(null);
                        setMedicineList(null);
                      } else {
                        setSelectedBookingId(booking.booking_id);
                      }
                    }}
                  >
                    <p className="font-semibold text-lg text-gray-800">
                      {booking.patients?.full_name || 'Unnamed Patient'}
                    </p>
                    <p>
                      <strong className="text-gray-800">diagnosis:</strong>{' '}
                      <span className="text-gray-800">{booking.diagnosisnotes || '-'}</span>
                    </p>
                    <p>
                      <strong className="text-gray-800">booking ID:</strong>{' '}
                      <span className="text-gray-800">{booking.booking_id}</span>
                    </p>
                  </button>

                  {selectedBookingId === booking.booking_id && (
                    <div className="border-t px-4 py-4">
                      <h3 className="text-md font-semibold mb-2 text-gray-800">prescribed medicines</h3>
                    
                      {medicineLoading ? (
                        <p className="text-gray-600">Loading medicines</p>
                      ) : !medicineList ? (
                        <p className="text-gray-500">No prescription loaded.</p>
                      ) : medicineList.length === 0 ? (
                        <p className="text-gray-500">No medicines prescribed for this booking.</p>
                      ) : (
                        <ul className="space-y-3">
                          {medicineList.map((med, idx) => (
                            <li key={idx} className="border rounded p-3 bg-white text-gray-800">
                              <p><strong>medicine name:</strong> {med.medicine_name}</p>
                              <p><strong>therapy class:</strong> {med.sub_kelas_terapi}</p>
                              <p><strong>form:</strong> {med.sediaan}</p>
                              <p><strong>frequency:</strong> {med.frequency}</p>
                              <p><strong>price:</strong> Rp {med.harga_obat}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {medicineList && medicineList.length > 0 && (
                        <div className="mt-4">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/pharma/finalize', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    booking_id: selectedBookingId,
                                    prescription_id: null,
                                    medicine: medicineList.map(med => ({
                                      name: med.medicine_name,
                                      sub_kelas_terapi: med.sub_kelase_terapi,
                                      sediaan: med.sediaan,
                                      frequency: med.frequency,
                                      harga_obat: med.harga_obat,
                                      similarity_percentage: 0,
                                    })),
                                  }),
                                });

                                const json = await res.json();
                                if (!res.ok) {
                                  alert('Failed to finalize prescription: ' + json.error);
                                  return;
                                }

                                alert('Prescription finalized successfully!');
                                setSelectedBookingId(null);
                                setMedicineList(null);
                              } catch (err) {
                                alert('Unexpected error during finalization.');
                                console.error(err);
                              }
                            }}
                            className="bg-gradient-to-r from-[#040035] to-[#F50137] font-semibold text-white px-6 py-2 rounded transition hover:brightness-110 w-full min-w-[240px] md:w-auto"
                          >
                            confirm & submit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}