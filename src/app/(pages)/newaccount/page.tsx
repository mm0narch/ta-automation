'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Authentication logic here
    router.push('/dashboard');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{backgroundImage: "url('/background.jpg')"}}>
      <div className="bg-[#f9f9f9] p-8 rounded-sm shadow-xl w-88">
        <h1 className="mt-5 text-2xl font-bold mb-7 text-center text-neutral-950">New User</h1>
        <div className="mb-2">
          <label className="text-sm font-medium text-black text-neutral-900">username</label>
          <input
            type="text"
            placeholder="type your username here"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none placeholder-gray-200 focus:border-purple-700 focus:placeholder-transparent focus:text-neutral-900"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">password</label>
          <input
            type="password"
            placeholder="type your password here"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none focus:border-purple-700 placeholder-gray-200 focus:placeholder-transparent focus:text-neutral-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">role</label>
          <select
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none focus:border-purple-700 placeholder-gray-200 focus:placeholder-transparent focus:text-neutral-900"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">choose your role</option>
            <option value="admin">admin</option>
            <option value="user">doctor</option>
            <option value="user">pharmacist</option>
          </select>
        </div>
        <button
          onClick={handleLogin}
          className="mt-12 mb-10 w-full p-2 text-white rounded-xl bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: "url('/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-all duration-300"></div>
          <span className='relative z-10'>PROCEED</span>
        </button>
      </div>
    </div>
  );
} 