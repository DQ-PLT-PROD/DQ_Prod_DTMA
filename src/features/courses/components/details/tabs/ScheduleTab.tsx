import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText } from "lucide-react";
import { AudienceFitIndicator } from "../AudienceFitIndicator";

interface ScheduleTabProps {
  item: any;
  audienceLevel?: string;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ item, audienceLevel }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const steps: Array<{ title: string; description?: string; duration?: string; type?: 'video' | 'reading' }> = useMemo(() => {
    const ap = Array.isArray(item?.applicationProcess) ? item.applicationProcess : [];
    // If no applicationProcess, we rely on the empty state below

    return ap
      .map((s: any) => ({
        title: s?.title || (typeof s?.week === "number" ? `Week ${s.week}` : ""),
        description: typeof s?.description === "string" ? s.description : "",
        duration: s?.duration || "15 mins",
        type: 'video'
      }))
      .filter((s) => s.title);
  }, [item?.applicationProcess, item?.lessonCount]);

  const toggleStep = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {audienceLevel && (
        <AudienceFitIndicator audienceLevel={audienceLevel} />
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Course Schedule</h3>
        <div className="text-sm text-gray-500 font-medium">
          {steps.length} Lessons • {item.duration || "55m total"}
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
                    {idx + 1}
                  </div>
                  <span className={`font-bold text-lg ${openIndex === idx ? 'text-gray-900' : 'text-gray-700'}`}>
                    {s.title}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {s.duration && (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
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
