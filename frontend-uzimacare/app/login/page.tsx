import { SignInForm } from "@/components/auth/SignInForm"; // adjust path if needed
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to UzimaCare
          </h2>
          <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
        </div>

        <SignInForm />

        <div className="text-center text-sm text-gray-500">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
