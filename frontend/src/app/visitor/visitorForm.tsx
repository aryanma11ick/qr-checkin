'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function VisitorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whom_to_meet: '',
    purpose: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Auto-fill phone if coming from employee check-in
  useEffect(() => {
    const phoneParam = searchParams?.get('phone');
    if (phoneParam) {
      setFormData(prev => ({ ...prev, phone: phoneParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    // Basic validation
    if (!formData.name || !formData.phone) {
      setMessage({ text: 'Name and phone number are required', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      const { error } = await supabase.from('visitors').insert([{
        ...formData,
        checkin_date: dateStr,
        checkin_time: timeStr,
        phone: formData.phone.replace(/\D/g, ''), // Store cleaned phone number
      }]);

      if (error) throw error;

      setMessage({ text: 'Check-in successful! Redirecting...', type: 'success' });
      setFormData({ name: '', phone: '', whom_to_meet: '', purpose: '' });
      
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage({ text: 'Check-in failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Visitor Check-In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whom_to_meet">Person to Meet</Label>
              <Input
                id="whom_to_meet"
                name="whom_to_meet"
                placeholder="Manager Name"
                value={formData.whom_to_meet}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Input
                id="purpose"
                name="purpose"
                placeholder="Meeting, Delivery, etc."
                value={formData.purpose}
                onChange={handleChange}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              aria-disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Submit Check-In'}
            </Button>

            {message.text && (
              <p className={`text-center text-sm mt-2 ${
                message.type === 'error' ? 'text-destructive' : 'text-green-600'
              }`}>
                {message.text}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}