"use client";

import type React from "react";

import { useState } from "react";
import { login } from "../../lib/auth";
import { saveAuthState } from "../../lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PatientLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function PatientLogin({ onLoginSuccess }: PatientLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState("+254712345678");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login({ phoneNumber, password }, "patient");
    setLoading(false);

    if (result.success && result.user && result.token) {
      saveAuthState(result.token, result.user);
      onLoginSuccess(result.user, result.token);
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-accent mb-2">Patient Login</h2>
          <p className="text-text-secondary">
            View your bookings and appointments
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-base"
              placeholder="+254712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-error bg-opacity-10 border border-error text-error p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-light text-white disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
