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

type Checkin = {
  id: string;
  employee_id: string;
  checkin_date: string;
  checkin_time: string;
  employee_name: string;
  employee_phone: string;
};

export default function Page() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [visitorName, setVisitorName] = useState('');

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) {
        toast.error('Error fetching employees');
      } else {
        setEmployees(data);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch check-ins with employee info
  useEffect(() => {
    const fetchCheckins = async () => {
      const { data, error } = await supabase
        .from('employee_checkins')
        .select('*, employees(name, phone)')
        .order('checkin_date', { ascending: false });

      if (error) {
        toast.error('Error fetching check-ins');
      } else {
        const formatted = data.map((entry) => ({
          id: entry.id,
          employee_id: entry.employee_id,
          checkin_date: entry.checkin_date,
          checkin_time: entry.checkin_time,
          employee_name: entry.employees?.[0]?.name ?? 'Unknown',
          employee_phone: entry.employees?.[0]?.phone ?? 'Unknown',
        }));
        setCheckins(formatted);
      }
    };
    fetchCheckins();
  }, []);

  const handleCheckin = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    const today = new Date();
    const checkinDate = today.toISOString().split('T')[0];
    const checkinTime = today.toTimeString().split(' ')[0];

    const { error } = await supabase.from('employee_checkins').insert({
      employee_id: selectedEmployee,
      checkin_date: checkinDate,
      checkin_time: checkinTime,
    });

    if (error) {
      toast.error('Check-in failed');
    } else {
      toast.success('Check-in successful');
      setSelectedEmployee('');
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="checkin">
        <TabsList className="mb-6">
          <TabsTrigger value="checkin">Employee Check-in</TabsTrigger>
          <TabsTrigger value="list">Employee List</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Select Employee (Phone)</label>
            <select
              className="w-full border p-2 rounded-md"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">-- Select --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.phone})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleCheckin}>Check In</Button>

          <h2 className="text-lg font-bold mt-8 mb-2">Check-in Records</h2>
          <table className="w-full border mt-2">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((entry) => (
                <tr key={entry.id}>
                  <td className="border p-2">{entry.employee_name}</td>
                  <td className="border p-2">{entry.employee_phone}</td>
                  <td className="border p-2">{entry.checkin_date}</td>
                  <td className="border p-2">{entry.checkin_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="list">
          <h2 className="text-lg font-bold mb-2">All Employees</h2>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="border p-2">{emp.name}</td>
                  <td className="border p-2">{emp.phone}</td>
                  <td className="border p-2">{emp.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="visitors">
          <h2 className="text-lg font-bold mb-4">Visitors</h2>
          <Input
            placeholder="Visitor Name"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="mb-2"
          />
          <Button disabled>Submit (coming soon)</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
