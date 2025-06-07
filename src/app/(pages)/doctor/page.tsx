'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PatientBooking {
  id: string
  book_date: string;
  book_time: string;
  patients: {
    full_name: string;
    birthdate: string;
    phone_number: string;
    address: string;
    bpjs: boolean;
  };
}

interface Icd10Prediction {
  kode_icd: string;
  nama_penyakit: string;
  similarity_percentage: number;
}

interface MedicinePrediction {
  name: string;
  sub_kelas_terapi?: string;
  sediaan?: string;
  harga_obat?: number;
  similarity_percentage: number;
  frequency?: string;
}

export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'final'>('info');
  const [username, setUsername] = useState('');

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookedPatients, setBookedPatients] = useState<PatientBooking[]>([]);
  const [patientLoading, setPatientLoading] = useState(true)

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Icd10Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [medicineQuery, setMedicineQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState<MedicinePrediction[]>([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState('');

  const [selectedIcds, setSelectedIcds] = useState<Icd10Prediction[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicinePrediction[]>([]);
  const [notes, setNotes] = useState('');

  const selectedBooking = bookedPatients.find(b => b.id === selectedBookingId);
  

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
    const fetchBookedPatients = async () => {
      try {
        const res = await fetch('/api/doctor/info');
        const data = await res.json();

        if (res.ok && data.patientData) {
          setBookedPatients(data.patientData);
          setPatientLoading(false);
        } else {
          console.error('Failed to fetch patient data:', data.error);
          setPatientLoading(false);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setPatientLoading(false);
      }
    };

    fetchBookedPatients();
  }, []);

  
  const handleIcd10Search = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('/api/doctor/icd10predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (res.ok && data.predictions) {
        setResults(data.predictions);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineSearch = async () => {
    setMedicineLoading(true);
    setMedicineError('');
    setMedicineResults([]);

    try {
      const res = await fetch('/api/doctor/medicinepredict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: medicineQuery }),
      });

      const data = await res.json();
      if (res.ok && data.predictions) {
        setMedicineResults(data.predictions);
      } else {
        setMedicineError(data.error || 'Medicine prediction failed');
      }
    } catch (err) {
      console.error(err);
      setMedicineError('Something went wrong');
    } finally {
      setMedicineLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
  if (!selectedIcds || !selectedMedicines || !notes.trim()) {
    alert('Please fill all fields.');
    return;
  }

  const payload = {
    icd10: selectedIcds.map(icd => icd.kode_icd),           
    booking_id: selectedBookingId, 
    diagnosisnotes: notes, 
    medicine: selectedMedicines    
  };

  console.log('Final Submission:', payload);

  try {
    const res = await fetch('/api/doctor/finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // Fix: 'Content Type' => 'Content-Type'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(`Error: ${errorData.error || 'Unknown error'}`);
      return;
    }

    const data = await res.json();
    alert('Submission successful!');
    // handle post-submit behavior here (e.g., redirect or clear form)
  } catch (err) {
    console.error('Fetch error:', err);
    alert('Failed to submit. Please try again.');
  }
};

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <header className="relative w-full h-26">
        <Image src="/header-doc.jpg" alt="Header Background" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex flex-col space-y-1 items-end mt-1">
            <Image src="/vercel.svg" alt="Logo" width={76} height={38} />
            <span className="text-[#f9f9f9] text-sm font-semibold">physician</span>
          </div>

          <div className="absolute left-[26%] flex space-x-6">
            <button
              onClick={() => {
                console.log('Tab clicked: info');
                setActiveTab('info');
              }}
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'info' ? 'text-[#ee0035] font-bold' : 'text-[#f9f9f9]'
              }`}
            >
              patient info
            </button>
            <button
              onClick={() => {
                if (selectedBookingId) {
                  console.log('Tab clicked: details with booking id', selectedBookingId);
                  setActiveTab('details');
                } else {
                  console.log('Details tab disabled - no booking selected');
                }
              }}
              disabled={!selectedBookingId}
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'details' ? 'text-[#ee0035] font-bold' : 'text-[#f9f9f9]'
              } ${!selectedBookingId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              details
            </button>
            <button
              onClick={() => {
                if (selectedBookingId) {
                  console.log('Tab clicked: final with booking id', selectedBookingId);
                  setActiveTab('final');
                } else {
                  console.log('Finalization tab disabled - no booking selected');
                }
              }}
              disabled={!selectedBookingId}
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'final' ? 'text-[#ee0035] font-bold' : 'text-[#f9f9f9]'
              } ${!selectedBookingId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              finalization
            </button>
          </div>

          <div className="absolute right-7 flex space-x-6">
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

      <main className="p-4 bg-[#f9f9f9] my-2 mx-4 rounded-sm flex-1">
        <div className="h-full flex flex-col items-center justify-start text-gray-700 text-lg">
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
                      key={booking.id || idx}
                      onClick={() => {
                        console.log('Patient booking clicked:', booking);
                        setSelectedBookingId(booking.id || null);
                        setActiveTab('details');
                      }}
                      className={`p-4 border rounded shadow-sm bg-white cursor-pointer ${
                        selectedBookingId === booking.id ? 'border-red-500 bg-red-50' : ''
                      }`}
                    >
                      <p><strong>Name:</strong> {booking.patients.full_name}</p>
                      <p><strong>Birthdate:</strong> {booking.patients.birthdate}</p>
                      <p><strong>Phone:</strong> {booking.patients.phone_number}</p>
                      <p><strong>Address:</strong> {booking.patients.address}</p>
                      <p><strong>BPJS:</strong> {booking.patients.bpjs ? 'Yes' : 'No'}</p>
                      <p><strong>Appointment Date:</strong> {booking.book_date}</p>
                      <p><strong>Appointment Time:</strong> {booking.book_time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="flex flex-col space-y-8 items-center w-full max-w-2xl">
              {/* ICD Search */}
              <div className="w-full">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    console.log('ICD Search query changed:', e.target.value);
                    setQuery(e.target.value);
                  }}
                  placeholder="Enter symptoms or diagnosis..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => {
                    console.log('ICD Search button clicked with query:', query);
                    handleIcd10Search();
                  }}
                  className="mt-2 bg-[#ee0035] text-white px-4 py-2 rounded hover:bg-[#c8002b] transition w-full"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Get ICD-10 Suggestions'}
                </button>

                {error && <p className="text-red-500">{error}</p>}

                {selectedIcds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Selected ICD-10 Codes:</h4>
                    <ul className="space-y-1">
                      {selectedIcds.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span>
                            <strong>{item.kode_icd}</strong> - {item.nama_penyakit}
                          </span>
                          <button
                            onClick={() => {
                              console.log('Removing selected ICD:', item.kode_icd);
                              setSelectedIcds(selectedIcds.filter(icd => icd.kode_icd !== item.kode_icd));
                            }}
                            className="text-gray-950 hover:text-red-700 text-sm ml-2"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">ICD Suggestions:</h3>
                    {results.map((item, idx) => {
                      const isSelected = selectedIcds.some(icd => icd.kode_icd === item.kode_icd);
                      return (
                        <div
                          key={idx}
                          className={`p-3 border rounded shadow cursor-pointer ${
                            isSelected ? 'bg-blue-100' : 'bg-white'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              console.log('Deselecting ICD suggestion:', item.kode_icd);
                              setSelectedIcds(selectedIcds.filter(icd => icd.kode_icd !== item.kode_icd));
                            } else {
                              console.log('Selecting ICD suggestion:', item.kode_icd);
                              setSelectedIcds([...selectedIcds, item]);
                              setResults(results.filter(result => result.kode_icd !== item.kode_icd));
                            }
                          }}
                        >
                          <p><strong>{item.kode_icd}</strong> - {item.nama_penyakit}</p>
                          <p>Confidence: {item.similarity_percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Medicine Search */}
              <div className="w-full pt-4 border-t">
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => {
                    console.log('Medicine search query changed:', e.target.value);
                    setMedicineQuery(e.target.value);
                  }}
                  placeholder="Enter medicine name or description..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => {
                    console.log('Medicine Search button clicked with query:', medicineQuery);
                    handleMedicineSearch();
                  }}
                  className="mt-2 bg-[#0070f3] text-white px-4 py-2 rounded hover:bg-[#005bb5] transition w-full"
                  disabled={medicineLoading}
                >
                  {medicineLoading ? 'Loading...' : 'Search Medicines'}
                </button>

                {medicineError && <p className="text-red-500">{medicineError}</p>}

                {selectedMedicines.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Selected Medicines:</h4>
                    <ul className="space-y-1">
                      {selectedMedicines.map((med, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between bg-gray-100 p-2 rounded"
                        >
                          <span className="mr-4">
                            <strong>{med.name}</strong> - {med.sub_kelas_terapi || '-'} - {med.harga_obat || '-'}
                          </span>

                          <input
                            type="text"
                            placeholder="Frequency (e.g. 2x/day)"
                            value={med.frequency || ''}
                            onChange={(e) => {
                              const newMeds = [...selectedMedicines];
                              newMeds[idx].frequency = e.target.value;
                              setSelectedMedicines(newMeds);
                            }}
                            className="ml-auto border border-gray-300 rounded px-2 py-1 text-sm w-40"
                          />

                          <button
                            onClick={() => {
                              setSelectedMedicines(selectedMedicines.filter((_, i) => i !== idx));
                            }}
                            className="text-gray-950 hover:text-red-700 text-sm ml-2"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {medicineResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">Medicine Suggestions:</h3>
                    {medicineResults.map((item, idx) => {
                      const isSelected = selectedMedicines.some(med =>
                        med.name === item.name &&
                        med.similarity_percentage === item.similarity_percentage &&
                        med.sub_kelas_terapi === item.sub_kelas_terapi &&
                        med.sediaan === item.sediaan &&
                        med.harga_obat === item.harga_obat
                      );
                      return (
                        <div
                          key={idx}
                          className={`p-3 border rounded shadow cursor-pointer ${
                            isSelected ? 'bg-blue-100' : 'bg-white'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              console.log('Deselecting medicine suggestion:', item.name);
                              setSelectedMedicines(selectedMedicines.filter(med => med.name !== item.name));
                            } else {
                              console.log('Selecting medicine suggestion:', item.name);
                              setSelectedMedicines([...selectedMedicines, item]);
                              setMedicineResults(medicineResults.filter(result => result.name !== item.name));
                            }
                          }}
                        >
                          <p><strong>{item.name}</strong></p>
                          <p>{item.sub_kelas_terapi} - {item.sediaan}</p>
                          <p>Price: {item.harga_obat}</p>
                          <p>Confidence: {item.similarity_percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'final' && ( 
            <div className="w-full max-w-xl mt-10 space-y-4">
              <h2 className="text-xl font-semibold">Finalize Diagnosis</h2>

              <div className="p-4 border bg-white rounded space-y-4 text-sm text-gray-800">
                {selectedBooking && (
                  <div className="space-y-1">
                    <p><strong>Name:</strong> {selectedBooking.patients.full_name}</p>
                    <p><strong>Birthdate:</strong> {selectedBooking.patients.birthdate}</p>
                    <p><strong>Phone:</strong> {selectedBooking.patients.phone_number}</p>
                    <p><strong>Address:</strong> {selectedBooking.patients.address}</p>
                    <p><strong>BPJS:</strong> {selectedBooking.patients.bpjs ? 'Yes' : 'No'}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p><strong>Selected ICDs:</strong></p>
                  <ul className="list-disc list-inside">
                    {selectedIcds.length > 0 ? (
                      selectedIcds.map((item, idx) => (
                        <li key={idx}>
                          {item.kode_icd} - {item.nama_penyakit}
                        </li>
                      ))
                    ) : (
                      <li>None</li>
                    )}
                  </ul>

                  <p><strong>Selected Medicines:</strong></p>
                  <ul className="list-disc list-">
                    {selectedMedicines.length > 0 ? (
                      selectedMedicines.map((med, idx) => (
                        <li key={idx}>
                          {med.name} - {med.sub_kelas_terapi || '-'} - {med.sediaan || '-'} - <em>{med.frequency || 'No frequency specified'}</em>
                        </li>
                      ))
                    ) : (
                      <li>None</li>
                    )}
                  </ul>

                  <textarea
                    placeholder="Doctor's Notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-28 p-2 border rounded resize-none"
                  />

                  <button
                    onClick={handleFinalSubmit}
                    className="w-full bg-[#10b981] text-white py-2 rounded hover:bg-[#0f766e]"
                  >
                    Submit Diagnosis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
