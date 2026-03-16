import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";

interface TermsConditionsProps {
  onNavigate: (page: "signin" | "signup") => void;
}

export function TermsConditions({ onNavigate }: TermsConditionsProps) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: February 15, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Cage Riot Distribution & Publishing platform ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms & Conditions, please do not use this Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Service Description</h2>
              <p>
                Cage Riot provides a comprehensive music distribution and publishing platform that enables artists, labels, and rights holders to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Distribute music to major digital streaming platforms (DSPs)</li>
                <li>Manage music publishing rights and royalties</li>
                <li>Track performance analytics and streaming data</li>
                <li>Collect and distribute revenue from various sources</li>
                <li>Manage content across multiple platforms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">3.1 Account Creation</h3>
              <p>
                To use our Service, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">3.2 Account Types</h3>
              <p>Different account types have different access levels and permissions:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Artist/Partner:</strong> Upload content, view analytics, manage releases</li>
                <li><strong>Operations Manager:</strong> Manage distribution and platform operations</li>
                <li><strong>Legal/Compliance:</strong> Handle legal matters and copyright issues</li>
                <li><strong>Finance/Accounting:</strong> Manage royalties and financial reporting</li>
                <li><strong>Administrator:</strong> Full system access and user management</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">3.3 Account Security</h3>
              <p>
                You must immediately notify us of any unauthorized use of your account. We recommend enabling two-factor authentication (2FA) for enhanced security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Content Rights and Licensing</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">4.1 Your Content</h3>
              <p>
                You retain all ownership rights to the music and content you upload to our platform. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Distribute your content to designated DSPs</li>
                <li>Store, reproduce, and transmit your content</li>
                <li>Create derivative formats necessary for distribution</li>
                <li>Display metadata and promotional materials</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">4.2 Content Warranties</h3>
              <p>You warrant that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You own or have the necessary rights to all content you upload</li>
                <li>Your content does not infringe any third-party rights</li>
                <li>Your content complies with all applicable laws and regulations</li>
                <li>You have obtained all necessary permissions and clearances</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">4.3 Prohibited Content</h3>
              <p>You may not upload content that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Infringes copyright, trademark, or other intellectual property rights</li>
                <li>Contains hate speech, violence, or discriminatory content</li>
                <li>Violates privacy or publicity rights</li>
                <li>Contains malware or harmful code</li>
                <li>Violates any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Distribution and Publishing</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">5.1 Distribution Process</h3>
              <p>
                We will use commercially reasonable efforts to distribute your content to selected DSPs. However, we do not guarantee acceptance by any particular platform, as each DSP has its own content policies and approval processes.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">5.2 Content Delivery Timeline</h3>
              <p>
                Distribution timelines vary by platform and may take 1-7 business days for initial delivery, and up to 2-4 weeks for content to appear on all platforms. Rush delivery options may be available for additional fees.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">5.3 Metadata Accuracy</h3>
              <p>
                You are responsible for ensuring all metadata (artist names, song titles, release dates, etc.) is accurate and properly formatted. Incorrect metadata may result in delayed distribution or content rejection.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Royalties and Payments</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">6.1 Revenue Collection</h3>
              <p>
                We collect royalties from DSPs and other sources on your behalf. Royalty reporting periods vary by platform, and there may be a delay between streams/sales and when revenue is reported to us.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2">6.2 Payment Terms</h3>
              <p>
                Payments are typically processed monthly, subject to meeting minimum payout thresholds. We retain a commission as outlined in your service agreement. Detailed royalty statements are available through your dashboard.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">6.3 Payment Disputes</h3>
              <p>
                You must notify us of any payment discrepancies within 90 days of the statement date. We will investigate and resolve disputes in accordance with our policies and DSP agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Takedown Requests</h2>
              <p>
                You may request removal of your content from distribution at any time. Takedown requests typically take 2-10 business days to process across all platforms. Some platforms may retain cached copies for a limited period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Copyright Infringement</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">8.1 DMCA Compliance</h3>
              <p>
                We comply with the Digital Millennium Copyright Act (DMCA) and will respond to valid takedown notices. If you believe content infringes your copyright, please contact our legal team.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">8.2 Repeat Infringers</h3>
              <p>
                We maintain a policy of terminating accounts of users who repeatedly infringe copyrights or other intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Service Fees and Billing</h2>
              <p>
                Service fees are outlined in your specific service agreement. Fees may include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Annual or per-release distribution fees</li>
                <li>Commission on royalties collected</li>
                <li>Premium features and add-on services</li>
                <li>Rush delivery or priority support</li>
              </ul>
              <p className="mt-2">
                All fees are non-refundable except as required by law or as explicitly stated in your service agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Term and Termination</h2>
              <h3 className="text-lg font-medium text-foreground mb-2">10.1 Term</h3>
              <p>
                This agreement begins when you create an account and continues until terminated by either party.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">10.2 Termination by You</h3>
              <p>
                You may terminate your account at any time through your account settings. Upon termination, we will process takedown requests for your content, subject to any minimum distribution periods required by DSP agreements.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-4">10.3 Termination by Us</h3>
              <p>
                We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAGE RIOT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Warranties and Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Cage Riot from any claims, damages, losses, liabilities, and expenses arising from your use of the Service, your content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">14. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Cage Riot is incorporated, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">15. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the platform. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">16. Contact Information</h2>
              <p>
                For questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="font-medium text-foreground">Cage Riot Distribution & Publishing</p>
                <p>Email: legal@cageriot.com</p>
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