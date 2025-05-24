'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (!phoneNumber || !password) {
        console.error('Phone number and password are required');
        return;
      }

      const res = await fetch('/api/patientlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, password })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        console.error('Login failed', result.error);
        return;
      }

      router.push('/patient');
    } catch (err) {
      console.error('Unexpected error during login:', err);
    }
  };

  const goToRegister = () => {
    router.push('/patient/newaccount');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="bg-[#f9f9f9] p-8 rounded-sm shadow-xl w-88"
      >
        <h1 className="mt-5 text-2xl font-bold mb-7 text-center text-neutral-950">
          Patient Login
        </h1>

        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">Phone Number</label>
          <input
            type="text"
            placeholder="Enter your phone number"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none placeholder-gray-200 focus:border-purple-700 focus:placeholder-transparent focus:text-neutral-900"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none placeholder-gray-200 focus:border-purple-700 focus:placeholder-transparent focus:text-neutral-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="mt-12 mb-10 w-full p-2 text-white rounded-xl bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: "url('/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-all duration-300" />
          <span className="relative z-10">LOGIN</span>
        </button>

        <div className="flex flex-col items-end">
          <button
            type="button"
            onClick={goToRegister}
            className="mb-2 text-sm hover:underline transition font-semibold text-[#ee0035]"
          >
            Create New Patient
          </button>
        </div>
      </form>
    </div>
  );
}
