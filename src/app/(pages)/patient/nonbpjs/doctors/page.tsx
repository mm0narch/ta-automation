'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Doctor = {
  user_id: string;
  name: string;
  specialization: string;
};

export default function DoctorsPage() {
  const searchParams = useSearchParams();
  const specialization = searchParams.get('specialization');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!specialization) return;

    const fetchDoctors = async () => {
      setLoading(true);
      const res = await fetch(`/api/appointments/nonbpjs/doctors?specialization=${encodeURIComponent(specialization)}`);
      const data = await res.json();
      setDoctors(data);
      setLoading(false);
    };

    fetchDoctors();
  }, [specialization]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Doctors - {specialization}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : doctors.length === 0 ? (
        <p>No doctors found for this specialization.</p>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doc) => (
            <button
              key={doc.user_id}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              onClick={() => {
                // Redirect to calendar & time selection, passing doctor ID
                window.location.href = `/patient/nonbpjs/book?doctor_id=${doc.user_id}`;
              }}
            >
              {doc.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
