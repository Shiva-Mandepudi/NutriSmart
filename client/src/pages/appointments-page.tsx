import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CalendarView } from "@/components/appointments/calendar-view";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CalendarCheck, 
  Clock, 
  MessageSquare, 
  VideoIcon,
  PanelRightOpen,
  Plus
} from "lucide-react";
import { format, isToday, isFuture, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, "id" | "userId">) => {
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsBookingOpen(false);
      toast({
        title: "Appointment booked",
        description: "Your consultation has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const upcomingAppointments = appointments
    ? appointments
        .filter(apt => isFuture(parseISO(apt.date.toString())))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
     
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Nutrition Consultations</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Book and manage your personal nutrition and wellness consultations
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Appointment Calendar</span>
                </CardTitle>
                <CardDescription>
                  Select a date to view availability and book your consultation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarView 
                  selectedDate={selectedDate} 
                  onDateSelect={setSelectedDate}
                  bookedDates={appointments?.map(apt => new Date(apt.date)) || []}
                />
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setSelectedDate(new Date())}
                >
                  <Clock className="h-4 w-4" />
                  Today
                </Button>
                <Button 
                  onClick={() => setIsBookingOpen(true)} 
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Book Consultation
                </Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  <span>Upcoming Sessions</span>
                </CardTitle>
                <CardDescription>
                  Your scheduled nutrition consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  // Loading skeletons
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {format(new Date(appointment.date), "MMMM d, yyyy")}
                          </h4>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                          {format(new Date(appointment.date), "h:mm a")} · {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Consultation
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-primary-200 dark:border-primary-800 pl-3 py-1 mb-3">
                            {appointment.notes}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <VideoIcon className="h-3 w-3" />
                            <span>Join</span>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>Message</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarCheck className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No upcoming appointments</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Book a consultation with our nutrition experts to get personalized advice.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsBookingOpen(true)}
                    >
                      Book Your First Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Consultation</DialogTitle>
            <DialogDescription>
              Schedule your one-on-one session with our nutrition experts
            </DialogDescription>
          </DialogHeader>
          
          <AppointmentForm 
            selectedDate={selectedDate}
            onSubmit={(data) => createAppointmentMutation.mutate(data)}
            isSubmitting={createAppointmentMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
}
