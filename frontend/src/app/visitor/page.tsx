'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function VisitorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whom_to_meet: '',
    purpose: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setMessage('');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const { error } = await supabase.from('visitors').insert([
      {
        ...formData,
        checkin_date: dateStr,
        checkin_time: timeStr,
      },
    ]);

    if (error) {
      setMessage('Check-in failed. Try again.');
      console.error(error);
    } else {
      setMessage('Visitor check-in successful!');
      setFormData({ name: '', phone: '', whom_to_meet: '', purpose: '' });

      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Visitor Check-In</h1>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        className="border px-3 py-2 w-full mb-3"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="border px-3 py-2 w-full mb-3"
      />
      <input
        type="text"
        name="whom_to_meet"
        placeholder="Whom to Meet"
        value={formData.whom_to_meet}
        onChange={handleChange}
        className="border px-3 py-2 w-full mb-3"
      />
      <input
        type="text"
        name="purpose"
        placeholder="Purpose"
        value={formData.purpose}
        onChange={handleChange}
        className="border px-3 py-2 w-full mb-3"
      />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
