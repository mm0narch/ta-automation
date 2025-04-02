'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// export default function InputComponent() {
//   const [isFocused, setIsFocused] = useState(false);
// }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-red-800">
      <div className="bg-white p-8 rounded-md shadow-xl w-88">
        <h1 className="mt-5 text-2xl font-bold mb-7 text-center text-neutral-950">Login</h1>
        <div className="mb-2">
          <label className="text-sm font-medium text-black text-neutral-900">username</label>
          <input
            type="text"
            placeholder="type your username here"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none placeholder-gray-150 focus:border-purple-700 focus:placeholder-transparent focus:text-neutral-900"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">password</label>
          <input
            type="password"
            placeholder="type your password here"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none focus:border-purple-700 placeholder-gray-150 focus:placeholder-transparent focus:text-neutral-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">role</label>
          <select
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none focus:border-purple-700 placeholder-gray-150 focus:placeholder-transparent focus:text-neutral-900"
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
          className="mt-12 mb-10 w-full p-2 text-white rounded-xl bg-gradient-to-r from-purple-800 to-red-600 hover:from-purple-700 hover:to-red-500"
        >
          LOGIN
        </button>
      </div>
    </div>
  );
} 