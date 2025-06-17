'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DoctorMenuPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
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

          <h1 className="text-2xl font-bold text-white ml-4">Doctor Menu</h1>
        </div>
      </header>

      <main className="p-6 flex-1 bg-[#f9f9f9]">
        <div className="space-y-6 max-w-xl mx-auto mt-10">
          <button
            onClick={() => router.push('/admin/doctor/list')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
          >
            View Doctor List
          </button>

          <button
            onClick={() => router.push('/admin/doctor/availability')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
          >
            View Doctor Schedule
          </button>
        </div>
      </main>
    </div>
  );
}
