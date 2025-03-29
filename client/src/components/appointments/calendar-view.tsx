import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay, isBefore, isToday } from "date-fns";
import { SelectSingleEventHandler } from "react-day-picker";

interface CalendarViewProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  bookedDates?: Date[];
}

export function CalendarView({ selectedDate, onDateSelect, bookedDates = [] }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  
  const isDayBooked = (date: Date): boolean => {
    return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
  };
  
  useEffect(() => {
    // If selected date changes, update current month view
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // Handler for calendar date selection
  const handleDateSelect: SelectSingleEventHandler = (day) => {
    if (day) {
      onDateSelect(day);
    }
  };

  return (
    <div className="p-3 border rounded-lg">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        disabled={(date: Date) => isBefore(date, today) && !isToday(date)}
        className="w-full"
        modifiers={{
          booked: (date) => isDayBooked(date)
        }}
        modifiersClassNames={{
          booked: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:text-blue-900"
        }}
        classNames={{
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
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
