
import React, { useState, useMemo } from 'react';
import type { Booking } from '../types';
import { ChevronLeft, ChevronRight, ArrowLeft, X, User, Clock, MapPin, PartyPopper, Users as UsersIcon } from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings]);

  const bookingsByDate = useMemo(() => {
    const grouped: { [key: string]: Booking[] } = {};
    confirmedBookings.forEach(booking => {
      // Use UTC date to avoid timezone issues with date keys
      const eventDate = new Date(booking.event_date);
      const utcDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());
      const dateKey = utcDate.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [confirmedBookings]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  // Adjust to make Monday the first day of the week (1) down to Sunday (0) -> (6)
  const startDay = (startOfMonth.getDay() + 6) % 7; 
  const daysInMonth = endOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays = [];
  // Add padding for days from previous month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  // Add days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Gallery
      </button>

      <div className="card-base !p-4 sm:!p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-zinc-700 transition-colors"><ChevronLeft /></button>
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-zinc-700 transition-colors"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-zinc-400">
          {daysOfWeek.map(day => <div key={day} className="py-2 text-xs sm:text-base">{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="border border-transparent rounded-lg"></div>;
            }
            const dateKey = day.toISOString().split('T')[0];
            const dayBookings = bookingsByDate[dateKey] || [];
            const isToday = day.getTime() === today.getTime();

            return (
              <div key={index} className={`h-28 sm:h-36 rounded-lg p-1.5 sm:p-2 flex flex-col bg-zinc-900/50 border ${isToday ? 'border-orange-500' : 'border-zinc-800'}`}>
                <span className={`text-sm font-bold ${isToday ? 'text-orange-400' : 'text-white'}`}>{day.getDate()}</span>
                <div className="mt-1 flex-grow overflow-y-auto text-left text-xs space-y-1 pr-1">
                  {dayBookings.map(booking => (
                    <button 
                      key={booking.id} 
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full p-1 sm:p-1.5 rounded bg-orange-500/20 hover:bg-orange-500/40 text-orange-200 truncate transition-colors text-center sm:text-left"
                      title={`${booking.performer?.name} - ${booking.event_type}`}
                    >
                      <span className="hidden sm:inline">{booking.performer?.name}</span>
                       <span className="sm:hidden">{booking.performer?.name?.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card-base !p-0 !bg-zinc-900 max-w-lg w-full flex flex-col max-h-[90vh] shadow-2xl shadow-black/50">
            <div className="flex-shrink-0 p-6 flex justify-between items-center border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-grow p-6 sm:p-8 overflow-y-auto space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-400"><User /></div>
                <div><p className="text-sm text-zinc-400">Performer</p><p className="font-semibold text-white">{selectedBooking.performer?.name}</p></div>
              </div>
               <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-400"><User /></div>
                <div><p className="text-sm text-zinc-400">Client</p><p className="font-semibold text-white">{selectedBooking.client_name}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-400"><PartyPopper /></div>
                <div><p className="text-sm text-zinc-400">Event Type</p><p className="font-semibold text-white">{selectedBooking.event_type}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-400"><Clock /></div>
                <div><p className="text-sm text-zinc-400">Date & Time</p><p className="font-semibold text-white">{new Date(selectedBooking.event_date).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedBooking.event_time}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-400"><MapPin /></div>
                <div><p className="text-sm text-zinc-400">Address</p><p className="font-semibold text-white">{selectedBooking.event_address}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-400"><UsersIcon /></div>
                <div><p className="text-sm text-zinc-400">Guests</p><p className="font-semibold text-white">{selectedBooking.number_of_guests}</p></div>
              </div>
            </div>
             <div className="flex-shrink-0 p-4 bg-zinc-950/50 border-t border-zinc-800 text-right">
                <button onClick={() => setSelectedBooking(null)} className="btn-primary px-6 py-2">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarView;
