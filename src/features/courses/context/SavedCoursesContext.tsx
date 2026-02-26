import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchSavedCourseIds,
  saveCourse as saveCourseRemote,
  unsaveCourse as unsaveCourseRemote,
} from "@/services/savedCoursesService";
import {
  getSavedCourses as getLocalSavedCourses,
  saveCourse as saveCourseLocal,
  unsaveCourse as unsaveCourseLocal,
  importSavedCourses,
} from "../utils/savedCoursesManager";
import { useToast } from "@/components/ui/Toast";

interface SavedCoursesContextType {
  savedCourseIds: Set<string>;
  isLoaded: boolean;
  loadError: string | null;
  isSaved: (courseSlug: string) => boolean;
  toggleSave: (courseSlug: string) => Promise<boolean>;
  refreshSavedCourses: () => Promise<void>;
}

const SavedCoursesContext = createContext<SavedCoursesContextType>({
  savedCourseIds: new Set(),
  isLoaded: false,
  loadError: null,
  isSaved: () => false,
  toggleSave: async () => false,
  refreshSavedCourses: async () => {},
});

export const useSavedCourses = () => useContext(SavedCoursesContext);

export const SavedCoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, databaseUser } = useAuth();
  const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const refreshSavedCourses = useCallback(async () => {
    if (!user || !databaseUser?.id) {
      setSavedCourseIds(new Set());
      setLoadError(null);
      setIsLoaded(false);
      return;
    }

    setLoadError(null);

    try {
      const ids = await fetchSavedCourseIds();
      setSavedCourseIds(new Set(ids));
      importSavedCourses(databaseUser.id, ids);
    } catch (err) {
      console.error("Failed to load saved courses:", err);
      const localIds = getLocalSavedCourses(databaseUser.id);
      setSavedCourseIds(new Set(localIds));
      setLoadError("Could not sync saved courses from server. Showing your local saved list.");
    } finally {
      setIsLoaded(true);
    }
  }, [databaseUser?.id, user]);

  useEffect(() => {
    if (!user || !databaseUser?.id) {
      setSavedCourseIds(new Set());
      setLoadError(null);
      setIsLoaded(false);
      return;
    }

    setIsLoaded(false);
    void refreshSavedCourses();
  }, [databaseUser?.id, refreshSavedCourses, user]);

  useEffect(() => {
    if (!user || !databaseUser?.id || !isLoaded) {
      return;
    }

    const pendingCourseId = sessionStorage.getItem("pendingSaveCourseId");
    if (!pendingCourseId) {
      return;
    }

    sessionStorage.removeItem("pendingSaveCourseId");
    sessionStorage.removeItem("returnUrl");

    const timer = setTimeout(async () => {
      if (savedCourseIds.has(pendingCourseId)) {
        return;
      }

      saveCourseLocal(databaseUser.id, pendingCourseId);
      setSavedCourseIds((prev) => new Set([...prev, pendingCourseId]));

      try {
        await saveCourseRemote(pendingCourseId);
        setLoadError(null);
        showToast("Course saved!", "success");
      } catch {
        setLoadError("Saved courses are being kept locally until server sync succeeds.");
        showToast("Saved locally. Server sync failed.", "info");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [databaseUser?.id, isLoaded, savedCourseIds, showToast, user]);

  const isSaved = useCallback(
    (courseSlug: string) => savedCourseIds.has(courseSlug),
    [savedCourseIds]
  );

  const toggleSave = useCallback(
    async (courseSlug: string) => {
      if (!databaseUser?.id) {
        showToast("Sign in to save courses.", "error");
        return false;
      }

      const wasSaved = savedCourseIds.has(courseSlug);

      setSavedCourseIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(courseSlug);
        } else {
          next.add(courseSlug);
        }
        return next;
      });

      if (wasSaved) {
        unsaveCourseLocal(databaseUser.id, courseSlug);
      } else {
        saveCourseLocal(databaseUser.id, courseSlug);
      }

      try {
        if (wasSaved) {
          await unsaveCourseRemote(courseSlug);
          showToast("Course removed from saved", "info");
        } else {
          await saveCourseRemote(courseSlug);
          showToast("Course saved!", "success");
        }

        setLoadError(null);
        return true;
      } catch {
        setSavedCourseIds((prev) => {
          const reverted = new Set(prev);
          if (wasSaved) {
            reverted.add(courseSlug);
            saveCourseLocal(databaseUser.id, courseSlug);
          } else {
            reverted.delete(courseSlug);
            unsaveCourseLocal(databaseUser.id, courseSlug);
          }
          return reverted;
        });

        setLoadError("Saved courses could not sync with server. Try again.");
        showToast("Failed to sync saved courses. Please try again.", "error");
        return false;
      }
    },
    [databaseUser?.id, savedCourseIds, showToast]
  );

  return (
    <SavedCoursesContext.Provider
      value={{ savedCourseIds, isLoaded, loadError, isSaved, toggleSave, refreshSavedCourses }}
    >
      {children}
      {ToastComponent}
    </SavedCoursesContext.Provider>
  );
};
