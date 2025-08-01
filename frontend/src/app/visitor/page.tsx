import { Suspense } from 'react';
import VisitorForm from './visitorForm';

export default function VisitorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading visitor form...</div>}>
      <VisitorForm />
    </Suspense>
  );
}