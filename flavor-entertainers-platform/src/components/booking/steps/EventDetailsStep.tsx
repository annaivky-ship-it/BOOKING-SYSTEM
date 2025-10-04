'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, Clock, Phone, Mail, User, AlertTriangle } from 'lucide-react';
import { BookingData } from '@/hooks/useBooking';

interface EventDetailsStepProps {
  bookingData: Partial<BookingData>;
  onDataChange: (data: Partial<BookingData>) => void;
  errors: Record<string, string>;
}

export function EventDetailsStep({
  bookingData,
  onDataChange,
  errors
}: EventDetailsStepProps) {

  const handleInputChange = (field: keyof BookingData, value: string | number) => {
    onDataChange({ [field]: value });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as Australian phone number
    if (digits.length >= 10) {
      return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return digits;
  };

  const getMinDateTime = () => {
    const now = new Date();
    // Add 24 hours minimum advance booking
    now.setHours(now.getHours() + 24);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date & Time *</Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={bookingData.eventDate || ''}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                min={getMinDateTime()}
                className={errors.eventDate ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.eventDate}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 24 hours advance booking required
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={bookingData.duration || ''}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                placeholder="e.g., 2"
                className={errors.duration ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.duration}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Maximum 12 hours per booking
              </p>
            </div>
          </div>

          {/* Event Address */}
          <div className="space-y-2">
            <Label htmlFor="eventAddress">Event Address *</Label>
            <Textarea
              id="eventAddress"
              value={bookingData.eventAddress || ''}
              onChange={(e) => handleInputChange('eventAddress', e.target.value)}
              placeholder="Enter the full event address including suburb and postcode"
              rows={3}
              className={errors.eventAddress ? 'border-red-300 focus:ring-red-500' : ''}
            />
            {errors.eventAddress && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {errors.eventAddress}
              </p>
            )}
            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-blue-700">
                <p className="font-medium">Address Guidelines:</p>
                <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                  <li>Include unit/apartment number if applicable</li>
                  <li>Specify if it's a private residence, hotel, or venue</li>
                  <li>Provide parking information if available</li>
                  <li>Note any access codes or special instructions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <Label htmlFor="guestCount">Number of Guests</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max="100"
              value={bookingData.guestCount || ''}
              onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value) || 0)}
              placeholder="e.g., 10"
            />
            <p className="text-xs text-muted-foreground">
              Approximate number of people attending the event
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contactName">Full Name *</Label>
              <Input
                id="contactName"
                value={bookingData.contactName || ''}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="Your full name"
                className={errors.contactName ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.contactName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.contactName}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  type="tel"
                  value={bookingData.contactPhone || ''}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    handleInputChange('contactPhone', formatted);
                  }}
                  placeholder="0400 123 456"
                  className={`pl-10 ${errors.contactPhone ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.contactPhone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.contactPhone}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Australian mobile number preferred for WhatsApp updates
              </p>
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="contactEmail"
                type="email"
                value={bookingData.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="your.email@example.com"
                className={`pl-10 ${errors.contactEmail ? 'border-red-300 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.contactEmail && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {errors.contactEmail}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Used for booking confirmations and important updates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Special Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements or Notes</Label>
            <Textarea
              id="specialRequirements"
              value={bookingData.specialRequirements || ''}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              placeholder="Any special requests, theme details, music preferences, or other important information..."
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Optional - helps us provide the best service</span>
              <span>{(bookingData.specialRequirements || '').length}/500</span>
            </div>
          </div>

          {/* Important Information */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Important Booking Guidelines:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>All bookings require a minimum 24-hour advance notice</li>
                  <li>Venue must be appropriate and safe for the selected service</li>
                  <li>Client must be present during the entire booking</li>
                  <li>All parties must respect performer boundaries and consent</li>
                  <li>Recording or photography requires explicit consent</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}