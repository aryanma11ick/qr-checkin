'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const [tab, setTab] = useState('checkins');

  const [checkins, setCheckins] = useState<
  { employee_id: string; checkin_date: string; checkin_time: string; employee_name: string }[]
  >([]);

  const [visitors, setVisitors] = useState<
  { name: string; phone: string; whom_to_meet: string; purpose: string; checkin_date: string; checkin_time: string }[]
  >([]);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Load data
  useEffect(() => {
    fetchCheckins();
    fetchVisitors();
  }, []);

  const fetchCheckins = async () => {
    const { data, error } = await supabase
      .from('employee_checkins')
      .select('employee_id, checkin_date, checkin_time, employee_name');

    if (!error) setCheckins(data);
  };

  const fetchVisitors = async () => {
    const { data, error } = await supabase.from('visitors').select('*');
    if (!error) setVisitors(data);
  };

  const handleAddEmployee = async () => {
    const { name, phone, email } = employeeForm;
    const { error } = await supabase.from('employees').insert([{ name, phone, email }]);
    if (!error) {
      alert('Employee added!');
      setEmployeeForm({ name: '', phone: '', email: '' });
    } else {
      alert('Failed to add employee');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <Tabs defaultValue={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="checkins">Employee Check-ins</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="add">Add Employee</TabsTrigger>
        </TabsList>

        {/* Check-ins Tab */}
        <TabsContent value="checkins">
          <h2 className="text-xl mb-2">Employee Check-ins</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
              <th className="p-2 border">Employee ID</th>
                <th className="p-2 border">Employee Name</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{c.employee_id}</td>
                  <td className="p-2 border">{c.employee_name}</td>
                  <td className="p-2 border">{c.checkin_date}</td>
                  <td className="p-2 border">{c.checkin_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        {/* Visitors Tab */}
        <TabsContent value="visitors">
          <h2 className="text-xl mb-2">Visitors</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Whom to Meet</th>
                <th className="p-2 border">Purpose</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{v.name}</td>
                  <td className="p-2 border">{v.phone}</td>
                  <td className="p-2 border">{v.whom_to_meet}</td>
                  <td className="p-2 border">{v.purpose}</td>
                  <td className="p-2 border">{v.checkin_date}</td>
                  <td className="p-2 border">{v.checkin_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        {/* Add Employee Tab */}
        <TabsContent value="add">
          <h2 className="text-xl mb-2">Add New Employee</h2>
          <div className="space-y-4 max-w-md">
            <Input
              placeholder="Name"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={employeeForm.phone}
              onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
            />
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
