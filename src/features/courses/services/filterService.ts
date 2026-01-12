import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase/client";

// Types for filter options
export interface FilterOption {
    id: string;
    slug: string;
    name: string;
    shortName?: string;
    description?: string;
    displayOrder?: number;
    parentSlug?: string | null;
}

export interface NestedFilterOption extends FilterOption {
    children?: NestedFilterOption[];
}

// Fallback data for when Supabase is not available
const FALLBACK_CATEGORIES: FilterOption[] = [
    { id: '1', slug: 'economy-4-0', name: 'Mastering Economy 4.0', description: 'Navigating the opportunities and challenges in the new economy', displayOrder: 1 },
    { id: '2', slug: 'digital-cognitive-organization', name: "Building Tomorrow's Organisations", description: 'Where organizations are headed in the age of digital transformation', displayOrder: 2 },
    { id: '3', slug: 'digital-business-platform', name: 'Mastering Digital Transformation', description: 'What legacy value or orchestration engine powers the future?', displayOrder: 3 },
    { id: '4', slug: 'digital-transformation-2-0', name: 'Designing for the Future', description: 'How to design and deploy next-generation transformation frameworks', displayOrder: 4 },
    { id: '5', slug: 'digital-worker-workspace', name: 'Architecting Change', description: 'Who are the orchestrators of the new digital workspace?', displayOrder: 5 },
    { id: '6', slug: 'digital-accelerators-tools', name: 'Empowering Change', description: 'When will we get there? Exploring tools to accelerate transformation', displayOrder: 6 },
];

const FALLBACK_INDUSTRIES: FilterOption[] = [
    { id: '1', slug: 'farming-4-0', name: 'Farming 4.0', displayOrder: 1 },
    { id: '2', slug: 'government-4-0', name: 'Government 4.0', displayOrder: 2 },
    { id: '3', slug: 'hospitality-4-0', name: 'Hospitality 4.0', displayOrder: 3 },
    { id: '4', slug: 'infrastructure-4-0', name: 'Infrastructure 4.0', displayOrder: 4 },
    { id: '5', slug: 'logistics-4-0', name: 'Logistics 4.0', displayOrder: 5 },
    { id: '6', slug: 'plant-4-0', name: 'Plant 4.0', displayOrder: 6 },
    { id: '7', slug: 'retail-4-0', name: 'Retail 4.0', displayOrder: 7 },
    { id: '8', slug: 'service-4-0', name: 'Service 4.0', displayOrder: 8 },
    { id: '9', slug: 'wellness-4-0', name: 'Wellness 4.0', displayOrder: 9 },
];

const FALLBACK_AUDIENCE_LEVELS: FilterOption[] = [
    { id: '1', slug: 'digital-leaders', name: 'Digital Leaders', displayOrder: 1 },
    { id: '2', slug: 'digital-workers', name: 'Digital Workers', displayOrder: 2 },
];

const FALLBACK_DIFFICULTY_LEVELS: FilterOption[] = [
    { id: '1', slug: 'beginner', name: 'Beginner', displayOrder: 1 },
    { id: '2', slug: 'intermediate', name: 'Intermediate', displayOrder: 2 },
    { id: '3', slug: 'advanced', name: 'Advanced', displayOrder: 3 },
];

// Helper to map DB row to FilterOption
const mapRowToFilterOption = (row: any): FilterOption => ({
    id: row.id,
    slug: row.slug,
    name: row.short_name || row.name,
    shortName: row.short_name || undefined,
    description: row.description || undefined,
    displayOrder: row.display_order || 0,
    parentSlug: row.parent_slug ?? null,
});

const buildNestedOptions = (options: FilterOption[]): NestedFilterOption[] => {
    const slugSet = new Set(options.map((o) => o.slug));
    const byParent = new Map<string | null, FilterOption[]>();

    for (const option of options) {
        const rawParent = option.parentSlug ?? null;
        const parent = rawParent && slugSet.has(rawParent) ? rawParent : null;
        const siblings = byParent.get(parent) ?? [];
        siblings.push(option);
        byParent.set(parent, siblings);
    }

    const sortOptions = (a: FilterOption, b: FilterOption) => {
        const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
    };

    const build = (
        parentSlug: string | null,
        ancestors: Set<string>
    ): NestedFilterOption[] => {
        const children = (byParent.get(parentSlug) ?? []).sort(sortOptions);
        return children.map((child) => {
            if (ancestors.has(child.slug)) {
                return { ...child, children: undefined };
            }

            const nextAncestors = new Set(ancestors);
            nextAncestors.add(child.slug);
            const nestedChildren = build(child.slug, nextAncestors);
            return {
                ...child,
                children: nestedChildren.length ? nestedChildren : undefined,
            };
        });
    };

    return build(null, new Set());
};

/**
 * Fetch course categories from database
 */
export const fetchCategories = async (): Promise<FilterOption[]> => {
    if (!isSupabaseConfigured()) {
        return FALLBACK_CATEGORIES;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("course_categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.warn("Error fetching categories:", error.message);
            console.log("📋 Categories: Using FALLBACK data");
            return FALLBACK_CATEGORIES;
        }

        console.log(`📋 Categories: Loaded ${data?.length || 0} from SUPABASE`);
        return (data || []).map(mapRowToFilterOption);
    } catch (err) {
        console.warn("Error fetching categories:", err);
        console.log("📋 Categories: Using FALLBACK data (exception)");
        return FALLBACK_CATEGORIES;
    }
};

/**
 * Fetch industries from database
 */
export const fetchIndustries = async (): Promise<FilterOption[]> => {
    if (!isSupabaseConfigured()) {
        return FALLBACK_INDUSTRIES;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("industries")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.warn("Error fetching industries:", error.message);
            console.log("🏭 Industries: Using FALLBACK data");
            return FALLBACK_INDUSTRIES;
        }

        console.log(`🏭 Industries: Loaded ${data?.length || 0} from SUPABASE`);
        return (data || []).map(mapRowToFilterOption);
    } catch (err) {
        console.warn("Error fetching industries:", err);
        console.log("🏭 Industries: Using FALLBACK data (exception)");
        return FALLBACK_INDUSTRIES;
    }
};

export const fetchIndustryTree = async (): Promise<NestedFilterOption[]> => {
    const industries = await fetchIndustries();
    return buildNestedOptions(industries);
};

/**
 * Fetch audience levels from database
 */
export const fetchAudienceLevels = async (): Promise<FilterOption[]> => {
    if (!isSupabaseConfigured()) {
        return FALLBACK_AUDIENCE_LEVELS;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("audience_levels")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.warn("Error fetching audience levels:", error.message);
            console.log("👥 Audience Levels: Using FALLBACK data");
            return FALLBACK_AUDIENCE_LEVELS;
        }

        console.log(`👥 Audience Levels: Loaded ${data?.length || 0} from SUPABASE`);
        return (data || []).map(mapRowToFilterOption);
    } catch (err) {
        console.warn("Error fetching audience levels:", err);
        console.log("👥 Audience Levels: Using FALLBACK data (exception)");
        return FALLBACK_AUDIENCE_LEVELS;
    }
};

/**
 * Fetch difficulty levels from database
 */
export const fetchDifficultyLevels = async (): Promise<FilterOption[]> => {
    if (!isSupabaseConfigured()) {
        return FALLBACK_DIFFICULTY_LEVELS;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("difficulty_levels")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.warn("Error fetching difficulty levels:", error.message);
            console.log("📊 Difficulty Levels: Using FALLBACK data");
            return FALLBACK_DIFFICULTY_LEVELS;
        }

        console.log(`📊 Difficulty Levels: Loaded ${data?.length || 0} from SUPABASE`);
        return (data || []).map(mapRowToFilterOption);
    } catch (err) {
        console.warn("Error fetching difficulty levels:", err);
        console.log("📊 Difficulty Levels: Using FALLBACK data (exception)");
        return FALLBACK_DIFFICULTY_LEVELS;
    }
};

/**
 * Fetch all filter options at once
 */
export const fetchAllFilterOptions = async (): Promise<{
    categories: FilterOption[];
    industries: FilterOption[];
    audienceLevels: FilterOption[];
    difficultyLevels: FilterOption[];
}> => {
    const [categories, industries, audienceLevels, difficultyLevels] = await Promise.all([
        fetchCategories(),
        fetchIndustries(),
        fetchAudienceLevels(),
        fetchDifficultyLevels(),
    ]);

    return { categories, industries, audienceLevels, difficultyLevels };
};
