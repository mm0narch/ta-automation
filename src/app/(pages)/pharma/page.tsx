'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'final'>('info');

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <header className="relative w-full h-26">
        <Image
          src="/header-doc.jpg"
          alt="Header Background"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 flex items-center px-6">

          <div className="flex flex-col space-y-1 items-end mt-1">
            <Image src="/vercel.svg" alt="Logo" width={76} height={38} />
            <span className="text-[#f9f9f9] text-sm font-semibold">pharmacist</span>
          </div>

          <div className="absolute left-[26%] flex space-x-6">
            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'info' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('info')}
            >
              patient info
            </button>

            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'details' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('details')}
            >
              details
            </button>

            <button
              className={`text-lg font-semibold hover:underline ${
                activeTab === 'final' ? 'text-[#ee0035]' : 'text-[#f9f9f9]'
              }`}
              onClick={() => setActiveTab('final')}
            >
              finalization
            </button>
          </div>
        </div>
      </header>

      <main className="p-1 bg-[#f9f9f9] my-1 mx-1 rounded-sm flex-1">

        <div className="h-[500px] flex items-center justify-center text-gray-500 text-xl">
          {activeTab === 'info' && 'Patient Information Section'}
          {activeTab === 'details' && 'Details Section'}
          {activeTab === 'final' && 'Finalization Section'}
        </div>
      </main>
    </div>
  );
}
