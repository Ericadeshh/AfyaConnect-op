"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "../../lib/auth";

interface PhysicianLoginProps {
  onLoginSuccess: (userData: any, authToken: string) => void;
}

export default function PhysicianLogin({
  onLoginSuccess,
}: PhysicianLoginProps) {
  const [email, setEmail] = useState("56845");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login({ email, password }, "physician");
      if (response.success && response.user && response.token) {
        onLoginSuccess(response.user, response.token);
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            <span
              className="text-black"
              style={{ WebkitTextStroke: "1px white" }}
            >
              UZ
            </span>
            <span
              className="text-white"
              style={{ WebkitTextStroke: "1px black" }}
            >
              I
            </span>
            <span
              className="text-red-600"
              style={{ WebkitTextStroke: "1px white" }}
            >
              MA
            </span>
            <span
              className="text-white"
              style={{ WebkitTextStroke: "1px black" }}
            >
              C
            </span>
            <span
              className="text-green-600"
              style={{ WebkitTextStroke: "1px white" }}
            >
              A
            </span>
            <span
              className="text-green-600"
              style={{ WebkitTextStroke: "1px white" }}
            >
              RE
            </span>
          </h1>
          <p className="text-text-secondary">Physician Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              license id
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="56845"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Demo license id: 56845 | Password: password
        </p>
      </Card>
    </div>
  );
}
