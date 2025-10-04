import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-AU')}
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>18+ Content Warning:</strong> This platform contains adult entertainment content.
          By accessing and using our services, you confirm that you are at least 18 years of age
          and legally able to enter into this agreement.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {/* Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              By accessing and using the Flavor Entertainers platform ("we," "our," or "us"),
              you agree to be bound by these Terms of Service and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited from using our services.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card>
          <CardHeader>
            <CardTitle>Service Description</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Flavor Entertainers is a platform that connects event organizers with professional
              adult entertainers in Western Australia. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Performer discovery and booking management</li>
              <li>Payment processing via PayID integration</li>
              <li>Vetting and background check coordination</li>
              <li>Safety features and communication tools</li>
              <li>Event management and scheduling</li>
            </ul>
          </CardContent>
        </Card>

        {/* Age and Legal Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Age and Legal Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Strict Age Verification</h4>
              <ul className="text-red-700 space-y-1">
                <li>• You must be at least 18 years of age to use this platform</li>
                <li>• All users may be required to provide age verification</li>
                <li>• Minors are strictly prohibited from accessing our services</li>
                <li>• Violations will result in immediate account termination</li>
              </ul>
            </div>
            <p>
              All performers and clients must comply with Western Australian and
              Commonwealth laws regarding adult entertainment services.
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h4 className="font-semibold">All Users Must:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Respect the boundaries and consent of all parties</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain confidentiality and discretion</li>
              <li>Report any safety concerns or violations immediately</li>
            </ul>

            <h4 className="font-semibold mt-6">Clients Must:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Complete the vetting process when required</li>
              <li>Make payments as agreed for confirmed bookings</li>
              <li>Treat performers with respect and professionalism</li>
              <li>Provide safe and appropriate venues for services</li>
            </ul>

            <h4 className="font-semibold mt-6">Performers Must:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Maintain current vetting and background check status</li>
              <li>Provide services as described and agreed upon</li>
              <li>Communicate availability and scheduling changes promptly</li>
              <li>Follow safety protocols and check-in procedures</li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-3">Strictly Prohibited:</h4>
              <ul className="text-red-700 space-y-1">
                <li>• Illegal activities of any kind</li>
                <li>• Non-consensual activities or boundary violations</li>
                <li>• Harassment, abuse, or threatening behavior</li>
                <li>• Solicitation of services not offered through our platform</li>
                <li>• Recording or photography without explicit consent</li>
                <li>• Sharing personal information without consent</li>
                <li>• Attempting to circumvent safety or payment systems</li>
                <li>• Creating false accounts or providing false information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>All payments are processed through secure PayID integration</li>
              <li>Deposits are required for booking confirmation</li>
              <li>Full payment is due as agreed upon booking confirmation</li>
              <li>Refunds are subject to our cancellation policy</li>
              <li>Payment disputes must be reported within 48 hours</li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy and Safety */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy and Safety</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Your privacy and safety are paramount. Please review our{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              for detailed information about how we collect, use, and protect your data.
            </p>
            <h4 className="font-semibold">Safety Features:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Comprehensive vetting and background checks</li>
              <li>Real-time safety check-in systems</li>
              <li>24/7 emergency contact protocols</li>
              <li>Secure communication channels</li>
              <li>Incident reporting and resolution procedures</li>
            </ul>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Flavor Entertainers acts as a platform connecting clients and performers.
              While we implement safety measures and vetting procedures, users engage
              services at their own risk and responsibility.
            </p>
            <p>
              We are not liable for actions, conduct, or services provided by platform users.
              All parties must exercise their own judgment and take appropriate precautions.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              We reserve the right to terminate or suspend accounts immediately for:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Violation of these terms</li>
              <li>Illegal activities</li>
              <li>Safety concerns or complaints</li>
              <li>Fraudulent or deceptive behavior</li>
              <li>Failure to complete vetting requirements</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              We may update these terms at any time. Continued use of our platform
              after changes constitutes acceptance of the updated terms. Significant
              changes will be communicated to users via email or platform notifications.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              For questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> legal@lustandlace.com.au</li>
              <li><strong>Phone:</strong> +61 470 253 286</li>
              <li><strong>Address:</strong> Perth, Western Australia</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-sm text-muted-foreground">
        <p>
          By using Flavor Entertainers, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}