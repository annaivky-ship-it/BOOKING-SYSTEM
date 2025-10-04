'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked' | 'tentative';
  booking_id?: string;
  client_name?: string;
  event_type?: string;
  location?: string;
  notes?: string;
  is_recurring?: boolean;
  auto_accept?: boolean;
}

interface CalendarDay {
  date: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  slots: TimeSlot[];
}

interface LiveCalendarProps {
  performerId: string;
  className?: string;
  onSlotSelect?: (slot: TimeSlot) => void;
  showBookingDetails?: boolean;
}

const slotStatusConfig = {
  available: {
    color: 'bg-green-100 border-green-300 text-green-800',
    badge: 'bg-green-500',
    label: 'Available',
    icon: CheckCircle,
  },
  booked: {
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    badge: 'bg-blue-500',
    label: 'Booked',
    icon: Calendar,
  },
  blocked: {
    color: 'bg-red-100 border-red-300 text-red-800',
    badge: 'bg-red-500',
    label: 'Blocked',
    icon: AlertCircle,
  },
  tentative: {
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    badge: 'bg-yellow-500',
    label: 'Tentative',
    icon: Clock,
  },
};

export function LiveCalendar({
  performerId,
  className,
  onSlotSelect,
  showBookingDetails = true,
}: LiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateSlots, setShowPrivateSlots] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate calendar days for current month
  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Add previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.toISOString().split('T')[0],
        isToday: false,
        isCurrentMonth: false,
        slots: [],
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isToday = currentDay.toDateString() === today.toDateString();

      days.push({
        date: currentDay.toISOString().split('T')[0],
        isToday,
        isCurrentMonth: true,
        slots: [], // Fetch from API
      });
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate.toISOString().split('T')[0],
        isToday: false,
        isCurrentMonth: false,
        slots: [],
      });
    }

    return days;
  };

  // Generate mock time slots (in real app, this would come from API)

  // Load calendar data
  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const days = generateCalendarDays(currentDate);
      setCalendarData(days);
      setLastUpdate(new Date());
    } catch (error) {
      toast.error('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, performerId]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available' || showBookingDetails) {
      setSelectedSlot(slot);
      setIsDialogOpen(true);
      onSlotSelect?.(slot);
    }
  };

  const toggleSlotAvailability = async (slotId: string) => {
    setCalendarData(prev =>
      prev.map(day => ({
        ...day,
        slots: day.slots.map(slot => {
          if (slot.id === slotId) {
            const newStatus = slot.status === 'available' ? 'blocked' : 'available';
            return { ...slot, status: newStatus };
          }
          return slot;
        }),
      }))
    );

    toast.success('Slot availability updated');
  };

  const getDaySlotSummary = (day: CalendarDay) => {
    const available = day.slots.filter(s => s.status === 'available').length;
    const booked = day.slots.filter(s => s.status === 'booked').length;

    if (booked > 0) return { type: 'booked', count: booked };
    if (available > 0) return { type: 'available', count: available };
    return { type: 'none', count: 0 };
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Live Availability Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivateSlots(!showPrivateSlots)}
            >
              {showPrivateSlots ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="ml-1 hidden sm:inline">
                {showPrivateSlots ? 'Hide' : 'Show'} Details
              </span>
            </Button>
            <Button variant="outline" size="sm" onClick={loadCalendarData} disabled={isLoading}>
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            ← Prev
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            Next →
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-2">
          {Object.entries(slotStatusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center space-x-1 text-xs">
              <div className={cn('w-3 h-3 rounded', config.badge)}></div>
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarData.map((day, index) => {
            const summary = getDaySlotSummary(day);
            const dayNumber = new Date(day.date).getDate();

            return (
              <div
                key={index}
                className={cn(
                  'p-1 border rounded-lg cursor-pointer transition-all hover:bg-muted/50',
                  day.isCurrentMonth ? 'bg-background' : 'bg-muted/20',
                  day.isToday && 'ring-2 ring-primary',
                  selectedDate === day.date && 'bg-primary/10'
                )}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="text-center">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                      day.isToday && 'text-primary font-bold'
                    )}
                  >
                    {dayNumber}
                  </div>

                  {/* Slot indicators */}
                  {day.isCurrentMonth && day.slots.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {day.slots.slice(0, 3).map(slot => {
                        const config = slotStatusConfig[slot.status];
                        return (
                          <div
                            key={slot.id}
                            className={cn('h-1 rounded-full mx-1', config.badge)}
                          />
                        );
                      })}
                      {day.slots.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{day.slots.length - 3}</div>
                      )}
                    </div>
                  )}

                  {/* Summary badge */}
                  {summary.count > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs px-1 py-0">
                      {summary.count}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details */}
        {selectedDate && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-3">
              {new Date(selectedDate).toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>

            {(() => {
              const selectedDay = calendarData.find(d => d.date === selectedDate);
              if (!selectedDay?.slots.length) {
                return <p className="text-sm text-muted-foreground">No time slots available</p>;
              }

              return (
                <div className="space-y-2">
                  {selectedDay.slots.map(slot => {
                    const config = slotStatusConfig[slot.status];
                    const startTime = new Date(slot.start_time).toLocaleTimeString('en-AU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const endTime = new Date(slot.end_time).toLocaleTimeString('en-AU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                          config.color
                        )}
                        onClick={() => handleSlotClick(slot)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <config.icon className="w-4 h-4" />
                            <span className="font-medium">
                              {startTime} - {endTime}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>

                          {slot.auto_accept && slot.status === 'available' && (
                            <Badge variant="outline" className="text-xs">
                              Auto-Accept
                            </Badge>
                          )}
                        </div>

                        {showPrivateSlots && slot.client_name && (
                          <div className="mt-2 text-sm space-y-1">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{slot.client_name}</span>
                            </div>
                            {slot.event_type && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{slot.event_type}</span>
                              </div>
                            )}
                            {slot.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{slot.location}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {isLoading && <span className="ml-2">Updating...</span>}
        </div>
      </CardContent>

      {/* Slot Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Slot Details</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {new Date(selectedSlot.start_time).toLocaleDateString()} -{' '}
                  {new Date(selectedSlot.start_time).toLocaleTimeString('en-AU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  to{' '}
                  {new Date(selectedSlot.end_time).toLocaleTimeString('en-AU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{slotStatusConfig[selectedSlot.status].label}</Badge>
                {selectedSlot.auto_accept && <Badge variant="secondary">Auto-Accept</Badge>}
              </div>

              {selectedSlot.client_name && (
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p className="text-sm">{selectedSlot.client_name}</p>
                </div>
              )}

              {selectedSlot.event_type && (
                <div>
                  <Label className="text-sm font-medium">Event Type</Label>
                  <p className="text-sm">{selectedSlot.event_type}</p>
                </div>
              )}

              {selectedSlot.location && (
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm">{selectedSlot.location}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {selectedSlot.status === 'available' && (
                  <Button variant="outline" onClick={() => toggleSlotAvailability(selectedSlot.id)}>
                    Block Slot
                  </Button>
                )}
                {selectedSlot.status === 'blocked' && (
                  <Button variant="outline" onClick={() => toggleSlotAvailability(selectedSlot.id)}>
                    Make Available
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
