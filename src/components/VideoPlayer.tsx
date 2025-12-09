import React, { useRef, useEffect } from "react";
import {
    Pause,
    Play,
    Volume2,
    VolumeX,
    Maximize2,
} from "lucide-react";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
    isPlaying: boolean;
    volume: number;
    playbackRate: number;
    currentTime: number;
    duration: number;
    captionsEnabled: boolean;
    onPlayPause: () => void;
    onVolumeChange: (value: number) => void;
    onSpeedChange: (value: number) => void;
    onSeek: (value: number) => void;
    onToggleCaptions: () => void;
    onFullscreen: () => void;
    onTimeUpdate: (currentTime: number, duration: number) => void;
    onLoadedMetadata: (duration: number) => void;
    onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    className = "",
    isPlaying,
    volume,
    playbackRate,
    currentTime,
    duration,
    captionsEnabled,
    onPlayPause,
    onVolumeChange,
    onSpeedChange,
    onSeek,
    onToggleCaptions,
    onFullscreen,
    onTimeUpdate,
    onLoadedMetadata,
    onEnded,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(e => console.error("Error playing video:", e));
        } else {
            video.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = volume;
    }, [volume]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = playbackRate;
    }, [playbackRate]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const track = video.textTracks?.[0];
        if (track) {
            track.mode = captionsEnabled ? "showing" : "disabled";
        }
    }, [captionsEnabled]);

    // Sync external currentTime change (seeking)
    // We need to be careful not to create a loop. 
    // Usually, we only set video.currentTime if the difference is significant
    // or if it's a seek action. 
    // For simplicity, we'll rely on the parent calling onSeek which updates state,
    // and we might need to expose a ref or method to seek.
    // However, in the original code, `handleSeek` updated `video.currentTime` directly.
    // Here, we'll assume the parent handles state and we might need a way to seek.
    // Actually, the best way is to expose the seek function or handle it via a prop change if we want controlled component.
    // But `currentTime` prop is constantly updating as video plays.
    // So we should only set video.currentTime if the prop change is NOT from the timeupdate event.
    // This is tricky. 
    // A better approach for the player is to handle the video ref internally and expose callbacks.
    // But to keep it simple and match the extraction:

    // We will handle seeking via a specific effect if needed, OR just let the parent handle the logic 
    // and we just provide the UI and event listeners.
    // But the parent `handleSeek` in original code did `video.currentTime = value`.
    // So we should probably pass the ref or expose a method.
    // Alternatively, we can watch `currentTime` but that will cause jitters.

    // Let's stick to the original logic: The parent had `videoRef`.
    // We can forward the ref or keep the ref here and expose imperative handle.
    // Or simpler: Just keep the ref here and use `useEffect` to sync ONLY when `currentTime` changes significantly 
    // from `video.currentTime` (which implies a seek).

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (Math.abs(video.currentTime - currentTime) > 0.5) {
            video.currentTime = currentTime;
        }
    }, [currentTime]);


    const formatTime = (value: number) => {
        if (!Number.isFinite(value)) return "00:00";
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <div className={`bg-white border border-gray-200 shadow-md overflow-hidden flex-1 flex flex-col rounded-xl ${className}`}>
            <div className="bg-[#0E1940] flex-1 relative group">
                <video
                    ref={videoRef}
                    className="w-full h-full min-h-[320px] md:min-h-[480px] bg-black object-cover"
                    src={src}
                    poster={poster}
                    onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
                    onLoadedMetadata={(e) => onLoadedMetadata(e.currentTarget.duration)}
                    onEnded={onEnded}
                    onClick={onPlayPause}
                >
                    <track
                        default
                        kind="subtitles"
                        src="https://www.w3schools.com/tags/movie.vtt"
                        srcLang="en"
                        label="English"
                    />
                </video>

                {/* Overlay Play Button (optional, for better UX) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition cursor-pointer" onClick={onPlayPause}>
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition">
                            <Play size={32} className="text-white ml-1" fill="white" />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-900 p-3">
                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={onPlayPause}
                        className="h-10 w-10 rounded bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    {/* Current Time */}
                    <div className="text-white text-sm font-medium min-w-[45px]">
                        {formatTime(currentTime)}
                    </div>

                    {/* Progress Bar */}
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => onSeek(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                        style={{
                            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                        }}
                    />

                    {/* Total Duration */}
                    <div className="text-white text-sm font-medium min-w-[45px]">
                        {formatTime(duration)}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 group relative">
                        <button
                            onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
                            className="text-white hover:text-gray-300 transition"
                        >
                            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={volume}
                                onChange={(e) => onVolumeChange(Number(e.target.value))}
                                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    </div>

                    {/* Speed Control */}
                    <div className="relative">
                        <select
                            value={playbackRate}
                            onChange={(e) => onSpeedChange(Number(e.target.value))}
                            className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD] appearance-none cursor-pointer"
                        >
                            {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <option key={rate} value={rate} className="bg-gray-800">
                                    {rate}x
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Captions Toggle */}
                    <button
                        onClick={onToggleCaptions}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${captionsEnabled
                                ? "bg-white text-[#0E1940]"
                                : "bg-gray-800 text-white border border-gray-600"
                            }`}
                    >
                        CC
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        onClick={onFullscreen}
                        className="text-white hover:text-gray-300 transition"
                    >
                        <Maximize2 size={18} color="#FFFFFF" />
                    </button>
                </div>
            </div>
        </div>
    );
};
