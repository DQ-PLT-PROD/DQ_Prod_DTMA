import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText } from "lucide-react";
import { AudienceFitIndicator } from "../AudienceFitIndicator";

interface ScheduleTabProps {
  item: any;
  audienceLevel?: string;
  onDurationCalculated?: (duration: string) => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ item, audienceLevel, onDurationCalculated }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [lessonDurations, setLessonDurations] = useState<Record<number, string>>({});
  const [totalDurationFormatted, setTotalDurationFormatted] = useState<string>("");

  // Get application process / lessons data
  const applicationProcess = useMemo(() => {
    return Array.isArray(item?.applicationProcess) ? item.applicationProcess : [];
  }, [item?.applicationProcess]);

  // Preload video durations from actual video metadata (same methodology as learning page)
  useEffect(() => {
    if (applicationProcess.length === 0) return;

    const fetchVideoDuration = (videoUrl: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const timeout = setTimeout(() => {
          video.src = '';
          reject(new Error('Timeout loading video metadata'));
        }, 10000);

        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve(video.duration);
          video.src = '';
        };
        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load video'));
        };
        video.src = videoUrl;
      });
    };

    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const formatTotalDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) return `${hours} hr ${minutes} min`;
      return `${minutes} min`;
    };

    const preloadAllDurations = async () => {
      const durations: Record<number, string> = {};
      let totalSeconds = 0;
      let hasCalculatedDuration = false;

      await Promise.allSettled(
        applicationProcess.map(async (step: any, index: number) => {
          if (step?.videoUrl) {
            try {
              const durationSeconds = await fetchVideoDuration(step.videoUrl);
              durations[index] = formatDuration(durationSeconds);
              totalSeconds += durationSeconds;
              hasCalculatedDuration = true;
            } catch {
              // Keep DB fallback if fetch fails
              // Try to parse DB duration if available to add to total
              if (step.estimatedDurationMinutes) {
                totalSeconds += step.estimatedDurationMinutes * 60;
              }
            }
          } else if (step?.estimatedDurationMinutes) {
            totalSeconds += step.estimatedDurationMinutes * 60;
          }
        })
      );

      setLessonDurations(durations);
      if (totalSeconds > 0) {
        const formattedTotal = formatTotalDuration(totalSeconds);
        setTotalDurationFormatted(formattedTotal);
        onDurationCalculated?.(formattedTotal);
      }
    };

    preloadAllDurations();
  }, [applicationProcess]);

  const steps: Array<{ title: string; description?: string; duration?: string; type?: 'video' | 'reading'; originalType?: string }> = useMemo(() => {
    return applicationProcess
      .map((s: any, idx: number) => ({
        title: s?.title || (typeof s?.week === "number" ? `Week ${s.week}` : ""),
        description: typeof s?.description === "string" ? s.description : "",
        duration: lessonDurations[idx] || (s?.estimatedDurationMinutes
          ? `${s.estimatedDurationMinutes} min`
          : undefined),
        type: 'video' as const,
        originalType: s?.type
      }))
      .filter((s) => s.title);
  }, [applicationProcess, lessonDurations]);

  const displayLessonCount = useMemo(() => {
    return applicationProcess.filter((l: any) => l.type !== 'intro' && l.type !== 'outro').length;
  }, [applicationProcess]);

  const toggleStep = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {audienceLevel && (
        <AudienceFitIndicator audienceLevel={audienceLevel} />
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Course Outline</h3>
        <div className="text-sm text-gray-500 font-medium">
          {displayLessonCount || item.lessonCount} Lessons • {totalDurationFormatted || item.duration || "N/A"}
        </div>
      </div>

      <div className="space-y-4">
        {steps.length > 0 ? (
          steps.map((s, idx) => (
            <div
              key={idx}
              className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ${openIndex === idx ? 'ring-2 ring-blue-100 border-blue-200' : 'hover:border-gray-300'}`}
            >
              <button
                onClick={() => toggleStep(idx)}
                className="w-full flex items-center justify-between p-5 bg-white text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${openIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {s.originalType === 'intro' || s.originalType === 'outro' ? (
                      <PlayCircle size={16} />
                    ) : (
                      steps.slice(0, idx).filter(prev => prev.originalType !== 'intro' && prev.originalType !== 'outro').length + 1
                    )}
                  </div>
                  <span className={`font-bold text-lg ${openIndex === idx ? 'text-gray-900' : 'text-gray-700'}`}>
                    {s.title}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {s.duration && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      {s.type === 'video' ? <PlayCircle size={12} /> : <FileText size={12} />}
                      {s.type === 'video' ? 'Video' : 'Reading'}
                      <span className="mx-1">•</span>
                      {s.duration}
                    </div>
                  )}
                  {openIndex === idx ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-5 pt-0 bg-white">
                  <div className="pl-12 pr-4">
                    <p className="text-gray-600 leading-relaxed">
                      {s.description || "No description available for this lesson."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">Course schedule details coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
