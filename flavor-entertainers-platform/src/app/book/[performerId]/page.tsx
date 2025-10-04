import { Suspense } from 'react';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { AgeGateModal } from '@/components/compliance/AgeGateModal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BookingPageProps {
  params: {
    performerId: string;
  };
}

function BookingPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookingPage({ params }: BookingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <AgeGateModal />

      <Suspense fallback={<BookingPageSkeleton />}>
        <BookingFlow performerId={params.performerId} />
      </Suspense>
    </div>
  );
}