'use client';

import Image from 'next/image';

export default function DocumentPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="relative w-full h-26">
        <Image
          src="/header-doc.jpg"
          alt="Header Background"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 flex items-center px-6">
          {/* Logo */}
          <Image src="/vercel.svg" alt="Logo" width={80} height={40} />

          <div className="absolute left-[26%] flex space-x-6">
            <button className="text-white text-lg font-semibold hover:underline">patient info</button>
            <button className="text-white text-lg font-semibold hover:underline">details</button>
            <button className="text-white text-lg font-semibold hover:underline">finalization</button>
          </div>
        </div>
      </header>

      <main className="p-1 bg-white shadow-md mx-1 mt-1 rounded-sm">
        {/* Placeholder */}
        <div className="h-[500px] flex items-center justify-center text-gray-500">
          blank
        </div>
      </main>
    </div>
  );
}
