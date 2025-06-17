'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'user' | 'patient' | 'final'>('user');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <header className="relative w-full h-26">
        <Image
          src="/header-doc.jpg"
          alt="Header Background"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 flex items-center px-6 justify-between w-full">
          <div className="flex flex-col space-y-1 items-end mt-1">
            <Image src="/vercel.svg" alt="Logo" width={76} height={38} />
            <span className="text-[#f9f9f9] text-sm font-semibold">admin</span>
          </div>
          <div className="flex space-x-6">
            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'user' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('user')}
            >
              User Info
            </button>
            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'patient' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('patient')}
            >
              Patient Info
            </button>
            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'final' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('final')}
            >
              Finalization
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="p-4 bg-[#f9f9f9] my-1 mx-1 rounded-sm flex-1">
        {activeTab === 'user' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-950">User Menu</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/doctor')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              >
                Doctor
              </button>
              <button
                onClick={() => router.push('/admin/pharma')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
              >
                Pharmacist
              </button>
            </div>
          </div>
        )}

        {activeTab === 'patient' && (
          <div>
            <h2 className="text-xl font-bold text-zinc-950 mb-4">Registered Patients</h2>
            <PatientList />
          </div>
        )}

        {activeTab === 'final' && (
          <div className="text-gray-500 text-xl">Finalization Section</div>
        )}
      </main>
    </div>
  );
}

function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/admin/patient/');
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <p className="text-gray-600">Loading patients...</p>;

  return (
    <ul className="space-y-4">
      {patients.map((p, index) => (
        <li key={index} className="bg-white shadow p-4 rounded border">
          <p className="font-semibold text-gray-900">{p.full_name}</p>
          <p className="text-sm text-gray-700">Phone: {p.phone_number}</p>
          <p className="text-sm text-gray-700">Birthdate: {p.birthdate}</p>
          <p className="text-sm text-gray-700">Address: {p.address}</p>
        </li>
      ))}
    </ul>
  );
}
