// app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Visitor Check-In</h1>

      <div className="flex gap-4">
        <Link href="/checkin">
          <Button>Check-In</Button>
        </Link>

        <Link href="/admin">
          <Button variant="outline">Admin Login</Button>
        </Link>
      </div>
    </main>
  );
}
