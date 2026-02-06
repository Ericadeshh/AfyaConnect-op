"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockBookings = [
  {
    id: 1,
    clinic: "TB Wing A - Nairobi Central Hospital",
    date: "2024-12-05",
    time: "10:00 - 11:00",
    status: "pending-payment",
    amount: 50,
    expiresAt: "2024-12-05 10:00",
    daysLeft: 2,
  },
  {
    id: 2,
    clinic: "TB Wing B - Mombasa County Hospital",
    date: "2024-12-12",
    time: "14:00 - 15:00",
    status: "confirmed",
    amount: 50,
    expiresAt: null,
  },
];

interface BookingsListProps {
  onSelectBooking: (booking: any) => void;
}

export default function BookingsList({ onSelectBooking }: BookingsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary mb-6">Your Bookings</h2>

      {mockBookings.map((booking) => (
        <Card
          key={booking.id}
          className="p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{booking.clinic}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-text-secondary">Date & Time</p>
                  <p className="font-medium">
                    {booking.date} {booking.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Amount</p>
                  <p className="font-medium">KSH {booking.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <p
                    className={`font-medium ${
                      booking.status === "pending-payment"
                        ? "text-warning"
                        : booking.status === "confirmed"
                          ? "text-success"
                          : "text-error"
                    }`}
                  >
                    {booking.status === "pending-payment"
                      ? "Pending Payment"
                      : "Confirmed"}
                  </p>
                </div>
                {booking.daysLeft && (
                  <div>
                    <p className="text-sm text-text-secondary">Expires In</p>
                    <p className="font-medium text-warning">
                      {booking.daysLeft} days
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => onSelectBooking(booking)}
              className="bg-accent hover:bg-accent-light text-white ml-4"
            >
              Manage
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
