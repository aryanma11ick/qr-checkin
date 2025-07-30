'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Employee = {
  id: number;
  name: string;
};

export default function EmployeeCheckin() {
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleCheckin = async () => {
    setMessage('');

    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('phone', phone)
      .single<Employee>();

    if (empError || !employee) {
      router.push(`/visitor?phone=${encodeURIComponent(phone)}`);
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const { error: checkinError } = await supabase.from('employee_checkins').insert({
      employee_id: employee.id,
      employee_name: employee.name,
      checkin_date: dateStr,
      checkin_time: timeStr,
    });

    if (checkinError) {
      console.error(checkinError);
      setMessage('Check-in failed');
    } else {
      setMessage(`Welcome ${employee.name}, Check-In Successful`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Check-In</h1>
      <input
        type="tel"
        placeholder="Enter Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border px-3 py-2 w-full mb-3"
      />
      <button
        onClick={handleCheckin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Check In
      </button>
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
