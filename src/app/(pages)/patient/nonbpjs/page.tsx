'use client';

import { useRouter } from 'next/navigation';

const SPECIALIZATION = [
  { name: 'Cardiologist', icon: '🫀' },
  { name: 'Dentist', icon: '🦷' },
  { name: 'Pediatrician', icon: '👶' },
  { name: 'Neurologist', icon: '🧠'},
  { name: 'General Physician', icon: '🥼'}
];

export default function ChooseSpecializationPage() {
  const router = useRouter();

  const handleClick = (specialization: string) => {
    router.push(`/patient/nonbpjs/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">Choose a Specialization</h1>
      <div className="grid gap-4">
        {SPECIALIZATION.map(({ name, icon }) => (
          <div
            key={name}
            onClick={() => handleClick(name)}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 cursor-pointer hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-lg font-medium">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
