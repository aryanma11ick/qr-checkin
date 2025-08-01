'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type CheckinRaw = {
  id: string;
  employee_id: string;
  checkin_date: string;
  checkin_time: string;
  employees: {
    name: string;
    phone: string;
  };
};

type EmployeeCheckin = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_phone: string;
  checkin_date: string;
  checkin_time: string;
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [checkins, setCheckins] = useState<EmployeeCheckin[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) toast.error('Failed to load employees');
    else setEmployees(data as Employee[]);
  };

  const fetchCheckins = async () => {
    const { data: checkinData, error: checkinErr } = await supabase
      .from('employee_checkins')
      .select(`
        id,
        employee_id,
        checkin_date,
        checkin_time,
        employees (
          name,
          phone
        )
      `);

    if (checkinData && !checkinErr) {
      const formatted: EmployeeCheckin[] = checkinData.map((entry) => ({
        id: entry.id,
        employee_id: entry.employee_id,
        employee_name: entry.employees[0]?.name ?? 'Unknown',
        employee_phone: entry.employees[0]?.phone ?? 'Unknown',
        checkin_date: entry.checkin_date,
        checkin_time: entry.checkin_time,
      }));
      setCheckins(formatted);
    } else {
      toast.error('Failed to fetch check-ins');
    }
  };

  const handleAddEmployee = async () => {
    const { error } = await supabase.from('employees').insert([{ name, phone, email }]);
    if (error) toast.error('Failed to add employee');
    else {
      toast.success('Employee added');
      setName('');
      setPhone('');
      setEmail('');
      fetchEmployees();
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchCheckins();
  }, []);

  return (
    <div className="p-4">
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="add">Add Employee</TabsTrigger>
          <TabsTrigger value="view">Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={handleAddEmployee}>➕ Add Employee</Button>
        </TabsContent>

        <TabsContent value="view">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Check-in Date</th>
                  <th className="px-4 py-2 border">Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((checkin) => (
                  <tr key={checkin.id}>
                    <td className="px-4 py-2 border">{checkin.employee_name}</td>
                    <td className="px-4 py-2 border">{checkin.employee_phone}</td>
                    <td className="px-4 py-2 border">{checkin.checkin_date}</td>
                    <td className="px-4 py-2 border">{checkin.checkin_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
