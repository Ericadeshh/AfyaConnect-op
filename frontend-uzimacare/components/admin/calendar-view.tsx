import { Card } from "@/components/ui/card";

export default function CalendarView() {
  const daysInMonth = 30;
  const startingDay = 2; // December 2024 starts on Wednesday

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-warning">
        Clinic Calendar - December 2024
      </h2>

      <div className="mb-6">
        <div className="inline-block bg-surface px-4 py-2 rounded border border-border">
          <select className="bg-transparent font-medium">
            <option>TB Wing A - Nairobi Central Hospital</option>
            <option>TB Wing B - Mombasa County Hospital</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold p-2 text-primary">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 bg-gray-100 rounded"></div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === 3;
          const bookingCount = [5, 3, 8, 2, 6][i % 5] || 0;

          return (
            <div
              key={day}
              className={`h-20 p-2 rounded border-2 transition-all hover:shadow-md ${
                isToday
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-border hover:border-primary"
              }`}
            >
              <p className="font-semibold text-sm">{day}</p>
              <p
                className={`text-xs ${isToday ? "text-purple-100" : "text-text-secondary"}`}
              >
                {bookingCount} bookings
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="font-semibold mb-4">Legend</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded"></div>
            <span className="text-sm">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-success rounded"></div>
            <span className="text-sm">Fully Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-warning rounded"></div>
            <span className="text-sm">Nearly Full</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
