'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { createClientComponentClient } from '@/lib/supabase';
import { Clock, DollarSign, Info, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_rate: number;
  rate_type: string;
  min_duration_minutes: number;
  booking_notes: string;
  is_private_only: boolean;
  age_restricted: boolean;
}

interface ServiceSelectionStepProps {
  performer: any;
  selectedService?: string;
  onServiceSelect: (service: string) => void;
  errors: Record<string, string>;
}

export function ServiceSelectionStep({
  performer,
  selectedService,
  onServiceSelect,
  errors
}: ServiceSelectionStepProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);

        // Get performer's available services
        const { data: performerServices, error } = await supabase
          .from('performer_services')
          .select(`
            service_id,
            custom_rate,
            is_available,
            special_notes,
            services:service_id (
              id,
              name,
              description,
              category,
              base_rate,
              rate_type,
              min_duration_minutes,
              booking_notes,
              is_private_only,
              age_restricted
            )
          `)
          .eq('performer_id', performer.id)
          .eq('is_available', true);

        if (error) {
          throw error;
        }

        const availableServices = performerServices?.map(ps => ({
          ...ps.services,
          custom_rate: ps.custom_rate,
          special_notes: ps.special_notes
        })) || [];

        setServices(availableServices);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    }

    if (performer?.id) {
      loadServices();
    }
  }, [performer?.id, supabase]);

  const categories = [
    { id: 'all', name: 'All Services', count: services.length },
    { id: 'waitressing', name: 'Waitressing', count: services.filter(s => s.category === 'waitressing').length },
    { id: 'lap_dance', name: 'Lap Dance', count: services.filter(s => s.category === 'lap_dance').length },
    { id: 'strip_show', name: 'Strip Shows', count: services.filter(s => s.category === 'strip_show').length }
  ];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const formatRate = (service: Service) => {
    const rate = service.custom_rate || service.base_rate;
    const suffix = service.rate_type === 'per_hour' ? '/hr' :
                  service.rate_type === 'per_person' ? '/person' : '';
    return `$${rate}${suffix}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'waitressing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'lap_dance': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'strip_show': return 'bg-pink-100 text-pink-800 border-pink-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Services</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {errors.service && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.service}
          </AlertDescription>
        </Alert>
      )}

      {/* Services Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid gap-4"
        >
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  selectedService === service.name
                    ? 'ring-2 ring-pink-500 bg-pink-50'
                    : 'hover:shadow-md hover:border-gray-300'
                }`}
                onClick={() => onServiceSelect(service.name)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{service.name}</h4>
                        {selectedService === service.name && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={getCategoryColor(service.category)}
                        >
                          {service.category.replace('_', ' ')}
                        </Badge>

                        {service.is_private_only && (
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            Private Only
                          </Badge>
                        )}

                        {service.age_restricted && (
                          <Badge variant="outline" className="border-red-300 text-red-700">
                            18+ Only
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {formatRate(service)}
                      </div>
                      {service.custom_rate && service.custom_rate !== service.base_rate && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${service.base_rate}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Min {service.min_duration_minutes} minutes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{service.rate_type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {service.booking_notes && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          {service.booking_notes}
                        </p>
                      </div>
                    </>
                  )}

                  {service.special_notes && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Special Note:</strong> {service.special_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Services Available
          </h3>
          <p className="text-gray-600">
            {selectedCategory === 'all'
              ? 'This performer has no services configured.'
              : 'No services available in this category.'
            }
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedService && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Selected: {selectedService}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> All services are subject to performer availability
          and venue suitability. Final pricing and terms will be confirmed before booking.
        </AlertDescription>
      </Alert>
    </div>
  );
}