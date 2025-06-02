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

  // Medicine search state
  const [medicineQuery, setMedicineQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState<MedicinePrediction[]>([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState('');

  //verify session
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

  //logout handler
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

  // ICD-10 Search handler
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

  // Medicine Search handler
  const handleMedicineSearch = async () => {
    setMedicineLoading(true);
    setMedicineError('');
    setMedicineResults([]);

    try {
      const res = await fetch('/api/medicinepredict', { // adjust your medicine API endpoint
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
            <span className="text-[#f9f9f9] text-sm font-semibold">physician</span>
          </div>

          <div className="absolute left-[26%] flex space-x-6">
            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'info' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('info')}
            >
              patient info
            </button>

            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'details' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('details')}
            >
              details
            </button>

            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'final' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('final')}
            >
              finalization
            </button>
          </div>

          <div className="absolute right-7 flex space-x-6">
            <span className="text-[#f9f9f9] text-lg font-semibold">
              {username ? `hello, ${username}` : 'loading...'}
            </span>

            <button
              onClick={handleLogout}
              className="p-1 rounded-lg hover:bg-white transition duration-200 group"
            >
              <Image
                src="/logout_final.png"
                alt="Logo"
                width={24}
                height={24}
                className="group-hover:hidden"
              />
              <Image
                src="/logout_colored.png"
                alt="Logo Hover"
                width={24}
                height={24}
                className="hidden group-hover:block"
              />
            </button>
          </div>
        </div>
      </header>

      <main className="p-1 bg-[#f9f9f9] my-1 mx-1 rounded-sm flex-1">
        <div className="h-full flex items-start justify-center text-gray-700 text-xl pt-10">
          {activeTab === 'info' && 'Patient Information Section'}

          {activeTab === 'details' && (
            <div className="flex flex-col space-y-6 items-center w-full max-w-xl">
              {/* ICD-10 Search */}
              <div className="w-full flex flex-col space-y-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter symptoms or diagnosis..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleIcd10Search}
                  className="bg-[#ee0035] text-white px-4 py-2 rounded hover:bg-[#c8002b] transition"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Get ICD-10 Suggestions'}
                </button>
                {error && <p className="text-red-500">{error}</p>}
                {results.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold">Suggestions:</h3>
                    <ul className="space-y-3">
                      {results.map((item, idx) => (
                        <li key={idx} className="p-4 bg-white border rounded shadow">
                          <p><strong>ICD-10:</strong> {item.kode_icd}</p>
                          <p><strong>Disease:</strong> {item.nama_penyakit}</p>
                          <p><strong>Confidence:</strong> {item.similarity_percentage}%</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Medicine Search */}
              <div className="w-full flex flex-col space-y-2 mt-8 border-t pt-6">
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="Enter medicine name or description..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleMedicineSearch}
                  className="bg-[#0070f3] text-white px-4 py-2 rounded hover:bg-[#005bb5] transition"
                  disabled={medicineLoading}
                >
                  {medicineLoading ? 'Loading...' : 'Search Medicines'}
                </button>
                {medicineError && <p className="text-red-500">{medicineError}</p>}
                {medicineResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold">Medicine Suggestions:</h3>
                    <ul className="space-y-3">
                      {medicineResults.map((item, idx) => (
                        <li key={idx} className="p-4 bg-white border rounded shadow">
                          {/* Customize these fields to match your medicine data */}
                          <p><strong>Medicine Name:</strong> {item.name}</p>
                          <p><strong>Similarity:</strong> {item.similarity_percentage}%</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'final' && 'Finalization Section'}
        </div>
      </main>
    </div>
  );
}
