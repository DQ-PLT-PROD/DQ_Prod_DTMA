import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseForEnrollment } from "@/lib/supabase/serviceClient";

type SavedModuleRow = {
  modules?: {
    slug?: string | null;
  } | null;
};

type ModuleRow = {
  id: string;
  slug: string;
};

const getSavedSupabase = () => getSupabaseForEnrollment();

const resolveModuleBySlug = async (moduleSlug: string): Promise<ModuleRow | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSavedSupabase();
  const { data, error } = await supabase
    .from("modules")
    .select("id, slug")
    .eq("slug", moduleSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to resolve saved module slug:", error);
    return null;
  }

  return (data as ModuleRow | null) ?? null;
};

export const fetchSavedCourseIds = async (userId: string): Promise<string[]> => {
  if (!userId || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSavedSupabase();
  const { data, error } = await (supabase.from("saved_modules" as any) as any)
    .select("modules!inner(slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) {
    console.error("Failed to fetch saved modules:", error);
    return [];
  }

  return data
    .map((row: SavedModuleRow) => row.modules?.slug)
    .filter((slug: string | null | undefined): slug is string => typeof slug === "string" && slug.length > 0);
};

export const saveCourse = async (userId: string, moduleSlug: string): Promise<void> => {
  if (!userId || !moduleSlug || !isSupabaseConfigured()) {
    throw new Error("Missing learner or module context");
  }

  const module = await resolveModuleBySlug(moduleSlug);
  if (!module) {
    throw new Error("Module not found");
  }

  const supabase = getSavedSupabase();
  const { error } = await (supabase.from("saved_modules" as any) as any)
    .upsert(
      {
        user_id: userId,
        module_id: module.id,
      },
      { onConflict: "user_id,module_id" }
    );

  if (error) {
    console.error("Failed to save module:", error);
    throw error;
  }
};

export const unsaveCourse = async (userId: string, moduleSlug: string): Promise<void> => {
  if (!userId || !moduleSlug || !isSupabaseConfigured()) {
    throw new Error("Missing learner or module context");
  }

  const module = await resolveModuleBySlug(moduleSlug);
  if (!module) {
    return;
  }

  const supabase = getSavedSupabase();
  const { error } = await (supabase.from("saved_modules" as any) as any)
    .delete()
    .eq("user_id", userId)
    .eq("module_id", module.id);

  if (error) {
    console.error("Failed to unsave module:", error);
    throw error;
  }
};
