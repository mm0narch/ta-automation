'use client';

import { useState } from 'react';

export default function MockRegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    birthdate: '',
    phone_number: '',
    address: '',
    sex: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (res.ok) {
        console.log('Submitted data:', formData);
        setSubmitted(true);
      } else {
        console.error('Submission failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-semibold mb-6">Mock Patient Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Birthdate</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Sex</label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled>Select sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      {submitted && (
        <div className="mt-6 text-green-600 font-medium">
          Registration successful (check console for data).
        </div>
      )}
    </div>
  );
}