import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Link2,
  ExternalLink,
  Sparkles,
  Share2,
  QrCode,
  Calendar,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// Official Brand Logo SVG Components
const SpotifyLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#1DB954"/>
    <path d="M17.0001 10.8001C13.6001 8.8001 8.8001 8.6001 6.2001 9.6001C5.8001 9.8001 5.4001 9.6001 5.2001 9.2001C5.0001 8.8001 5.2001 8.4001 5.6001 8.2001C8.6001 7.0001 13.8001 7.2001 17.6001 9.4001C18.0001 9.6001 18.1001 10.1001 17.9001 10.5001C17.7001 10.8001 17.3001 11.0001 17.0001 10.8001ZM16.9001 13.8001C16.7001 14.1001 16.3001 14.2001 16.0001 14.0001C13.2001 12.4001 9.2001 11.9001 6.6001 12.9001C6.3001 13.0001 5.9001 12.8001 5.8001 12.5001C5.7001 12.2001 5.9001 11.8001 6.2001 11.7001C9.2001 10.6001 13.6001 11.1001 16.7001 12.9001C17.1001 13.1001 17.2001 13.5001 16.9001 13.8001ZM15.9001 16.7001C15.7001 16.9001 15.4001 17.0001 15.2001 16.8001C12.7001 15.4001 9.6001 15.1001 6.7001 15.9001C6.4001 16.0001 6.1001 15.8001 6.0001 15.5001C5.9001 15.2001 6.1001 14.9001 6.4001 14.8001C9.6001 13.9001 13.0001 14.3001 15.8001 15.8001C16.1001 16.0001 16.2001 16.4001 15.9001 16.7001Z" fill="white"/>
  </svg>
);

const AppleMusicLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#FA243C"/>
    <path d="M18.5 5.5V15.5C18.5 17.433 16.933 19 15 19C13.067 19 11.5 17.433 11.5 15.5C11.5 13.567 13.067 12 15 12C15.5 12 16 12.1 16.5 12.3V8.5L10.5 10V17.5C10.5 19.433 8.933 21 7 21C5.067 21 3.5 19.433 3.5 17.5C3.5 15.567 5.067 14 7 14C7.5 14 8 14.1 8.5 14.3V8.5L18.5 5.5Z" fill="white"/>
  </svg>
);

const AmazonMusicLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#232F3E"/>
    <path d="M18.9 17.5C18.9 17.7 18.7 17.8 18.5 17.7C16.9 16.5 16.6 16.1 16 15.2C14.3 16.9 13.1 17.4 10.9 17.4C8.5 17.4 6.6 15.9 6.6 13.1C6.6 10.9 7.8 9.4 9.5 8.7C11 8.1 13.1 8 15.1 7.8V7.4C15.1 6.7 15.2 5.9 14.7 5.3C14.3 4.8 13.5 4.6 12.9 4.6C11.8 4.6 10.8 5.1 10.6 6.3C10.5 6.6 10.3 6.9 10 6.9L7.7 6.6C7.4 6.5 7.2 6.3 7.3 5.9C7.9 3.2 10.3 2 12.5 2C13.7 2 15.3 2.3 16.4 3.3C17.8 4.4 17.6 6 17.6 7.8V12.2C17.6 13.5 18.1 14.1 18.6 14.9C18.7 15.1 18.8 15.3 18.5 15.5L18.9 17.5Z" fill="#FF9900"/>
    <path d="M15.1 11.1V10.5C12.3 10.5 9.4 11.1 9.4 14.2C9.4 15.6 10.2 16.5 11.5 16.5C12.4 16.5 13.2 16 13.7 15.2C14.4 14.2 14.3 13.2 14.3 12.2L15.1 11.1Z" fill="#FF9900"/>
    <path d="M19.5 20.2C17.4 21.8 14.4 22.5 11.8 22.5C8.2 22.5 5 21.1 2.6 18.9C2.4 18.7 2.6 18.5 2.8 18.6C5.4 20.1 8.5 21 11.7 21C13.9 21 16.3 20.5 18.5 19.6C18.9 19.4 19.2 19.8 19.5 20.2Z" fill="#FF9900"/>
    <path d="M20.4 19.1C20.1 18.7 18.5 18.9 17.8 19C17.6 19 17.6 18.8 17.8 18.7C19 17.7 21 18 21.2 18.3C21.4 18.6 21.1 20.6 20.1 21.7C19.9 21.9 19.7 21.8 19.8 21.6C20.1 20.8 20.7 19.5 20.4 19.1Z" fill="#FF9900"/>
  </svg>
);

const DeezerLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#181818"/>
    <g fill="#FEAA2D">
      <rect x="4" y="14" width="3" height="2" rx="0.5"/>
      <rect x="4" y="17" width="3" height="2" rx="0.5"/>
      <rect x="8" y="11" width="3" height="2" rx="0.5"/>
      <rect x="8" y="14" width="3" height="2" rx="0.5"/>
      <rect x="8" y="17" width="3" height="2" rx="0.5"/>
      <rect x="12" y="8" width="3" height="2" rx="0.5"/>
      <rect x="12" y="11" width="3" height="2" rx="0.5"/>
      <rect x="12" y="14" width="3" height="2" rx="0.5"/>
      <rect x="12" y="17" width="3" height="2" rx="0.5"/>
      <rect x="16" y="5" width="3" height="2" rx="0.5"/>
      <rect x="16" y="8" width="3" height="2" rx="0.5"/>
      <rect x="16" y="11" width="3" height="2" rx="0.5"/>
      <rect x="16" y="14" width="3" height="2" rx="0.5"/>
      <rect x="16" y="17" width="3" height="2" rx="0.5"/>
    </g>
  </svg>
);

// Platform Logo Component Mapper
const PlatformLogo = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "spotify":
      return <SpotifyLogo />;
    case "appleMusic":
      return <AppleMusicLogo />;
    case "amazon":
      return <AmazonMusicLogo />;
    case "deezer":
      return <DeezerLogo />;
    default:
      return null;
  }
};

interface MarketingFieldsProps {
  releaseId?: string;
  onSave?: (data: MarketingData) => void;
}

interface MarketingData {
  presaveLinks: {
    spotify?: string;
    appleMusic?: string;
    amazon?: string;
    deezer?: string;
  };
  smartLink?: string;
  smartLinkProvider?: "feature.fm" | "linkfire" | "toneden" | "custom";
  campaignId?: string;
  promotionStartDate?: string;
  promotionEndDate?: string;
  targetAudience?: string;
  marketingNotes?: string;
}

const SMARTLINK_PROVIDERS = [
  { value: "feature.fm", label: "Feature.fm", color: "bg-purple-500" },
  { value: "linkfire", label: "Linkfire", color: "bg-orange-500" },
  { value: "toneden", label: "ToneDen", color: "bg-blue-500" },
  { value: "custom", label: "Custom URL", color: "bg-gray-500" },
];

const PRESAVE_PLATFORMS = [
  { 
    key: "spotify", 
    label: "Spotify", 
    color: "bg-green-500", 
    icon: "https://cdn.simpleicons.org/spotify/1DB954" 
  },
  { 
    key: "appleMusic", 
    label: "Apple Music", 
    color: "bg-red-500", 
    icon: "https://cdn.simpleicons.org/applemusic/FA243C" 
  },
  { 
    key: "amazon", 
    label: "Amazon Music", 
    color: "bg-blue-500", 
    icon: "https://cdn.simpleicons.org/amazonmusic/1DB954" 
  },
  { 
    key: "deezer", 
    label: "Deezer", 
    color: "bg-purple-500", 
    icon: "https://cdn.simpleicons.org/deezer/FEAA2D" 
  },
];

export function MarketingFields({ releaseId, onSave }: MarketingFieldsProps) {
  const [data, setData] = useState<MarketingData>({
    presaveLinks: {
      spotify: "https://spotify.link/presave/abc123",
      appleMusic: "",
      amazon: "",
      deezer: "",
    },
    smartLink: "https://feature.fm/thewaves/summer-nights",
    smartLinkProvider: "feature.fm",
    campaignId: "CAMP-2026-001",
    promotionStartDate: "2026-01-15",
    promotionEndDate: "2026-02-28",
    targetAudience: "Electronic music fans, 18-34, US/UK/CA",
    marketingNotes: "Social media campaign launching 2 weeks before release",
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    onSave?.(data);
    toast.success("Marketing settings saved successfully!");
  };

  const updatePresaveLink = (platform: string, value: string) => {
    setData({
      ...data,
      presaveLinks: {
        ...data.presaveLinks,
        [platform]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#ff0050]" />
          Marketing & Promotion
        </CardTitle>
        <CardDescription>
          Set up pre-save links, smart links, and campaign tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-3.5 sm:px-6">
        {/* Smart Link Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#ff0050]" />
            <h4 className="font-semibold">Smart Link</h4>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              Recommended
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            One link for all streaming platforms - perfect for social media
          </p>

          <div className="p-3 sm:p-4 md:p-5 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                <select
                  value={data.smartLinkProvider}
                  onChange={(e) =>
                    setData({ ...data, smartLinkProvider: e.target.value as MarketingData["smartLinkProvider"] })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 rounded-lg border bg-background hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] text-sm"
                >
                  {SMARTLINK_PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Smart Link URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={data.smartLink}
                    onChange={(e) => setData({ ...data, smartLink: e.target.value })}
                    placeholder="https://smarturl.it/yoursong"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                  />
                  {data.smartLink && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(data.smartLink!, "smartLink")}
                        className="hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600 transition-colors flex-shrink-0"
                      >
                        {copiedField === "smartLink" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(data.smartLink, "_blank")}
                        className="hover:bg-[#ff0050]/10 hover:border-[#ff0050]/50 hover:text-[#ff0050] transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Link Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 sm:p-4 rounded-lg border bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm font-semibold">Click Tracking</p>
                </div>
                <p className="text-xs text-muted-foreground">Track engagement metrics</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg border bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <Share2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p className="text-sm font-semibold">Social Sharing</p>
                </div>
                <p className="text-xs text-muted-foreground">Easy social media posts</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg border bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <QrCode className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <p className="text-sm font-semibold">QR Code</p>
                </div>
                <p className="text-xs text-muted-foreground">Generate QR codes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Save Links Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#ff0050]" />
            <h4 className="font-semibold">Pre-Save Links</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Platform-specific pre-save/pre-add links for upcoming releases
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESAVE_PLATFORMS.map((platform) => (
              <div 
                key={platform.key} 
                className="p-5 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-[#ff0050]/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <PlatformLogo platform={platform.key} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">{platform.label}</h5>
                    <p className="text-xs text-muted-foreground">Pre-save campaign link</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="url"
                    value={data.presaveLinks[platform.key as keyof typeof data.presaveLinks] || ""}
                    onChange={(e) => updatePresaveLink(platform.key, e.target.value)}
                    placeholder={`https://${platform.key}.link/presave/...`}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050]"
                  />
                  {data.presaveLinks[platform.key as keyof typeof data.presaveLinks] && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            data.presaveLinks[platform.key as keyof typeof data.presaveLinks]!,
                            `presave-${platform.key}`
                          )
                        }
                        className="flex-1 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600 transition-colors"
                      >
                        {copiedField === `presave-${platform.key}` ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            data.presaveLinks[platform.key as keyof typeof data.presaveLinks],
                            "_blank"
                          )
                        }
                        className="hover:bg-[#ff0050]/10 hover:border-[#ff0050]/50 hover:text-[#ff0050] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#ff0050]" />
            <h4 className="font-semibold">Campaign Details</h4>
          </div>

          <div className="p-5 rounded-xl border bg-card/50 backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Campaign ID</label>
                <input
                  type="text"
                  value={data.campaignId}
                  onChange={(e) => setData({ ...data, campaignId: e.target.value })}
                  placeholder="CAMP-2026-001"
                  className="w-full px-4 py-2.5 rounded-lg border bg-background hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050]"
                />
                <p className="text-xs text-muted-foreground">
                  Internal tracking ID for analytics
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Target Audience</label>
                <input
                  type="text"
                  value={data.targetAudience}
                  onChange={(e) => setData({ ...data, targetAudience: e.target.value })}
                  placeholder="Electronic music fans, 18-34, US/UK/CA"
                  className="w-full px-4 py-2.5 rounded-lg border bg-background hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050]"
                />
                <p className="text-xs text-muted-foreground">
                  Demographics and interests
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Promotion Start Date</label>
                <input
                  type="date"
                  value={data.promotionStartDate}
                  onChange={(e) => setData({ ...data, promotionStartDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Promotion End Date</label>
                <input
                  type="date"
                  value={data.promotionEndDate}
                  onChange={(e) => setData({ ...data, promotionEndDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Marketing Notes</label>
              <textarea
                value={data.marketingNotes}
                onChange={(e) => setData({ ...data, marketingNotes: e.target.value })}
                placeholder="Social media campaign details, influencer partnerships, etc..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none hover:border-[#ff0050]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050]"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Pro Tip: Start Marketing Early
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Launch pre-save campaigns 2-4 weeks before release date for maximum impact.
                Smart links can track conversion rates and help optimize your promotion strategy.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" size="lg">
          Save Marketing Settings
        </Button>
      </CardContent>
    </Card>
  );
}