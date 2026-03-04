import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { fetchSavedCourseIds, saveCourse, unsaveCourse } from "@/services/savedCoursesService";
import { useToast, Toast } from "@/components/ui/Toast";

interface SavedCoursesContextType {
  savedCourseIds: Set<string>;
  isLoaded: boolean;
  isSaved: (courseSlug: string) => boolean;
  toggleSave: (courseSlug: string) => Promise<void>;
}

const SavedCoursesContext = createContext<SavedCoursesContextType>({
  savedCourseIds: new Set(),
  isLoaded: false,
  isSaved: () => false,
  toggleSave: async () => {},
});

export const useSavedCourses = () => useContext(SavedCoursesContext);

export const SavedCoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, databaseUser } = useAuth();
  const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Fetch saved courses on login
  useEffect(() => {
    if (!user || !databaseUser?.id) {
      setSavedCourseIds(new Set());
      setIsLoaded(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const ids = await fetchSavedCourseIds(databaseUser.id);
        if (!cancelled) {
          setSavedCourseIds(new Set(ids));
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load saved courses:", err);
        if (!cancelled) {
          setIsLoaded(true); // still mark loaded so UI isn't stuck
        }
      }
    };

    load();

    // Handle pending save after login redirect
    const pendingCourseId = sessionStorage.getItem("pendingSaveCourseId");
    if (pendingCourseId) {
      sessionStorage.removeItem("pendingSaveCourseId");
      sessionStorage.removeItem("returnUrl");
      // Delay to let the initial fetch complete first
      const timer = setTimeout(async () => {
        try {
          await saveCourse(databaseUser.id, pendingCourseId);
          setSavedCourseIds(prev => new Set([...prev, pendingCourseId]));
          showToast("Module saved!", "success");
        } catch {
          showToast("Failed to save module", "error");
        }
      }, 1000);
      return () => { cancelled = true; clearTimeout(timer); };
    }

    return () => { cancelled = true; };
  }, [user, databaseUser?.id]);

  const isSaved = useCallback(
    (courseSlug: string) => savedCourseIds.has(courseSlug),
    [savedCourseIds]
  );

  const toggleSave = useCallback(
    async (courseSlug: string) => {
      const wasSaved = savedCourseIds.has(courseSlug);

      // Optimistic update
      setSavedCourseIds(prev => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(courseSlug);
        } else {
          next.add(courseSlug);
        }
        return next;
      });

      try {
        if (wasSaved) {
          await unsaveCourse(databaseUser!.id, courseSlug);
          showToast("Module removed from saved", "info");
        } else {
          await saveCourse(databaseUser!.id, courseSlug);
          showToast("Module saved!", "success");
        }
      } catch {
        // Revert on failure
        setSavedCourseIds(prev => {
          const reverted = new Set(prev);
          if (wasSaved) {
            reverted.add(courseSlug);
          } else {
            reverted.delete(courseSlug);
          }
          return reverted;
        });
        showToast("Something went wrong. Please try again.", "error");
      }
    },
    [databaseUser?.id, savedCourseIds, showToast]
  );

  return (
    <SavedCoursesContext.Provider value={{ savedCourseIds, isLoaded, isSaved, toggleSave }}>
      {children}
      {ToastComponent}
    </SavedCoursesContext.Provider>
  );
};
