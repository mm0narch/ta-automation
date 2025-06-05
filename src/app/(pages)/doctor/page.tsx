'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

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
}

export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'final'>('info');
  const [username, setUsername] = useState('');

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

  const handleIcd10Search = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('/api/icd10predict', {
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
      const res = await fetch('/api/medicinepredict', {
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

  const handleFinalSubmit = () => {
    if (!selectedIcds || !selectedMedicines || !notes.trim()) {
      alert('Please fill all fields.');
      return;
    }

    const payload = {
      icd10: selectedIcds,
      medicine: selectedMedicines,
      doctor_notes: notes,
    };

    console.log('Final Submission:', payload);
    // TODO: Hook this to backend `/api/diagnosis/submit`
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
            {['info', 'details', 'final'].map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold hover:underline ${
                  activeTab === tab ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
                }`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab === 'info' ? 'patient info' : tab === 'details' ? 'details' : 'finalization'}
              </button>
            ))}
          </div>

          <div className="absolute right-7 flex space-x-6">
            <span className="text-[#f9f9f9] text-lg font-semibold">
              {username ? `hello, ${username}` : 'loading...'}
            </span>
            <button
              onClick={handleLogout}
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
            <div className="mt-20">Patient Information Section</div>
          )}

          {activeTab === 'details' && (
            <div className="flex flex-col space-y-8 items-center w-full max-w-2xl">
              {/* ICD Search */}
              <div className="w-full">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter symptoms or diagnosis..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleIcd10Search}
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
                            onClick={() =>
                              setSelectedIcds(selectedIcds.filter(icd => icd.kode_icd !== item.kode_icd))
                            }
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
                              setSelectedIcds(selectedIcds.filter(icd => icd.kode_icd !== item.kode_icd));
                            } else {
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
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="Enter medicine name or description..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleMedicineSearch}
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
                        <li key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span>
                            <strong>{med.name}</strong> - {med.sub_kelas_terapi} - {med.harga_obat}
                          </span>
                          <button
                            onClick={() =>
                              setSelectedMedicines(selectedMedicines.filter(med => med.name !== med.name))                              
                            }
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
                            isSelected ? 'bg-green-100' : 'bg-white'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMedicines(selectedMedicines.filter(med => med.name !== item.name));
                            } else {
                              setSelectedMedicines([...selectedMedicines, item]);
                              setMedicineResults(medicineResults.filter(result => result.name !== item.name));
                            }
                          }}
                        >
                          <p><strong>{item.name}</strong></p>
                          <p>Similarity: {item.similarity_percentage}%</p>
                          <p>Subkelas Terapi: {item.sub_kelas_terapi || '-'}</p>
                          <p>Sediaan: {item.sediaan || '-'}</p>
                          <p>Price: {item.harga_obat ?? '-'}</p>
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

              <div className="p-4 border bg-white rounded space-y-2">
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
                <ul className="list-disc list-inside">
                  {selectedMedicines.length > 0 ? (
                    selectedMedicines.map((med, idx) => (
                      <li key={idx}>
                        {med.name} - {med.sub_kelas_terapi || '-'}
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
          )}
        </div>
      </main>
    </div>
  );
}
