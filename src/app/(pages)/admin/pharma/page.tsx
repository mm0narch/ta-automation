'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Pharmacist = {
  id: string;
  name: string;
  created_at: string;
};

export default function PharmacistListPage() {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);

  useEffect(() => {
    const fetchPharmacists = async () => {
      const res = await fetch('/api/admin/pharma/list');
      const data = await res.json();
      setPharmacists(data);
    };
    fetchPharmacists();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Custom Header */}
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

          <h1 className="text-2xl font-bold text-white ml-4">Pharmacist Menu</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Registered Pharmacists</h1>
        <ul className="space-y-3">
          {pharmacists.map((p, index) => (
            <li key={p.id || index} className="border p-4 rounded shadow-sm bg-white">
              <p className="font-semibold text-gray-800">{p.name}</p>
              <p className="text-sm text-gray-400">
                Joined: {new Date(p.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
