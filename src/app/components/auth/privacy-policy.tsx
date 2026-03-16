import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";

interface PrivacyPolicyProps {
  onNavigate: (page: "signin" | "signup") => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-[15px] sm:p-[32px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("signup")}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <img src={logo} alt="Cage Riot" className="w-12 h-12 object-contain" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: February 15, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>
                Welcome to Cage Riot Distribution & Publishing ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our music distribution and publishing platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">2.1 Personal Information</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name, email address, and contact information</li>
                <li>Account credentials (username and password)</li>
                <li>Payment and billing information</li>
                <li>Artist name, stage name, and biographical information</li>
                <li>Tax identification numbers and financial details</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">2.2 Content Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Audio files and music recordings</li>
                <li>Artwork, images, and promotional materials</li>
                <li>Metadata including song titles, album information, and release dates</li>
                <li>Copyright and publishing information</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">2.3 Usage Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Log data and device information</li>
                <li>IP addresses and browser type</li>
                <li>Analytics and performance data</li>
                <li>Interaction with our platform features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our distribution and publishing services</li>
                <li>Process your music releases to digital streaming platforms</li>
                <li>Calculate and distribute royalty payments</li>
                <li>Communicate with you about your account and services</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Detect, prevent, and address fraud and security issues</li>
                <li>Comply with legal obligations and industry standards</li>
                <li>Generate analytics and insights about platform usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Information Sharing and Disclosure</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">4.1 Digital Service Providers</h3>
              <p>
                We share your music content and metadata with digital streaming platforms (DSPs) including Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, Tidal, SoundCloud, and TikTok Music to facilitate distribution of your releases.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">4.2 Service Providers</h3>
              <p>
                We may share information with third-party service providers who perform services on our behalf, including payment processing, data analytics, hosting services, and customer support.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">4.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required by law or in response to valid requests by public authorities, or to protect our rights, privacy, safety, or property.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Two-factor authentication (2FA) options</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication protocols</li>
                <li>Secure data centers and infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights and Choices</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access, update, or correct your personal information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Object to processing of your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Music content and royalty records may be retained for extended periods as required by copyright law and accounting standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Children's Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="font-medium text-foreground">Cage Riot Distribution & Publishing</p>
                <p>Email: privacy@cageriot.com</p>
                <p>Support: support@cageriot.com</p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 Cage Riot Distribution & Publishing. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}