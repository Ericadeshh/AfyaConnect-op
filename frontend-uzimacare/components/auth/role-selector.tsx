"use client";

import type { UserRole } from "../../lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary to-primary-light flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 text-center">
            <span
              className="text-black"
              style={{ WebkitTextStroke: "1px white" }}
            >
              UZ
            </span>
            <span
              className="text-white"
              style={{ WebkitTextStroke: "1px white" }}
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
              style={{ WebkitTextStroke: "1px white" }}
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
          <p className="text-lg text-purple-100">
            A HEALTHCARE REFERRAL SYSTEM
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch px-2">
          {/* Physician */}
          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-accent h-full"
            onClick={() => onSelectRole("physician")}
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Physician</h3>
              <p className="text-text-secondary mb-4">
                Create and manage patient referrals
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">
                Login as Physician
              </Button>
            </div>
          </Card>

          {/* Patient */}
          {/* Patient portal removed */}

          {/* Admin */}
          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-accent h-full"
            onClick={() => onSelectRole("admin")}
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Administration</h3>
              <p className="text-text-secondary mb-4">
                Manage referrals and coordinate care
              </p>
              <Button className="w-full bg-warning hover:opacity-90 text-white mt-4">
                Login as Administration
              </Button>
            </div>
          </Card>
        </div>

        {/* Demo credentials removed to eliminate bottom white block */}
      </div>
    </div>
  );
}
