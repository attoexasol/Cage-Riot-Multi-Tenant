import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import {
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";

interface AudioPlayerProps {
  title: string;
  artist: string;
  audioUrl: string;
  artwork?: string;
  onClose?: () => void;
}

export function AudioPlayer({ title, artist, audioUrl, artwork, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleDownload = () => {
    // Simulate download
    toast.success("Download started!");
    // In production, this would trigger an actual download
    // window.open(audioUrl, '_blank');
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-[#ff0050]/20 bg-card/95 backdrop-blur">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Artwork */}
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {artwork || "🎵"}
          </div>

          {/* Player Controls */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-muted-foreground truncate">{artist}</p>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050]" />
                ) : (
                  <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050]" />
                )}
              </Button>

              <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 text-right flex-shrink-0">
                {formatTime(currentTime)}
              </span>

              <div className="flex-1 min-w-0 py-2 sm:py-0">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 sm:[&_[role=slider]]:h-3 sm:[&_[role=slider]]:w-3 [&_.slider-track]:h-2 sm:[&_.slider-track]:h-1.5 [&_.slider-range]:bg-[#ff0050] [&_.slider-track]:bg-muted"
                />
              </div>

              <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 flex-shrink-0">
                {formatTime(duration)}
              </span>

              {/* Volume - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              {/* Download */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 ml-1 sm:ml-2 flex-shrink-0"
                onClick={handleDownload}
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ff0050]" />
              </Button>
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl} />
      </CardContent>
    </Card>
  );
}