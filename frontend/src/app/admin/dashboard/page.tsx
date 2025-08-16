/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define strict types
type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type RawEmployeeCheckin = {
  id: string;
  employee_id: string;
  checkin_date: string;
  checkin_time: string;
  employee_name: string | null;
};

type FormattedEmployeeCheckin = {
  id: string;
  employee_id: string;
  employee_name: string;
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
  const [checkins, setCheckins] = useState<FormattedEmployeeCheckin[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState({
    employees: true,
    checkins: true,
    visitors: true
  });

  // Fetch all data in parallel
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading({ employees: true, checkins: true, visitors: true });
        
        const [
          { data: empData, error: empErr },
          { data: checkinData, error: checkinErr },
          { data: visitorData, error: visitorErr }
        ] = await Promise.all([
          supabase.from('employees').select('*'),
          supabase.from('employee_checkins')
            .select('id, employee_id, checkin_date, checkin_time, employee_name'),
          supabase.from('visitors').select('*')
        ]);

        if (empErr) throw new Error(`Employee error: ${empErr.message}`);
        if (checkinErr) throw new Error(`Checkin error: ${checkinErr.message}`);
        if (visitorErr) throw new Error(`Visitor error: ${visitorErr.message}`);

        setEmployees(empData as Employee[]);
        setVisitors(visitorData as Visitor[]);

        if (checkinData) {
          const formattedCheckins = checkinData.map((checkin) => ({
            id: checkin.id,
            employee_id: checkin.employee_id,
            employee_name: checkin.employee_name ?? 'Unknown',
            checkin_date: checkin.checkin_date,
            checkin_time: checkin.checkin_time
          }));
          setCheckins(formattedCheckins);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading({ employees: false, checkins: false, visitors: false });
      }
    };

    fetchAllData();
  }, []);

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      
      if (error) throw error;
      
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
  <div className="flex items-center gap-2 my-4">
    <Input
      placeholder="Search employees..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-64"
    />
  </div>
  
  <div className="border rounded-lg overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Phone</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredEmployees.map((emp) => (
          <tr key={emp.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{emp.name}</td>
            <td className="p-3">{emp.phone}</td>
            <td className="p-3">{emp.email}</td>
            <td className="p-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteEmployee(emp.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</TabsContent>

        {/* Checkins Tab */}
        <TabsContent value="checkins">
  <div className="border rounded-lg overflow-hidden mt-4">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Employee</th>
          <th className="p-3 text-left">Date</th>
          <th className="p-3 text-left">Time</th>
        </tr>
      </thead>
      <tbody>
        {checkins.map((c) => (
          <tr key={c.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{c.employee_name}</td>
            <td className="p-3">{formatDate(c.checkin_date)}</td>
            <td className="p-3">{c.checkin_time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</TabsContent>

        {/* Visitors Tab */}
        <TabsContent value="visitors">
  <div className="border rounded-lg overflow-hidden mt-4">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Phone</th>
          <th className="p-3 text-left">Meeting</th>
          <th className="p-3 text-left">Date/Time</th>
        </tr>
      </thead>
      <tbody>
        {visitors.map((v) => (
           <tr key={v.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{v.name}</td>
            <td className="p-3">{v.phone}</td>
            <td className="p-3">{v.whom_to_meet}</td>
            <td className="p-3">{v.purpose}</td>
            <td className="p-3">
              {formatDate(v.checkin_date)} at {v.checkin_time}
            </td>
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