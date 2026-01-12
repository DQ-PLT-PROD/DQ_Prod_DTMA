import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase/client";

// Types for filter options
interface FilterOption {
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
 * Fetch industries from database
 */
const fetchIndustries = async (): Promise<FilterOption[]> => {
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
