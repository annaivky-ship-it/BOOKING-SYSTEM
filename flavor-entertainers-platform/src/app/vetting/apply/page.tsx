import { VettingApplicationForm } from '@/components/vetting/application-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, Star, CheckCircle } from 'lucide-react'

export default function VettingApplicationPage() {
  return (
    <div className="min-h-screen dark-radial-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Join <span className="text-shimmer">Flavor Entertainers</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            Complete our comprehensive vetting process to become a verified performer on Australia's premier entertainment platform.
          </p>
        </div>

        {/* Process Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 orange-glow">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2 text-white">Application</h3>
            <p className="text-sm text-zinc-400">Complete your performer profile and upload required documents</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 orange-glow">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2 text-white">Review</h3>
            <p className="text-sm text-zinc-400">Our team reviews your application and verifies documents</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 orange-glow">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2 text-white">Background Check</h3>
            <p className="text-sm text-zinc-400">Comprehensive background and reference verification</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 orange-glow">
              <span className="text-white font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2 text-white">Approval</h3>
            <p className="text-sm text-zinc-400">Welcome to the platform and start receiving bookings</p>
          </div>
        </div>

        {/* Requirements */}
        <Card className="mb-8 card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-orange-400" />
              Application Requirements
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Please ensure you have the following before starting your application:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Valid government-issued ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Professional photos/portfolio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Performance videos (recommended)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Professional references</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Insurance certificate (if applicable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">ABN (for business performers)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Working with Children Check (event dependent)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Equipment list and technical requirements</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-white">Performer Application</CardTitle>
            <CardDescription className="text-zinc-400">
              Fill out all sections completely and accurately. Applications typically take 3-5 business days to process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VettingApplicationForm />
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="card-premium card-hover">
            <CardHeader className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <CardTitle className="text-lg text-white">Premium Exposure</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-zinc-400">
                Get featured on our platform and reach thousands of potential clients across Australia.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-premium card-hover">
            <CardHeader className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <CardTitle className="text-lg text-white">Instant Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-zinc-400">
                Receive payments instantly via PayID. No more waiting for checks or bank transfers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-premium card-hover">
            <CardHeader className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <CardTitle className="text-lg text-white">Protected Bookings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-zinc-400">
                All bookings are protected with contracts and dispute resolution support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}