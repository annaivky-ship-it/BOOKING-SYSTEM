import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, Database, UserCheck, Bell } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-AU')}
        </p>
      </div>

      {/* Privacy Commitment */}
      <Alert className="mb-8 border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Privacy Commitment:</strong> We are committed to protecting your privacy and
          handling your personal information with the highest level of care and security,
          especially given the sensitive nature of our services.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Our Privacy Commitment
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Flavor Entertainers ("we," "our," or "us") understands the sensitive nature of
              adult entertainment services and is committed to protecting the privacy and
              confidentiality of all users. This Privacy Policy explains how we collect,
              use, store, and protect your personal information.
            </p>
            <p>
              We comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988
              and implement industry-leading security measures to protect your data.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h4 className="font-semibold">Personal Information:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Full name and contact details (email, phone, address)</li>
              <li>Date of birth and age verification documents</li>
              <li>Government-issued identification for vetting</li>
              <li>Banking and PayID information for payments</li>
              <li>Profile information and preferences</li>
              <li>Communication records and messages</li>
            </ul>

            <h4 className="font-semibold mt-6">Service-Related Information:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Booking details and service preferences</li>
              <li>Location data for safety and service delivery</li>
              <li>Reviews and feedback</li>
              <li>Payment and transaction history</li>
              <li>Safety check-ins and incident reports</li>
            </ul>

            <h4 className="font-semibold mt-6">Technical Information:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Device information and browser details</li>
              <li>IP addresses and usage analytics</li>
              <li>Cookies and tracking technologies</li>
              <li>Platform interaction and navigation data</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Legitimate Purposes Only</h4>
              <p className="text-green-700">
                We only use your information for legitimate business purposes related to
                providing safe, secure entertainment services.
              </p>
            </div>

            <h4 className="font-semibold">Primary Uses:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Facilitating bookings and service delivery</li>
              <li>Processing payments and managing accounts</li>
              <li>Conducting background checks and vetting</li>
              <li>Ensuring safety and security of all users</li>
              <li>Providing customer support and communication</li>
              <li>Improving our platform and services</li>
            </ul>

            <h4 className="font-semibold mt-6">Safety and Security:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Monitoring for prohibited or illegal activities</li>
              <li>Implementing safety check-in procedures</li>
              <li>Maintaining emergency contact protocols</li>
              <li>Investigating incidents and complaints</li>
              <li>Preventing fraud and protecting users</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Strict Confidentiality</h4>
              <p className="text-red-700">
                We do not sell, rent, or share your personal information with third parties
                for marketing purposes. Your privacy is paramount in our business.
              </p>
            </div>

            <h4 className="font-semibold">Limited Sharing Only When:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Required by law or legal process</li>
              <li>Necessary for safety or security purposes</li>
              <li>Required for payment processing (PayID, banks)</li>
              <li>Essential for background check services</li>
              <li>Needed for platform functionality (with consent)</li>
              <li>Part of business transfer (with user notification)</li>
            </ul>

            <h4 className="font-semibold mt-6">Service Providers:</h4>
            <p>
              We work with carefully selected service providers who assist with:
              payment processing, background checks, communication services, and platform
              hosting. All providers are bound by strict confidentiality agreements.
            </p>
          </CardContent>
        </Card>

        {/* Vetting and Background Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Vetting and Background Checks
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Our comprehensive vetting process is essential for maintaining a safe platform:
            </p>

            <h4 className="font-semibold">For All Users:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Identity verification using government-issued ID</li>
              <li>Age verification to ensure 18+ compliance</li>
              <li>Contact information validation</li>
              <li>Terms of service acknowledgment</li>
            </ul>

            <h4 className="font-semibold mt-4">For Performers:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Comprehensive background checks</li>
              <li>Work eligibility verification</li>
              <li>Professional reference checks</li>
              <li>Safety training completion</li>
            </ul>

            <h4 className="font-semibold mt-4">Data Retention:</h4>
            <p>
              Vetting information is retained for the duration of platform use plus
              applicable legal retention periods. Sensitive documents are securely
              destroyed when no longer required.
            </p>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security and Protection</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Enterprise-Grade Security</h4>
              <p className="text-blue-700">
                We implement bank-level security measures to protect your sensitive information
                from unauthorized access, use, or disclosure.
              </p>
            </div>

            <h4 className="font-semibold">Security Measures:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure data storage with encrypted databases</li>
              <li>Multi-factor authentication for account access</li>
              <li>Regular security audits and penetration testing</li>
              <li>Staff training on privacy and security protocols</li>
              <li>24/7 monitoring for suspicious activities</li>
              <li>Secure payment processing with PCI compliance</li>
            </ul>

            <h4 className="font-semibold mt-6">Data Breach Protocol:</h4>
            <p>
              In the unlikely event of a data breach, we will immediately secure our systems,
              assess the impact, and notify affected users and authorities as required by law.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Under Australian privacy law, you have the following rights regarding your personal information:
            </p>

            <h4 className="font-semibold">Access and Control:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Request access to your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt-out of non-essential communications</li>
              <li>Download your data in a portable format</li>
            </ul>

            <h4 className="font-semibold mt-6">Account Management:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Update privacy preferences at any time</li>
              <li>Control information sharing settings</li>
              <li>Manage communication preferences</li>
              <li>Request account deactivation or deletion</li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-amber-800 mb-2">Important Note</h4>
              <p className="text-amber-700">
                Some information may be retained for legal compliance, safety, or security purposes
                even after account deletion. We will clearly communicate any such requirements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              We use cookies and similar technologies to enhance your experience and platform security:
            </p>

            <h4 className="font-semibold">Essential Cookies:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>Age verification compliance</li>
              <li>Platform functionality and preferences</li>
            </ul>

            <h4 className="font-semibold mt-4">Analytics Cookies (Optional):</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Usage analytics and performance monitoring</li>
              <li>Feature usage and improvement insights</li>
              <li>Anonymous traffic and behavior analysis</li>
            </ul>

            <p>
              You can manage cookie preferences through your browser settings or our cookie
              preference center. Disabling essential cookies may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        {/* Communication and Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h4 className="font-semibold">Service Communications (Required):</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Booking confirmations and updates</li>
              <li>Payment notifications and receipts</li>
              <li>Safety check-ins and alerts</li>
              <li>Account security notifications</li>
              <li>Platform updates and policy changes</li>
            </ul>

            <h4 className="font-semibold mt-4">Optional Communications:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Platform news and feature announcements</li>
              <li>Safety tips and best practices</li>
              <li>Community updates and events</li>
            </ul>

            <p>
              You can opt-out of optional communications at any time through your account
              settings or unsubscribe links in emails.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              We retain personal information only as long as necessary for the purposes outlined
              in this policy or as required by law:
            </p>

            <h4 className="font-semibold">Retention Periods:</h4>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Account Information:</strong> Duration of active use plus 3 years</li>
              <li><strong>Booking Records:</strong> 7 years (tax and business records)</li>
              <li><strong>Payment Data:</strong> 7 years (financial record requirements)</li>
              <li><strong>Safety Incidents:</strong> 7 years (legal protection)</li>
              <li><strong>Vetting Documents:</strong> Duration of use plus 2 years</li>
              <li><strong>Communications:</strong> 2 years for platform-related messages</li>
            </ul>

            <p>
              After retention periods expire, data is securely deleted or anonymized unless
              longer retention is required by law.
            </p>
          </CardContent>
        </Card>

        {/* International Users */}
        <Card>
          <CardHeader>
            <CardTitle>International Considerations</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Our services are primarily designed for Australian users. If you access our
              platform from other countries:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Your data may be processed and stored in Australia</li>
              <li>Australian privacy laws will apply to your information</li>
              <li>You must comply with your local laws regarding adult services</li>
              <li>Age verification requirements may vary by jurisdiction</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices,
              technology, legal requirements, or other factors. Significant changes will be
              communicated via:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our platform</li>
              <li>Updated effective date at the top of this policy</li>
            </ul>
            <p className="mt-4">
              Continued use of our services after policy updates constitutes acceptance
              of the revised terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              For privacy-related questions, concerns, or requests, please contact our
              Privacy Officer:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@lustandlace.com.au</li>
                <li><strong>Phone:</strong> +61 470 253 286</li>
                <li><strong>Mail:</strong> Privacy Officer, Flavor Entertainers, Perth, WA</li>
              </ul>
            </div>
            <p className="mt-4">
              We aim to respond to all privacy inquiries within 30 days. For urgent
              matters, please call our support line.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          This Privacy Policy is effective as of the date stated above and applies to
          all information collected by Flavor Entertainers.
        </p>
        <p>
          Related Documents:{' '}
          <Link href="/legal/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}