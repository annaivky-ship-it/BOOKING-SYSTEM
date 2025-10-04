'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, MapPin, User, Mail, Phone, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    duration: '',
    venue: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    specialRequests: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Simulate booking submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Booking request submitted successfully!')
      // Reset form or redirect
    } catch (error) {
      toast.error('Failed to submit booking request')
    }
  }

  const steps = [
    { number: 1, title: 'Service Details', icon: Calendar },
    { number: 2, title: 'Your Information', icon: User },
    { number: 3, title: 'Review & Submit', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen dark-radial-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${isActive ? 'bg-orange-500 border-orange-500 text-white' :
                      isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      'border-zinc-700 text-zinc-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-zinc-500'}`}>
                      Step {step.number}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                      {step.title}
                    </div>
                  </div>
                  {step.number < steps.length && (
                    <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-zinc-700'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {currentStep === 1 && "Tell us about your event and service requirements"}
              {currentStep === 2 && "Provide your contact details for booking confirmation"}
              {currentStep === 3 && "Review your booking details and submit your request"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Service Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="service">Service Type *</Label>
                  <Select onValueChange={(value) => handleInputChange('service', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dancer">Professional Dancer</SelectItem>
                      <SelectItem value="musician">Live Music Performance</SelectItem>
                      <SelectItem value="comedian">Comedy Show</SelectItem>
                      <SelectItem value="magician">Magic Show</SelectItem>
                      <SelectItem value="dj">DJ Services</SelectItem>
                      <SelectItem value="other">Other Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Start Time *</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="2hours">2 hours</SelectItem>
                      <SelectItem value="3hours">3 hours</SelectItem>
                      <SelectItem value="custom">Custom duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="venue">Venue/Address *</Label>
                  <Input
                    placeholder="Enter event location"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Client Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    placeholder="Your full name"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientPhone">Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="04XX XXX XXX"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    placeholder="Any special requirements or requests for your event?"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-zinc-400">Service</div>
                      <div className="text-white">{formData.service || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">Date & Time</div>
                      <div className="text-white">{formData.date} at {formData.time}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">Duration</div>
                      <div className="text-white">{formData.duration || 'To be discussed'}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">Venue</div>
                      <div className="text-white">{formData.venue}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">Contact</div>
                      <div className="text-white">{formData.clientName}</div>
                      <div className="text-zinc-400 text-xs">{formData.clientEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-orange-400 text-sm font-medium mb-2">What happens next?</div>
                  <div className="text-zinc-300 text-sm">
                    • We'll review your request within 2 hours<br />
                    • A performer will be matched to your requirements<br />
                    • You'll receive confirmation and payment details<br />
                    • Enjoy your amazing event!
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="flex justify-between p-6 border-t border-zinc-800">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}

            <div className="ml-auto">
              {currentStep < 3 ? (
                <Button onClick={handleNext} className="btn-premium">
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="btn-premium">
                  Submit Booking Request
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}