'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Patient = {
  id: string;
  full_name: string;
  birthdate: string;
  phone_number: string;
  address: string;
  created_at: string;
};

export default function AdminPatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await fetch('/api/admin/patient/list');
      const data = await res.json();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
          <h1 className="text-2xl font-bold text-white ml-4">Patient List</h1>
        </div>
      </header>

      {/* Patient List */}
      <main className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Registered Patients</h2>
        <ul className="space-y-3">
          {patients.map((p, index) => (
            <li key={index} className="border p-4 rounded shadow-sm bg-white">
              <p className="font-semibold text-gray-900">{p.full_name}</p>
              <p className="text-sm text-gray-600">Phone: {p.phone_number}</p>
              <p className="text-sm text-gray-600">Birthdate: {p.birthdate}</p>
              <p className="text-sm text-gray-600">Address: {p.address}</p>
              <p className="text-sm text-gray-400">
                Registered: {new Date(p.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
