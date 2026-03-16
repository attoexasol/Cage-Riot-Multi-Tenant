import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  AlertCircle,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Music,
  User,
  Calendar,
  FileText,
  ExternalLink,
  Download,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface AlertDetailsViewProps {
  alertType: string;
  onBack?: () => void;
}

const alertDetails = {
  "delivery-failed": {
    title: "Delivery Failed",
    severity: "critical",
    icon: AlertCircle,
    color: "text-[#ff0050]",
    bgColor: "bg-[#ff0050]/10",
    borderColor: "border-[#ff0050]/20",
    description: "3 releases failed delivery to Spotify",
    affectedReleases: [
      {
        title: "Electric Dreams - Album",
        artist: "Neon City",
        upc: "1234567890123",
        releaseDate: "2026-01-20",
        status: "Failed",
        errorCode: "METADATA_INVALID",
        errorMessage: "Track 3 duration mismatch: metadata shows 3:45 but audio is 3:42",
      },
      {
        title: "Sunset Boulevard - EP",
        artist: "The Waves",
        upc: "9876543210987",
        releaseDate: "2026-01-22",
        status: "Failed",
        errorCode: "AUDIO_QUALITY",
        errorMessage: "Track 1 contains clipping at 2:15-2:18",
      },
      {
        title: "Night Rider - Single",
        artist: "Urban Sound",
        upc: "5555555555555",
        releaseDate: "2026-01-24",
        status: "Failed",
        errorCode: "ARTWORK_RESOLUTION",
        errorMessage: "Cover artwork resolution too low (1200x1200, minimum 3000x3000)",
      },
    ],
    timeline: [
      { time: "2 hours ago", event: "Automatic retry scheduled for 6:00 PM EST", type: "info" },
      { time: "3 hours ago", event: "Delivery failed - metadata validation error", type: "error" },
      { time: "5 hours ago", event: "Delivery initiated to Spotify", type: "success" },
      { time: "6 hours ago", event: "Release approved for distribution", type: "success" },
    ],
    recommendations: [
      "Review and correct track duration metadata to match actual audio length",
      "Re-export audio files to remove clipping issues",
      "Upload high-resolution artwork (minimum 3000x3000 pixels)",
      "Contact Spotify support if issues persist after corrections",
    ],
  },
  "metadata-rejected": {
    title: "Metadata Rejected",
    severity: "critical",
    icon: AlertCircle,
    color: "text-[#ff0050]",
    bgColor: "bg-[#ff0050]/10",
    borderColor: "border-[#ff0050]/20",
    description: "Apple Music rejected 2 releases for invalid ISRC codes",
    affectedReleases: [
      {
        title: "Paradise Lost - Album",
        artist: "Echo Chamber",
        upc: "1111222233334",
        releaseDate: "2026-01-25",
        status: "Rejected",
        errorCode: "ISRC_INVALID",
        errorMessage: "Track 2 ISRC code format invalid: USRC17607839 (should be 12 characters)",
      },
      {
        title: "Cosmic Journey - EP",
        artist: "Star Gazers",
        upc: "4444333322221",
        releaseDate: "2026-01-26",
        status: "Rejected",
        errorCode: "ISRC_DUPLICATE",
        errorMessage: "Track 4 ISRC already exists in catalog for different recording",
      },
    ],
    timeline: [
      { time: "1 hour ago", event: "Support ticket created automatically", type: "info" },
      { time: "3 hours ago", event: "Metadata rejected by Apple Music", type: "error" },
      { time: "6 hours ago", event: "Metadata submitted for validation", type: "success" },
      { time: "8 hours ago", event: "Release metadata uploaded", type: "success" },
    ],
    recommendations: [
      "Verify all ISRC codes are exactly 12 characters (CC-XXX-YY-NNNNN format)",
      "Check for duplicate ISRC usage across your catalog",
      "Generate new ISRC codes if needed through your ISRC manager",
      "Resubmit corrected metadata within 48 hours to maintain release date",
    ],
  },
  "copyright-conflict": {
    title: "Copyright Conflict",
    severity: "warning",
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    description: "2 tracks flagged in audio recognition",
    affectedReleases: [
      {
        title: "Remix Collection Vol. 1",
        artist: "DJ Mixmaster",
        upc: "7777888899990",
        releaseDate: "2026-01-18",
        status: "Flagged",
        errorCode: "CONTENT_ID_MATCH",
        errorMessage: "Track 1 matches copyrighted content: 'Original Song' by Artist X (87% match)",
      },
      {
        title: "Sample Pack Sessions",
        artist: "Beat Makers",
        upc: "0000111122223",
        releaseDate: "2026-01-19",
        status: "Flagged",
        errorCode: "CONTENT_ID_MATCH",
        errorMessage: "Track 3 contains uncleared sample from 'Classic Track' (65% match)",
      },
    ],
    timeline: [
      { time: "30 minutes ago", event: "Legal team notified for review", type: "info" },
      { time: "2 hours ago", event: "Audio recognition system flagged content", type: "warning" },
      { time: "1 day ago", event: "Content uploaded to distribution network", type: "success" },
    ],
    recommendations: [
      "Provide documentation of sample clearances and licenses",
      "Contact original rights holders for permission if not obtained",
      "Consider removing flagged tracks or obtaining proper licensing",
      "Review audio recognition report for false positives",
    ],
  },
  "quality-warning": {
    title: "Quality Check Warning",
    severity: "warning",
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    description: "4 audio files below recommended quality standards",
    affectedReleases: [
      {
        title: "Lo-Fi Beats Collection",
        artist: "Chill Vibes",
        upc: "3333444455556",
        releaseDate: "2026-01-28",
        status: "Warning",
        errorCode: "BITRATE_LOW",
        errorMessage: "Track 1 bitrate is 128kbps (recommended: 320kbps or higher)",
      },
      {
        title: "Acoustic Sessions",
        artist: "Folk Ensemble",
        upc: "6666777788889",
        releaseDate: "2026-01-29",
        status: "Warning",
        errorCode: "SAMPLE_RATE_LOW",
        errorMessage: "Track 2 sample rate is 22kHz (recommended: 44.1kHz or 48kHz)",
      },
      {
        title: "Live Concert Recording",
        artist: "Rock Band",
        upc: "9999000011112",
        releaseDate: "2026-01-30",
        status: "Warning",
        errorCode: "DYNAMIC_RANGE_LOW",
        errorMessage: "Track 1 has excessive compression (DR4, recommended: DR7+)",
      },
      {
        title: "Electronic Experiments",
        artist: "Synth Wave",
        upc: "2222333344445",
        releaseDate: "2026-02-01",
        status: "Warning",
        errorCode: "NOISE_FLOOR_HIGH",
        errorMessage: "Track 3 contains high background noise levels",
      },
    ],
    timeline: [
      { time: "1 hour ago", event: "Quality report generated and sent to artist", type: "info" },
      { time: "4 hours ago", event: "Automated quality analysis completed", type: "warning" },
      { time: "6 hours ago", event: "Audio files uploaded for processing", type: "success" },
    ],
    recommendations: [
      "Re-export audio at higher bitrate (320kbps MP3 or 16/24-bit WAV)",
      "Use proper sample rates (44.1kHz for CD quality, 48kHz for digital)",
      "Avoid over-compression to maintain dynamic range",
      "Apply noise reduction in mastering process if needed",
    ],
  },
  "pending-approval": {
    title: "Pending Approval",
    severity: "caution",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    description: "12 releases awaiting legal approval",
    affectedReleases: [
      {
        title: "Greatest Hits Compilation",
        artist: "Various Artists",
        upc: "1212121212121",
        releaseDate: "2026-02-05",
        status: "Pending Legal",
        errorCode: "LEGAL_REVIEW_REQUIRED",
        errorMessage: "Compilation requires additional rights clearance verification",
      },
      {
        title: "Cover Songs Album",
        artist: "Tribute Band",
        upc: "3434343434343",
        releaseDate: "2026-02-08",
        status: "Pending Legal",
        errorCode: "MECHANICAL_LICENSE_PENDING",
        errorMessage: "Awaiting mechanical license confirmation for 8 tracks",
      },
    ],
    timeline: [
      { time: "2 days ago", event: "Submitted to legal team for review", type: "info" },
      { time: "3 days ago", event: "Flagged for legal approval requirement", type: "warning" },
      { time: "4 days ago", event: "Release metadata submitted", type: "success" },
    ],
    recommendations: [
      "Provide all relevant licensing documentation to legal team",
      "Follow up with legal department for status updates",
      "Ensure all mechanical licenses are secured before approval",
      "Allow 3-5 business days for legal review process",
    ],
  },
  "contract-expiring": {
    title: "Contract Expiring Soon",
    severity: "caution",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    description: "5 artist contracts expire within 30 days",
    affectedReleases: [
      {
        title: "The Waves - Distribution Agreement",
        artist: "The Waves",
        upc: "N/A",
        releaseDate: "2026-02-15",
        status: "Expiring",
        errorCode: "CONTRACT_EXPIRING",
        errorMessage: "Distribution contract expires in 21 days",
      },
      {
        title: "Neon City - Publishing Deal",
        artist: "Neon City",
        upc: "N/A",
        releaseDate: "2026-02-20",
        status: "Expiring",
        errorCode: "CONTRACT_EXPIRING",
        errorMessage: "Publishing agreement expires in 26 days",
      },
    ],
    timeline: [
      { time: "1 day ago", event: "Automated renewal reminder sent to artist", type: "info" },
      { time: "7 days ago", event: "Contract expiration warning triggered", type: "warning" },
      { time: "30 days ago", event: "Contract status reviewed", type: "success" },
    ],
    recommendations: [
      "Contact artists immediately to discuss renewal terms",
      "Prepare new contract agreements for review",
      "Schedule meetings with legal and artist management",
      "Update contract terms and negotiate new rates if needed",
    ],
  },
  "missing-artwork": {
    title: "Missing Artwork",
    severity: "info",
    icon: AlertCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "6 releases missing required cover artwork",
    affectedReleases: [
      {
        title: "Untitled Album",
        artist: "New Artist",
        upc: "5656565656565",
        releaseDate: "2026-02-10",
        status: "Incomplete",
        errorCode: "ARTWORK_MISSING",
        errorMessage: "No cover artwork uploaded",
      },
      {
        title: "Demo Tracks EP",
        artist: "Unsigned Band",
        upc: "7878787878787",
        releaseDate: "2026-02-12",
        status: "Incomplete",
        errorCode: "ARTWORK_MISSING",
        errorMessage: "Cover artwork required for distribution",
      },
    ],
    timeline: [
      { time: "3 hours ago", event: "Reminder email sent to artist", type: "info" },
      { time: "2 days ago", event: "Artwork upload deadline approaching", type: "warning" },
      { time: "5 days ago", event: "Release created without artwork", type: "success" },
    ],
    recommendations: [
      "Upload high-resolution cover artwork (minimum 3000x3000 pixels)",
      "Ensure artwork meets platform requirements (RGB, JPG/PNG)",
      "Include all required text and artist/album information",
      "Avoid copyrighted images or inappropriate content",
    ],
  },
  "payment-issues": {
    title: "Payment Issues",
    severity: "important",
    icon: DollarSign,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "3 artists have unresolved payment disputes",
    affectedReleases: [
      {
        title: "Echo Chamber - Royalty Dispute",
        artist: "Echo Chamber",
        upc: "N/A",
        releaseDate: "N/A",
        status: "Disputed",
        errorCode: "PAYMENT_DISCREPANCY",
        errorMessage: "Artist claims underpayment of $2,450 for Q4 2025 streams",
      },
      {
        title: "Coast Collective - Split Dispute",
        artist: "Coast Collective",
        upc: "N/A",
        releaseDate: "N/A",
        status: "Disputed",
        errorCode: "SPLIT_CONFLICT",
        errorMessage: "Multiple collaborators disputing revenue split percentages",
      },
    ],
    timeline: [
      { time: "1 day ago", event: "Finance team assigned to investigate", type: "info" },
      { time: "3 days ago", event: "Dispute formally filed by artist", type: "warning" },
      { time: "1 week ago", event: "Royalty statement issued", type: "success" },
    ],
    recommendations: [
      "Review royalty calculations and payment history",
      "Schedule call with finance team and artist to resolve",
      "Provide detailed breakdown of revenue splits",
      "Issue corrected payment if discrepancy found",
    ],
  },
};

export function AlertDetailsView({ alertType, onBack }: AlertDetailsViewProps) {
  const alert = alertDetails[alertType as keyof typeof alertDetails];
  
  if (!alert) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <p>Alert not found</p>
      </div>
    );
  }

  const Icon = alert.icon;
  const severityBadgeVariant = alert.severity === "critical" ? "destructive" : "secondary";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-start gap-4">
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0", alert.bgColor, alert.borderColor, "border")}>
            <Icon className={cn("h-6 w-6", alert.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-semibold tracking-tight">{alert.title}</h1>
              <Badge variant={severityBadgeVariant} className={alert.severity === "critical" ? "bg-[#ff0050]" : ""}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">{alert.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
              Resolve All
            </Button>
          </div>
        </div>
      </div>

      {/* Affected Releases */}
      <Card>
        <CardHeader>
          <CardTitle>Affected Releases ({alert.affectedReleases.length})</CardTitle>
          <CardDescription>Releases impacted by this alert</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alert.affectedReleases.map((release, index) => (
              <div key={index} className={cn("p-4 rounded-lg border", alert.borderColor, alert.bgColor)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Music className={cn("h-4 w-4", alert.color)} />
                      <h3 className="font-semibold">{release.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {release.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {release.artist}
                      </span>
                      {release.upc !== "N/A" && (
                        <span>UPC: {release.upc}</span>
                      )}
                      {release.releaseDate !== "N/A" && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {release.releaseDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Release
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className={cn("h-4 w-4 mt-0.5 flex-shrink-0", alert.color)} />
                    <div>
                      <p className="text-sm font-medium">{release.errorCode}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{release.errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Event history for this alert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alert.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {event.type === "success" && (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                    {event.type === "error" && (
                      <div className="h-2 w-2 rounded-full bg-[#ff0050]" />
                    )}
                    {event.type === "warning" && (
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                    )}
                    {event.type === "info" && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Steps to resolve this alert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alert.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-[#ff0050] text-white flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Need Help?</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common actions for this type of alert</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
            <Button variant="outline" className="justify-start">
              <XCircle className="h-4 w-4 mr-2" />
              Dismiss Alert
            </Button>
            <Button variant="outline" className="justify-start">
              <User className="h-4 w-4 mr-2" />
              Assign to Team Member
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Create Support Ticket
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Error Logs
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
