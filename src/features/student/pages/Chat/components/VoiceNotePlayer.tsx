import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Mic } from "lucide-react";

interface VoiceNotePlayerProps {
  src: string;
  isMine: boolean;
  duration?: number;
  messageId?: string;
}

export default function VoiceNotePlayer({
  src,
  isMine,
  duration: initialDuration,
  messageId = "voice-note",
}: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isSeeking, setIsSeeking] = useState(false);

  // Generate deterministic waveform pattern (32 bars)
  const waveformBars = useMemo(() => {
    let hash = 0;
    const seed = src + messageId;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const bars: number[] = [];
    for (let i = 0; i < 32; i++) {
      const pseudoRandom = Math.abs(Math.sin(hash + i * 17.13));
      // range 20% to 100%
      const heightPercent = Math.max(20, Math.floor(pseudoRandom * 100));
      bars.push(heightPercent);
    }
    return bars;
  }, [src, messageId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isSeeking]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback failed:", err);
        });
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSeek = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!waveformRef.current || !audioRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickPosition = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = clickPosition / rect.width;
    const targetDuration = duration || audioRef.current.duration || initialDuration || 0;
    const newTime = percentage * targetDuration;

    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0 || !isFinite(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const effectiveDuration = duration || initialDuration || 0;
  const progressPercent =
    effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 py-1 w-full min-w-[230px] max-w-[300px] select-none">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* WhatsApp style Avatar / Mic Badge */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
            isMine
              ? "bg-white/20 text-white"
              : "bg-emerald-100 dark:bg-emerald-950 text-blue-600 dark:text-blue-400"
          }`}
        >
          <Mic size={18} />
        </div>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
            isMine
              ? "bg-blue-400 border-blue-600"
              : "bg-blue-500 border-[#F3F4F6] dark:border-slate-800"
          }`}
        />
      </div>

      {/* Main Controls & Waveform */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Play / Pause button */}
          <button
            type="button"
            onClick={togglePlayPause}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 ${
              isMine
                ? "bg-white text-blue-700 hover:bg-blue-50 shadow"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow shadow-blue-500/20"
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={16} className="fill-current" />
            ) : (
              <Play size={16} className="fill-current ml-0.5" />
            )}
          </button>

          {/* Interactive Waveform Track */}
          <div
            ref={waveformRef}
            onClick={handleSeek}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            onTouchStart={() => setIsSeeking(true)}
            onTouchEnd={() => setIsSeeking(false)}
            className="flex-1 h-7 flex items-center gap-[2.5px] cursor-pointer group py-1"
            title="Click to seek"
          >
            {waveformBars.map((heightPercent, index) => {
              const barPercent = (index / waveformBars.length) * 100;
              const isPlayed = barPercent <= progressPercent;

              return (
                <div
                  key={index}
                  style={{ height: `${heightPercent}%` }}
                  className={`w-[3px] rounded-full transition-all duration-100 ${
                    isPlayed
                      ? isMine
                        ? "bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]"
                        : "bg-blue-500 dark:bg-blue-400 shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                      : isMine
                      ? "bg-white/35 group-hover:bg-white/55"
                      : "bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Footer info: Time elapsed/duration & Playback Speed button */}
        <div className="flex items-center justify-between text-[11px] font-medium px-0.5">
          <span
            className={
              isMine
                ? "text-blue-100 font-mono"
                : "text-slate-500 dark:text-slate-400 font-mono"
            }
          >
            {isPlaying || currentTime > 0
              ? formatTime(currentTime)
              : formatTime(effectiveDuration)}
          </span>

          {/* Speed Toggle Button */}
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
              isMine
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200"
            }`}
            title="Playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}
