'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreatePharmacist() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/admin/pharma/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name }),
    });

    if (res.ok) {
      alert('Pharmacist added successfully!');
      router.push('/admin/pharma');
    } else {
      const data = await res.json();
      alert(`Failed to add: ${data.message}`);
    }
  };

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
          <h1 className="text-2xl font-bold text-white ml-4">Pharmacist Registration</h1>
        </div>
      </header>

      {/* Form */}
      <main className="p-6 max-w-md mx-auto w-full flex-1">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Register New Pharmacist</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded shadow border"
        >
          <input
            type="text"
            placeholder="Username (linked to existing user)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Register
          </button>
        </form>
      </main>
    </div>
  );
}
