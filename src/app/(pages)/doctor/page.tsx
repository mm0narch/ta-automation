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

      <main className="p-4 bg-[#f9f9f9] my-1 mx-1 rounded-xs flex-1">
        <div className="h-full flex flex-col items-center justify-start text-gray-700 text-lg">
          {activeTab === 'info' && (
            <div className="w-full px-4 mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-wide">scheduled patients</h2>
            
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
                      className={`w-full flex justify-between flex-wrap md:flex-nowrap p-4 rounded-md border border-gray-300 bg-gray-100 cursor-pointer transition duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-md hover:bg-indigo-100 ${
                        selectedBookingId === booking.id ? 'border-red-500 bg-red-100' : ''
                      }`}
                    >
                      <div className="w-full text-base md:w-1/2 space-y-1">
                        <p><span className="font-semibold">name:</span> {booking.patients.full_name}</p>
                        <p><span className="font-semibold">birthdate:</span> {booking.patients.birthdate}</p>
                        <p><span className="font-semibold">phone:</span> {booking.patients.phone_number}</p>
                      </div>

                      <div className="w-full md:w-1/2 text-base space-y-1 md:pl-6 mt-4 md:mt-0">
                        <p><span className="font-semibold">BPJS:</span> {booking.patients.bpjs ? 'Yes' : 'No'}</p>
                        <p><span className="font-semibold">appointment date:</span> {booking.book_date}</p>
                        <p><span className="font-semibold">appointment time:</span> {booking.book_time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="flex flex-col space-y-8 items-center w-full max-w-4xl px-4">
              {/* ICD Search */}
              <div className="w-full mt-4">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 lowercase tracking-wide">search engine</h4>
                
                <div className="flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-4 items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter diagnosis"
                    className="flex-1 p-2 border border-gray-300 rounded-md w-full"
                  />
                  <button
                    onClick={handleIcd10Search}
                    className="bg-gradient-to-r from-[#040035] to-[#F50137] font-semibold text-white px-6 py-2 rounded transition hover:brightness-110 w-full min-w-[240px] md:w-auto"
                    disabled={loading}
                  >
                    {loading ? 'loading...' : 'search ICD-10'}
                  </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                {selectedIcds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 tracking-wide">selected ICD-10 codes:</h4>
                    <ul className="space-y-1">
                      {selectedIcds.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md shadow-sm text-md">
                          <span>
                            <strong>{item.kode_icd}</strong> - <strong>{item.nama_penyakit}</strong>
                          </span>
                          <button
                            onClick={() => {
                              console.log('Removing selected ICD:', item.kode_icd);
                              setSelectedIcds(selectedIcds.filter(icd => icd.kode_icd !== item.kode_icd));
                            }}
                            className="text-gray-950 hover:text-red-700 text-sm ml-2"
                          >
                            <strong>&times;</strong>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 tracking-wide">ICD suggestions:</h3>
                    {results.map((item, idx) => {
                      const isSelected = selectedIcds.some(icd => icd.kode_icd === item.kode_icd);
                      return (
                        <div
                          key={idx}
                          className={`p-4 border border-gray-300 rounded-md shadow-sm cursor-pointer transition ${
                            isSelected ? 'bg-blue-100' : 'hover:bg-gray-100 bg-white'
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
                          <p className="font-semibold">{item.kode_icd} - {item.nama_penyakit}</p>
                          <p className="text-sm text-gray-700">Confidence: {item.similarity_percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Medicine Search */}
              <div className="w-full pt-8 border-t">
                
                <div className="flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-4 items-center">
                  <input
                    type="text"
                    value={medicineQuery}
                    onChange={(e) => {
                      console.log('Medicine search query changed:', e.target.value);
                      setMedicineQuery(e.target.value);
                    }}
                    placeholder="Enter medicine name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => {
                      console.log('Medicine Search button clicked with query:', medicineQuery);
                      handleMedicineSearch();
                    }}
                    className="bg-gradient-to-r from-[#040035] to-[#F50137] font-semibold text-white px-6 py-2 rounded transition hover:brightness-110 w-full min-w-[240px] md:w-auto"
                    disabled={medicineLoading}
                  >
                    {medicineLoading ? 'loading...' : 'search medicine'}
                  </button>
                </div>

                {medicineError && <p className="text-red-500">{medicineError}</p>}

                {selectedMedicines.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 tracking-wide">selected medicines:</h4>
                    <ul className="space-y-1">
                      {selectedMedicines.map((med, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md shadow-sm text-md"
                        >
                          <span className="mr-4">
                            <strong>{med.name}</strong> - <strong>{med.sub_kelas_terapi || '-'}</strong> - <strong>{med.sediaan || '-'}</strong> - <strong>{med.harga_obat || '-'}</strong>
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
                            <strong>&times;</strong>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {medicineResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 lowercase tracking-wide">Medicine Suggestions:</h3>
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
                          className={`p-4 border border-gray-300 rounded-md shadow-sm cursor-pointer transition ${
                            isSelected ? 'bg-blue-100' : 'hover:bg-gray-100 bg-white'
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
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-700">{item.sub_kelas_terapi} - {item.sediaan}</p>
                          <p className="text-sm text-gray-700">Price: {item.harga_obat}</p>
                          <p className="text-sm text-gray-700">Confidence: {item.similarity_percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'final' && (
            <div className="w-full max-w-5xl mt-4 px-4 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 lowercase tracking-wide">finalize diagnosis</h2>

              <div className="border border-gray-300 rounded-md bg-white p-6 text-sm text-gray-800 space-y-4">
                {selectedBooking && (
                  <div className="space-y-1 text-base">
                    <p><strong>name:</strong> {selectedBooking.patients.full_name}</p>
                    <p><strong>birthdate:</strong> {selectedBooking.patients.birthdate}</p>
                    <p><strong>phone:</strong> {selectedBooking.patients.phone_number}</p>
                  </div>
                )}

                <div className="space-y-2 text-base">
                  <div>
                    <p className="font-semibold">selected ICD codes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedIcds.length > 0 ? (
                        selectedIcds.map((item, idx) => (
                          <li key={idx}>{item.kode_icd} - {item.nama_penyakit}</li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold">selected medicines:</p>
                    <ul className="list-disc list-inside space-y-1">
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
                  </div>

                  <textarea
                    placeholder="Doctor’s notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none text-sm"
                  />

                  <button
                    onClick={handleFinalSubmit}
                    className="w-full text-white py-2 font-semibold rounded bg-gradient-to-r from-[#040035] to-[#F50137] hover:brightness-110 transition"
                  >
                    submit
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
