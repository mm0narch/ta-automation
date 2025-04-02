'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-900 p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome</h1>
      <p className="text-lg mb-6">This is a simple Tailwind CSS project.</p>
      <button
        onClick={navigateToDashboard}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
