import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  DialogFooter
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const consultationSchema = z.object({
  type: z.enum(["nutrition", "wellness", "fitness"], {
    required_error: "Please select a consultation type",
  }),
  date: z.date({
    required_error: "Please select a date",
  }).refine(date => {
    // Must be at least tomorrow
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow;
  }, {
    message: "Consultation must be scheduled at least one day in advance",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

interface AppointmentFormProps {
  selectedDate?: Date;
  onSubmit: (data: ConsultationFormValues) => void;
  isSubmitting: boolean;
}

export function AppointmentForm({ selectedDate, onSubmit, isSubmitting }: AppointmentFormProps) {
  const availableTimeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];
  
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      type: "nutrition",
      date: selectedDate || addDays(new Date(), 1),
      time: "10:00",
      notes: "",
    },
  });
  
  const handleSubmit = (values: ConsultationFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consultation Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consultation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="nutrition">Nutrition Consultation</SelectItem>
                  <SelectItem value="wellness">Wellness Coaching</SelectItem>
                  <SelectItem value="fitness">Fitness Assessment</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of session you'd like to schedule
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        // Disable dates in the past and weekends
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0 || date.getDay() === 6;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Let us know if you have any specific concerns or questions for the consultant..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Share any details that might help your consultant prepare for the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Book Consultation
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
