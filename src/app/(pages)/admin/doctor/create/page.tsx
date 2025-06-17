'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateDoctorPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bpjs, setBpjs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = { username, name, specialization, bpjs };
    console.log('Submitting doctor data:', payload); // ✅ Debug

    try {
      const res = await fetch('/api/admin/doctor/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Server response:', data); // ✅ Debug

      if (res.ok) {
        alert('Doctor created successfully!');
        router.push('/admin/doctor/list');
      } else {
        alert(`Error: ${data?.message || 'Something went wrong'}`);
      }
    } catch (err) {
      console.error('Error during doctor creation:', err); // ✅ Debug
      alert('An unexpected error occurred.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ✅ Header */}
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
          <h1 className="text-2xl font-bold text-white ml-4">Doctor Signup</h1>
        </div>
      </header>

      {/* ✅ Form */}
      <main className="p-6 flex-1">
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-4 border"
        >
          <h2 className="text-xl font-semibold text-gray-800">Register New Doctor</h2>

          {/* Username field */}
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Existing Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Doctor's Username"
              required
            />
          </div>

          {/* Name field */}
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Specialization field */}
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* BPJS Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={bpjs}
              onChange={(e) => setBpjs(e.target.checked)}
              id="bpjs-toggle"
              className="w-4 h-4"
            />
            <label htmlFor="bpjs-toggle" className="text-gray-700">
              Registered with BPJS
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            {isSubmitting ? 'Submitting...' : 'Create Doctor'}
          </button>
        </form>
      </main>
    </div>
  );
}
