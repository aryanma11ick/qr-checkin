'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Employee = {
  id: number;
  name: string;
};

export default function EmployeeCheckin() {
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Validate Indian phone number
  const validateIndianPhone = (phone: string): { valid: boolean; cleaned: string } => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Indian phone number validation:
    // - Starts with 6,7,8,9 (mobile numbers)
    // - 10 digits total (for numbers without country code)
    // - OR 12 digits total (for numbers with +91 country code)
    const regex = /^(\+91|91)?[6-9]\d{9}$/;
    const valid = regex.test(cleaned);
    
    return { valid, cleaned };
  };

  // Format phone number as user types (Indian format)
  const formatIndianPhone = (input: string): string => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Limit to 10 digits (for Indian numbers without country code)
    const truncated = cleaned.slice(0, 10);
    
    // Format as XXXXX XXXXX or XXX XX XXXXX based on length
    if (truncated.length <= 5) {
      return truncated;
    } else if (truncated.length <= 7) {
      return `${truncated.slice(0, 5)} ${truncated.slice(5)}`;
    } else {
      return `${truncated.slice(0, 5)} ${truncated.slice(5, 7)} ${truncated.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIndianPhone(e.target.value);
    setPhone(formatted);
  };

  const handleCheckin = async () => {
    setIsLoading(true);
    setMessage('');

    // Validate Indian phone number
    const { valid, cleaned } = validateIndianPhone(phone);
    if (!valid) {
      setMessage('Please enter a valid Indian phone number (10 digits starting with 6-9)');
      setIsLoading(false);
      return;
    }

    try {
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('phone', cleaned) // Store and compare the cleaned version (digits only)
        .single<Employee>();

      if (empError || !employee) {
        router.push(`/visitor?phone=${encodeURIComponent(cleaned)}`);
        return;
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      const { error: checkinError } = await supabase
        .from('employee_checkins')
        .insert({
          employee_id: employee.id,
          employee_name: employee.name,
          checkin_date: dateStr,
          checkin_time: timeStr,
        });

      if (checkinError) throw checkinError;

      setMessage(`Welcome ${employee.name}, Check-In Successful`);
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('An error occurred during check-in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Employee Check-In</h1>
      <div className="space-y-2">
        <Input
          type="tel"
          placeholder="98XXX XXXXX"
          value={phone}
          onChange={handlePhoneChange}
          className="text-lg py-6"
          onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
          maxLength={14} // For formatted number with spaces
        />
        <div className="text-sm text-muted-foreground">
          Enter 10-digit Indian mobile number (starts with 6-9)
        </div>
        <Button
          onClick={handleCheckin}
          className="w-full py-6 text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Check In'}
        </Button>
      </div>
      {message && (
        <p className={`mt-3 text-center text-sm ${
          message.includes('error') || message.includes('valid') 
            ? 'text-destructive' 
            : 'text-green-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}