'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'final'>('info');
  const [username, setUsername] = useState('')
  
  //verify session
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUsername(data.user?.username || '');
      }
    };

    fetchUser();
  }, []);

  //logout handler
  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
    });
  
    if (res.ok) {
      window.location.href = '/dashboard';
    } else {
      console.error('Logout failed');
    }
  };

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
            <span className="text-[#f9f9f9] text-sm font-semibold">physician</span>
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
          
          <div className="absolute right-7 flex space-x-6">
            <span className="text-[#f9f9f9] text-lg font-semibold"> 
              {username ? `hello, ${username}` : 'loading...'}
            </span>

            <button 
              onClick = { handleLogout }
              className = 'p-1 rounded-lg hover:bg-white transition duration-200 group'>
              <Image 
                src="/logout_final.png" 
                alt="Logo" 
                width={24} 
                height={24} 
                className = 'group-hover:hidden'
              />
              <Image
                src="/logout_colored.png"
                alt="Logo Hover"
                width={24}
                height={24}
                className="hidden group-hover:block"
              />
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
