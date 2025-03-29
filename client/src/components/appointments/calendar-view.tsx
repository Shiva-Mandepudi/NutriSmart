import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay, isBefore, isToday } from "date-fns";

interface CalendarViewProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  bookedDates?: Date[];
}

export function CalendarView({ selectedDate, onDateSelect, bookedDates = [] }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  
  const isDayBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
  };
  
  useEffect(() => {
    // If selected date changes, update current month view
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="p-3 border rounded-lg">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        disabled={date => isBefore(date, today) && !isToday(date)}
        className="w-full"
        modifiers={{
          booked: (date) => isDayBooked(date)
        }}
        modifiersClassNames={{
          booked: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:text-blue-900"
        }}
        dayClassName={(date) => {
          return cn(
            isDayBooked(date) && !selectedDate?.getTime() === date.getTime() && "relative",
            isToday(date) && !selectedDate?.getTime() === date.getTime() && "border border-primary text-primary"
          );
        }}
      />
      
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-primary rounded-full"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
