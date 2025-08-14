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

type EmployeeCheckinRaw = {
  id: string;
  employee_id: string;
  checkin_date: string;
  checkin_time: string;
  employees: {
    name: string;
    phone: string;
  };
}[];

type EmployeeCheckin = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_phone: string;
  checkin_date: string;
  checkin_time: string;
};

type Visitor = {
  id: string;
  name: string;
  phone: string;
  whom_to_meet: string;
  purpose: string;
  checkin_date: string;
  checkin_time: string;
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [checkins, setCheckins] = useState<EmployeeCheckin[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: empData, error: empErr } = await supabase.from('employees').select('*');
      if (!empErr) setEmployees(empData as Employee[]);

      const { data: checkinData, error: checkinErr } = await supabase
        .from('employee_checkins')
        .select('id, employee_id, checkin_date, checkin_time, employees(name, phone)');

      if (!checkinErr && checkinData) {
        const formatted: EmployeeCheckin[] = (checkinData as EmployeeCheckinRaw[]).map((entry) => ({
          id: entry.id,
          employee_id: entry.employee_id,
          employee_name: entry.employees?.name ?? 'Unknown',
          employee_phone: entry.employees?.phone ?? 'Unknown',
          checkin_date: entry.checkin_date,
          checkin_time: entry.checkin_time,
        }));
        setCheckins(formatted);
      }

      const { data: visitorData, error: visitorErr } = await supabase.from('visitors').select('*');
      if (!visitorErr) setVisitors(visitorData as Visitor[]);
    };

    fetchData();
  }, []);

  const handleDeleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
      toast.success('Employee deleted successfully');
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } else {
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <div className="flex items-center gap-2 mt-4 mb-2">
            <Input
              placeholder="Search employee by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="space-y-2">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="border p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.phone}</p>
                  <p className="text-sm text-gray-500">{emp.email}</p>
                </div>
                <Button variant="destructive" onClick={() => handleDeleteEmployee(emp.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Checkins Tab */}
        <TabsContent value="checkins">
          <div className="space-y-2 mt-4">
            {checkins.map((c) => (
              <div key={c.id} className="border p-4 rounded-lg">
                <p className="font-medium">{c.employee_name}</p>
                <p className="text-sm text-gray-500">{c.employee_phone}</p>
                <p className="text-sm">
                  {c.checkin_date} at {c.checkin_time}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Visitors Tab */}
        <TabsContent value="visitors">
          <div className="space-y-2 mt-4">
            {visitors.map((v) => (
              <div key={v.id} className="border p-4 rounded-lg">
                <p className="font-medium">{v.name}</p>
                <p className="text-sm text-gray-500">{v.phone}</p>
                <p className="text-sm">
                  {v.checkin_date} at {v.checkin_time}
                </p>
                <p className="text-sm text-gray-600">Whom to Meet: {v.whom_to_meet}</p>
                <p className="text-sm text-gray-600">Purpose: {v.purpose}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
