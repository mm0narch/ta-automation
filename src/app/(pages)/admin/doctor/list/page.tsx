'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Doctor = {
  user_id: string;
  name: string;
  specialization: string;
  bpjs: boolean;
};

type Availability = {
  weekday: string;
  start_time: string;
  end_time: string;
};

export default function DoctorListPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Record<string, Availability[]>>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch('/api/admin/doctor/list');
      const data = await res.json();
      setDoctors(data);
    };
    fetchDoctors();
  }, []);

  const fetchSchedule = async (doctorId: string) => {
    if (expandedDoctorId === doctorId) {
      setExpandedDoctorId(null);
      return;
    }

    if (schedules[doctorId]) {
      setExpandedDoctorId(doctorId);
      return;
    }

    const res = await fetch(`/api/admin/doctor/availability?doctor_id=${doctorId}`);
    const data = await res.json();
    setSchedules((prev) => ({ ...prev, [doctorId]: data }));
    setExpandedDoctorId(doctorId);
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-white ml-4">Doctor List</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Top Controls */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Scheduled Patients</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/admin/doctor/create')}
              className="bg-gradient-to-r from-pink-600 to-indigo-900 text-white p-2 rounded"
            >
              <Image src="/add.png" alt="Add" width={24} height={24} />
            </button>

            <div className="flex items-center bg-gray-200 px-2 py-1 rounded">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-40"
              />
            </div>
          </div>
        </div>

        {/* Doctor List */}
        {filteredDoctors.map((doc) => (
          <div
            key={doc.user_id}
            className="relative bg-white border border-gray-300 p-4 rounded hover:shadow-md transition"
            onMouseEnter={() => setHoveredId(doc.user_id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-gray-900 font-semibold">
                  ID: <span className="font-normal">{doc.user_id}</span>
                </p>
                <p className="text-gray-900 font-semibold">
                  Name: <span className="font-normal">{doc.name}</span>
                </p>
                <p className="text-gray-900 font-semibold">
                  Specialization: <span className="font-normal">{doc.specialization}</span>
                </p>
                <p className="text-gray-900 font-semibold">
                  BPJS: <span className="font-normal">{doc.bpjs ? 'Yes' : 'No'}</span>
                </p>
              </div>

              {hoveredId === doc.user_id && (
                <button
                  onClick={() => fetchSchedule(doc.user_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                >
                  {expandedDoctorId === doc.user_id ? 'Hide Schedule' : 'View Schedule'}
                </button>
              )}
            </div>

            {/* Schedule Dropdown */}
            {expandedDoctorId === doc.user_id && (
              <div className="mt-4 border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">Doctor Availability:</h3>
                  <button
                    onClick={() => router.push(`/admin/doctor/schedule?doctor_id=${doc.user_id}`)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ✏️ Edit Schedule
                  </button>
                </div>
                {schedules[doc.user_id]?.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {schedules[doc.user_id].map((item, index) => (
                      <li key={index}>
                        <span className="capitalize font-medium">{item.weekday}</span>: {item.start_time} - {item.end_time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No schedule available.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <p className="text-gray-600 text-center py-10">No doctors found.</p>
        )}
      </main>
    </div>
  );
}
