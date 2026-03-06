import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText } from "lucide-react";


interface ScheduleTabProps {
  item: any;
}

// Helper to format duration from minutes
const formatDuration = (minutes: number): string => {
  if (!minutes) return "15 mins"; // Default fallback
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} mins`;
};

interface Step {
  title: string;
  description?: string;
  duration?: string;
  type?: 'video' | 'reading';
}

interface ModuleGroup {
  moduleTitle: string;
  moduleDescription?: string;
  moduleThumbnailUrl?: string;
  steps: Step[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ item }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // For module view: track which module is expanded
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  // For module view: track which lesson within a module is expanded
  const [openLessonIndex, setOpenLessonIndex] = useState<number | null>(0);

  const steps: Step[] = useMemo(() => {
    const ap = Array.isArray(item?.applicationProcess) ? item.applicationProcess : [];

    return ap
      .filter((s: any) => {
        // Exclude intro and outro lessons from schedule display
        const lessonType = (s?.type || '').toLowerCase();
        return lessonType !== 'intro' && lessonType !== 'outro';
      })
      .map((s: any) => ({
        title: s?.title || (typeof s?.week === "number" ? `Week ${s.week}` : ""),
        description: typeof s?.description === "string" ? s.description : "",
        duration: s?.estimatedDurationMinutes ? formatDuration(s.estimatedDurationMinutes) : (s?.duration || "15 mins"),
        type: s?.type === 'reading' ? 'reading' as const : 'video' as const
      }))
      .filter((s) => s.title);
  }, [item?.applicationProcess]);

  // Group lessons by module when modules are available
  const moduleGroups: ModuleGroup[] = useMemo(() => {
    const modules = Array.isArray(item?.modules) ? item.modules : [];
    if (modules.length === 0) return [];

    const ap = Array.isArray(item?.applicationProcess) ? item.applicationProcess : [];
    // Filter out intro/outro
    const filteredLessons = ap.filter((s: any) => {
      const lessonType = (s?.type || '').toLowerCase();
      return lessonType !== 'intro' && lessonType !== 'outro';
    });

    // Build a map of moduleId -> lessons
    const moduleLessonMap = new Map<string, any[]>();
    const ungrouped: any[] = [];

    for (const lesson of filteredLessons) {
      const moduleId = lesson.moduleId;
      if (moduleId) {
        if (!moduleLessonMap.has(moduleId)) {
          moduleLessonMap.set(moduleId, []);
        }
        moduleLessonMap.get(moduleId)!.push(lesson);
      } else {
        ungrouped.push(lesson);
      }
    }

    // Only use module grouping if at least some lessons have moduleId
    if (moduleLessonMap.size === 0) return [];

    const groups: ModuleGroup[] = modules
      .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((mod: any) => {
        const modLessons = moduleLessonMap.get(mod.id) || [];
        return {
          moduleTitle: mod.title,
          moduleDescription: mod.description,
          moduleThumbnailUrl: mod.thumbnailUrl,
          steps: modLessons.map((s: any) => ({
            title: s?.title || "",
            description: typeof s?.description === "string" ? s.description : "",
            duration: s?.estimatedDurationMinutes ? formatDuration(s.estimatedDurationMinutes) : (s?.duration || "15 mins"),
            type: s?.type === 'reading' ? 'reading' as const : 'video' as const,
          })).filter((s: Step) => s.title),
        };
      })
      .filter((g: ModuleGroup) => g.steps.length > 0);

    // Add ungrouped lessons as a separate group if any
    if (ungrouped.length > 0) {
      groups.push({
        moduleTitle: "Additional Lessons",
        steps: ungrouped.map((s: any) => ({
          title: s?.title || "",
          description: typeof s?.description === "string" ? s.description : "",
          duration: s?.estimatedDurationMinutes ? formatDuration(s.estimatedDurationMinutes) : (s?.duration || "15 mins"),
          type: s?.type === 'reading' ? 'reading' as const : 'video' as const,
        })).filter((s: Step) => s.title),
      });
    }

    return groups;
  }, [item?.modules, item?.applicationProcess]);

  const hasModules = moduleGroups.length > 0;

  const toggleStep = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const displayLessonCount = Number(item?.lessonCount);
  const safeLessonCount = Number.isFinite(displayLessonCount) && displayLessonCount >= 0
    ? displayLessonCount
    : steps.length;

  // Render a single lesson accordion item
  const renderLessonItem = (s: Step, idx: number, isOpen: boolean, onToggle: () => void) => (
    <div
      key={idx}
      className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'ring-2 ring-blue-100 border-blue-200' : 'hover:border-gray-300'}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-white text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`
            h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold
            ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
          `}>
            {idx + 1}
          </div>
          <span className={`font-bold text-lg ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>
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
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-0 bg-white">
          <div className="pl-12 pr-4">
            <p className="text-gray-600 leading-relaxed">
              {s.description || "No description available for this lesson."}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Module Outline</h3>
        <div className="text-sm text-gray-500 font-medium">
          {safeLessonCount} Lessons • {item.duration || ""}
        </div>
      </div>

      <div className="space-y-4">
        {hasModules ? (
          // Module-grouped view
          moduleGroups.map((group, mIdx) => {
            const isModuleOpen = openModuleIndex === mIdx;
            return (
              <div key={mIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    setOpenModuleIndex(isModuleOpen ? null : mIdx);
                    setOpenLessonIndex(0);
                  }}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isModuleOpen ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4">
                    {group.moduleThumbnailUrl ? (
                      <img
                        src={group.moduleThumbnailUrl}
                        alt={`${group.moduleTitle} thumbnail`}
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 shrink-0" />
                    )}
                    <div className={`
                      h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold
                      ${isModuleOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
                    `}>
                      {mIdx + 1}
                    </div>
                    <div>
                      <span className={`font-bold text-lg ${isModuleOpen ? 'text-gray-900' : 'text-gray-700'}`}>
                        {group.moduleTitle}
                      </span>
                      <span className="ml-3 text-xs text-gray-400 font-medium">
                        {group.steps.length} {group.steps.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>
                  </div>
                  {isModuleOpen ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {isModuleOpen && (
                  <div className="px-5 pb-5 pt-2 bg-white space-y-3">
                    {group.moduleDescription && (
                      <p className="text-sm text-gray-500 pl-13 mb-2">{group.moduleDescription}</p>
                    )}
                    {group.steps.map((s, lIdx) =>
                      renderLessonItem(
                        s,
                        lIdx,
                        openLessonIndex === lIdx,
                        () => setOpenLessonIndex(openLessonIndex === lIdx ? null : lIdx)
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : steps.length > 0 ? (
          // Flat lesson view (no modules)
          steps.map((s, idx) =>
            renderLessonItem(s, idx, openIndex === idx, () => toggleStep(idx))
          )
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
