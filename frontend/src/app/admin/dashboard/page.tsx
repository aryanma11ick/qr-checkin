'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Ensure this uses `createClient` inside
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
};

type Visitor = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  checkin_time: string;
};

type CheckinRaw = {
  employee_id: string;
  checkin_date: string;
  checkin_time: string;
  employees: {
    name: string;
    phone: string;
  }[] | null;  // Change this to an array
};

type EmployeeCheckin = {
  employee_id: string;
  employee_name: string;
  employee_phone: string;
  checkin_date: string;
  checkin_time: string;
};

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [checkins, setCheckins] = useState<EmployeeCheckin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: visitorData, error: visitorErr } = await supabase.from('visitors').select('*');
      if (visitorData && !visitorErr) setVisitors(visitorData);

      const { data: checkinData, error: checkinErr } = await supabase
        .from('employee_checkins')
        .select('employee_id, checkin_date, checkin_time, employees(name, phone)');

      if (checkinData && !checkinErr) {
        const formatted: EmployeeCheckin[] = checkinData.map((entry) => ({
        employee_id: entry.employee_id,
        employee_name: entry.employees?.[0]?.name ?? 'Unknown',  // Access first element of array
        employee_phone: entry.employees?.[0]?.phone ?? 'N/A',    // Access first element of array
        checkin_date: entry.checkin_date,
        checkin_time: entry.checkin_time,
      }));
  setCheckins(formatted);
}

      const { data: employeeData, error: employeeErr } = await supabase.from('employees').select('*');
      if (employeeData && !employeeErr) setEmployees(employeeData);
    };

    fetchData();
  }, []);

  const handleAddEmployee = async () => {
    if (!name || !phone || !email) {
      toast.error('Please fill all fields');
      return;
    }

    const { error } = await supabase.from('employees').insert([{ name, phone, email }]);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Employee added successfully');
      setName('');
      setPhone('');
      setEmail('');
      const { data: updated } = await supabase.from('employees').select('*');
      if (updated) setEmployees(updated);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="visitors">
        <TabsList className="mb-4">
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="checkins">Employee Check-ins</TabsTrigger>
          <TabsTrigger value="employees">Add Employees</TabsTrigger>
        </TabsList>

        {/* Visitors Tab */}
        <TabsContent value="visitors">
          <h2 className="text-xl font-semibold mb-2">Visitor List</h2>
          <ul className="space-y-2">
            {visitors.map((visitor) => (
              <li key={visitor.id} className="border rounded p-2">
                <strong>{visitor.name}</strong> ({visitor.phone}) – Purpose: {visitor.purpose} – Checked in at: {visitor.checkin_time}
              </li>
            ))}
          </ul>
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="checkins">
          <h2 className="text-xl font-semibold mb-2">Employee Check-ins</h2>
          <ul className="space-y-2">
            {checkins.map((checkin, idx) => (
              <li key={idx} className="border rounded p-2">
                <strong>{checkin.employee_name}</strong> (ID: {checkin.employee_id}) – {checkin.employee_phone} – {checkin.checkin_date} at {checkin.checkin_time}
              </li>
            ))}
          </ul>
        </TabsContent>

        {/* Add Employee Tab */}
        <TabsContent value="employees">
          <h2 className="text-xl font-semibold mb-4">Add Employee</h2>
          <div className="space-y-4 max-w-sm">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
              Add Employee
            </Button>
          </div>

          <h3 className="text-lg font-semibold mt-6">Current Employees</h3>
          <ul className="space-y-2 mt-2">
            {employees.map((emp) => (
              <li key={emp.id} className="border rounded p-2">
                {emp.name} – {emp.phone} – {emp.email}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </main>
  );
}
