'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

type Patient = {
  id: string;
  full_name: string;
  birthdate: string;
  phone_number: string;
  sex: string;
  queue_number: number;
  created_at: string;
};

export default function DocumentPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'final'>('info');
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if(error) {
        console.error('Error fetching patient data:', error.message)
        return;
      }
      setPatients(data as Patient[]);
    }
    fetchPatients();
  }, []);

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
            <span className="text-[#f9f9f9] text-sm font-semibold">admin</span>
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

      <main className="p-4 bg-[#f9f9f9] my-1 mx-1 rounded-sm flex-1">
        {activeTab === 'info' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-zinc-950">Registered Patients</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr 
                  className="bg-zinc-950"
                  style={{ backgroundImage: "url('/header-doc.jpg')" }}>
                  <th className="p-2 border text-gray-500">Queue</th>
                  <th className="p-2 border text-gray-500">Full Name</th>
                  <th className="p-2 border text-gray-500">Birthdate</th>
                  <th className="p-2 border text-gray-500">Sex</th>
                  <th className="p-2 border text-gray-500">Phone</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-neutral-900 py-4">No patients registered</td></tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 text-gray-400">
                      <td className="p-2 border">{p.queue_number}</td>
                      <td className="p-2 border">{p.full_name}</td>
                      <td className="p-2 border">{p.birthdate}</td>
                      <td className="p-2 border">{p.sex}</td>
                      <td className="p-2 border">{p.phone_number}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'details' && <div className="text-gray-500 text-xl">Details Section</div>}
        {activeTab === 'final' && <div className="text-gray-500 text-xl">Finalization Section</div>}
      </main>
    </div>
  );
}
