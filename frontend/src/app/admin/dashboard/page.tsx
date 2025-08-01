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
  id: string;
  employee_id: string;
  checkin_date: string;
  checkin_time: string;
  employee_name?: string;
  employees: {
    name: string;
    phone: string;
  } | null;
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
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [checkins, setCheckins] = useState<EmployeeCheckin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch visitors
      const { data: visitorData, error: visitorErr } = await supabase.from('visitors').select('*');
      if (visitorData && !visitorErr) setVisitors(visitorData);

      // Fetch employee check-ins
      const { data: checkinData, error: checkinErr } = await supabase
        .from('employee_checkins')
        .select(`
          id,
          employee_id,
          checkin_date,
          checkin_time,
          employee_name,
          employees(name, phone)
        `)
        .order('checkin_date', { ascending: false })
        .order('checkin_time', { ascending: false });

      if (checkinData && !checkinErr) {
        const formatted: EmployeeCheckin[] = checkinData.map((entry) => ({
          id: entry.id,
          employee_id: entry.employee_id,
          employee_name: entry.employees?.name || entry.employee_name || 'Unknown',
          employee_phone: entry.employees?.phone || 'N/A',
          checkin_date: entry.checkin_date,
          checkin_time: entry.checkin_time,
        }));
        setCheckins(formatted);
      }

      // Fetch employees
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

    try {
      const { error } = await supabase.from('employees').insert([{ name, phone, email }]);
      
      if (error) throw error;
      
      toast.success('Employee added successfully');
      setName('');
      setPhone('');
      setEmail('');
      
      // Refresh employee list
      const { data: updated } = await supabase.from('employees').select('*');
      if (updated) setEmployees(updated);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
        
        <Tabs defaultValue="visitors" className="bg-white rounded-lg shadow">
          <TabsList className="w-full border-b">
            <TabsTrigger value="visitors" className="py-4 px-6">Visitors</TabsTrigger>
            <TabsTrigger value="checkins" className="py-4 px-6">Employee Check-ins</TabsTrigger>
            <TabsTrigger value="employees" className="py-4 px-6">Employees</TabsTrigger>
          </TabsList>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Visitor Records</h2>
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitors.length > 0 ? (
                      visitors.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{visitor.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.purpose}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(visitor.checkin_time).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No visitor records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="checkins" className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Employee Check-ins</h2>
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkins.length > 0 ? (
                      checkins.map((checkin, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{checkin.employee_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{checkin.employee_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{checkin.employee_phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{checkin.checkin_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{checkin.checkin_time}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No check-in records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="p-6">
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Employee</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={handleAddEmployee} 
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
                  >
                    Add Employee
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Current Employees</h2>
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.length > 0 ? (
                          employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(emp.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No employees found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}