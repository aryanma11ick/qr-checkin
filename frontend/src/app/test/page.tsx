'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/types/employee';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from<Employee>('employees')
        .select('*');

      if (error) {
        console.error('Error fetching employees:', error.message);
        setError(error.message);
      } else {
        setEmployees(data);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>All Employees</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!employees && <p>Loading...</p>}
      {employees && employees.length === 0 && <p>No employees found.</p>}
      {employees && employees.length > 0 && (
        <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name || '—'}</td>
                <td>{emp.phone}</td>
                <td>{emp.email}</td>
                <td>{new Date(emp.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
