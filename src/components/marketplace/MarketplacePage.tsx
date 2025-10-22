import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FilterSidebar, FilterConfig } from "./FilterSidebar";
import { MarketplaceGrid } from "./MarketplaceGrid";
import { SearchBar } from "../SearchBar";
import { FilterIcon, XIcon, HomeIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { ErrorDisplay, CourseCardSkeleton } from "../SkeletonLoader";
import { getMarketplaceConfig } from "../../utils/marketplaceConfig";
import { MarketplaceComparison } from "./MarketplaceComparison";
import { Header, useAuth } from "../Header";
import { Footer } from "../Footer";
import {
  getStoredCompareIds,
  setStoredCompareIds,
  addCompareId as storageAddCompareId,
  removeCompareId as storageRemoveCompareId,
  clearCompare as storageClearCompare,
} from "../../utils/comparisonStorage";
import { useQuery } from "@apollo/client/react";
import { useLocation } from "react-router-dom";
import { GET_PRODUCTS, GET_FACETS, GET_ALL_COURSES } from "../../services/marketplaceQueries.ts";
import { fetchMarketplaceFilters } from "../../services/marketplace";
import { getFallbackKnowledgeHubItems } from "../../utils/fallbackData";
import { isSupabaseConfigured, getSupabase } from "../../admin-ui/utils/supabaseClient";


// Mapping of Media Types to their relevant Format options (uses filter labels)
const MEDIA_TYPE_FORMAT_MAPPING: Record<string, string[]> = {
  'News': ['Quick Reads'],
  'Reports': ['In-Depth Reports', 'Downloadable Templates'],
  'Toolkits & Templates': ['Interactive Tools', 'Downloadable Templates'],
  'Guides': ['Quick Reads', 'In-Depth Reports'],
  'Events': ['Live Events'],
  'Videos': ['Recorded Media'],
  'Podcasts': ['Recorded Media']
};

// Type for comparison items
interface ComparisonItem {
  id: string;
  title: string;
  [key: string]: any;
}

// Types for GET_FACETS query
interface FacetValue {
  id: string;
  name: string;
  code: string;
}

interface Facet {
  id: string;
  name: string;
  code: string;
  values: FacetValue[];
}

interface GetFacetsData {
  facets: {
    items: Facet[];
  };
}

// Types for GET_PRODUCTS query
interface Asset {
  name: string;
}

interface Logo {
  name: string;
  source: string;
}

interface RequiredDocument {
  id: string;
  customFields: any;
}

interface RelatedService {
  id: string;
}

interface ProductCustomFields {
  Logo?: Logo;
  CustomerType?: string;
  BusinessStage?: string;
  Nationality?: string;
  LegalStructure?: string;
  Industry?: string;
  Partner?: string;
  ProcessingTime?: string;
  RegistrationValidity?: string;
  Cost?: number;
  Steps?: string;
  KeyTermsOfService?: string;
  RequiredDocuments?: RequiredDocument[];
  EmpowermentandLeadership?: string;
  RelatedServices?: RelatedService[];
  formUrl?: string;
  logoUrl?: string;
}

interface ProductFacetValue {
  facet: {
    id: string;
    name: string;
    code: string;
  };
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  assets: Asset[];
  name: string;
  slug: string;
  description: string;
  facetValues: ProductFacetValue[];
  customFields: ProductCustomFields;
}

interface GetProductsData {
  products: {
    items: Product[];
    totalItems: number;
  };
}

// Types for GET_ALL_COURSES query
interface Course {
  id: string;
  name: string;
  description: string;
  partner: string;
  rating: number;
  reviewCount: number;
  cost: number;
  duration: string;
  logoUrl: string;
  businessStage: string;
  pricingModel: string;
  serviceCategory: string;
}

interface GetCoursesData {
  courses: {
    items: Course[];
    totalItems: number;
  };
}

export interface MarketplacePageProps {
  marketplaceType: "courses" | "financial" | "non-financial" | "knowledge-hub";
  title: string;
  description: string;
  promoCards?: any[];
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  marketplaceType,
  promoCards = [],
}) => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const location = useLocation() as any;
  const config = getMarketplaceConfig(marketplaceType);
  
  // State for items and filtering
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Filter sidebar visibility - should be visible on desktop, hidden on mobile by default
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  
  // Avoid clobbering localStorage with empty state before hydration
  const [hasHydratedCompare, setHasHydratedCompare] = useState(false);
  const [compareItems, setCompareItems] = useState<ComparisonItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // State for filter options
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);
  
  // Knowledge Hub specific filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Collapsible filter categories state
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Apollo queries for products, facets, and courses
  // Skip GraphQL entirely for Knowledge Hub — it uses Supabase + local data
  const skipGraph = marketplaceType === 'knowledge-hub';
  
  const { data: productData, error: productError } = useQuery<GetProductsData>(GET_PRODUCTS, {
    skip: skipGraph || marketplaceType === "courses",
  });
  
  const { data: courseData, error: courseError } = useQuery<GetCoursesData>(GET_ALL_COURSES, {
    skip: marketplaceType !== "courses",
  });
  
  const { data: facetData, error: facetError } = useQuery<GetFacetsData>(GET_FACETS, {
    skip: skipGraph,
  });

  // Load filter configurations based on marketplace type
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        if (marketplaceType === 'knowledge-hub') {
          // Use static config for Knowledge Hub filters (mediaType, category, format, etc.)
          const filterOptions: FilterConfig[] = config.filterCategories;
          setFilterConfig(filterOptions);

          // Initialize empty filters based on the configuration
          const initialFilters: Record<string, string> = {};
          filterOptions.forEach((fc) => {
            initialFilters[fc.id] = '';
          });
          setFilters(initialFilters);
          return;
        }
        
        if (facetData) {
          // Choose facet codes based on marketplace type
          let facetCodes: string[] = [];
          if (marketplaceType === 'financial') {
            facetCodes = ['service-category', 'business-stage', 'provided-by', 'pricing-model'];
          } else if (marketplaceType === 'non-financial') {
            facetCodes = ['sector-tag-2', 'business-stage', 'provided-by', 'pricing-model'];
          } else if (marketplaceType === 'courses') {
            facetCodes = ['service-category', 'business-stage', 'provided-by', 'pricing-model'];
          } else {
            facetCodes = ['service-category', 'business-stage', 'provided-by', 'pricing-model'];
          }

          const filterOptions: FilterConfig[] = facetData.facets.items
            .filter((facet) => facetCodes.includes(facet.code))
            .map((facet) => ({
              id: facet.code,
              title: facet.name,
              options: facet.values.map((value) => ({
                id: value.code,
                name: value.name,
              })),
            }));
          console.log('filterOptions:', filterOptions);
          setFilterConfig(filterOptions);

          // Initialize empty filters based on the configuration
          const initialFilters: Record<string, string> = {};
          filterOptions.forEach((config) => {
            initialFilters[config.id] = '';
          });
          setFilters(initialFilters);
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
        // Use fallback filter config from marketplace config
        setFilterConfig(config.filterCategories);
        // Initialize empty filters based on the configuration
        const initialFilters: Record<string, string> = {};
        config.filterCategories.forEach((config) => {
          initialFilters[config.id] = "";
        });
        setFilters(initialFilters);
      }
    };
    loadFilterOptions();
  }, [facetData, marketplaceType, config]);

  // Initialize all filter categories as collapsed by default
  useEffect(() => {
    if (filterConfig.length > 0) {
      const initialCollapsed: Record<string, boolean> = {};
      filterConfig.forEach(category => {
        initialCollapsed[category.id] = true;
      });
      setCollapsedCategories(initialCollapsed);
    }
  }, [filterConfig]);

  // Fetch items based on marketplace type, filters, and search query
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        // Handle Knowledge Hub
        if (marketplaceType === 'knowledge-hub') {
          const fromSupabase: any[] = [];
          try {
            if (isSupabaseConfigured()) {
              const supabase = getSupabase();
              const { data, error } = await supabase
                .from('media_items')
                .select('*')
                .eq('status', 'Published')
                .lte('published_at', new Date().toISOString())
                .order('published_at', { ascending: false })
                .limit(200);
              if (error) throw error;
              (data || []).forEach((row: any) => {
                const mapType = (t?: string): string => {
                  const v = (t || '').toLowerCase();
                  // Return SINGULAR forms to match card rendering expectations
                  if (v === 'report' || v === 'reports') return 'Report';
                  if (v === 'guide' || v === 'guides') return 'Guide';
                  if (v === 'podcast' || v === 'podcasts') return 'Podcast';
                  if (v === 'video' || v === 'videos') return 'Video';
                  if (v === 'event' || v === 'events') return 'Event';
                  if (v === 'tool' || v === 'toolkit' || v === 'toolkits') return 'Toolkits & Templates';
                  if (v === 'announcement' || v === 'news') return 'News';
                  // Fallback: capitalize the first letter instead of defaulting to 'News'
                  return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'News';
                };

                // Extract filter values from tags array
                const tags = Array.isArray(row.tags) ? row.tags : [];

                // Define valid filter values for matching
                const validFormats = ['Quick Reads', 'In-Depth Reports', 'Interactive Tools', 'Downloadable Templates', 'Recorded Media', 'Live Events'];
                const validPopularity = ['Latest', 'Trending', 'Most Downloaded', "Editor's Pick"];
                const validBusinessStages = ['Idea Stage', 'Startup', 'Growth', 'Scale-up', 'Established', 'All Stages'];

                // Extract values from tags
                const format = tags.find((tag: string) => validFormats.includes(tag));
                const popularity = tags.find((tag: string) => validPopularity.includes(tag));
                const businessStage = tags.find((tag: string) => validBusinessStages.includes(tag));

                // Strip HTML tags from description
                const stripHtml = (html: string): string => {
                  const tmp = document.createElement('div');
                  tmp.innerHTML = html;
                  return tmp.textContent || tmp.innerText || '';
                };

                fromSupabase.push({
                  id: String(row.id),
                  title: row.title,
                  description: stripHtml(row.body || row.summary || ''),
                  mediaType: mapType(row.type),
                  provider: {
                    name: row.provider_name || 'Knowledge Hub',
                    logoUrl: row.provider_logo_url || '/mzn_logo.png',
                  },
                  imageUrl: row.thumbnail_url || row.image_url || undefined,
                  tags: tags,
                  date: row.published_at || undefined,
                  lastUpdated: row.updated_at || undefined,
                  domain: row.category || undefined,
                  format: format || undefined,
                  popularity: popularity || undefined,
                  businessStage: businessStage || undefined,
                });
              });
            }
          } catch (e) {
            console.warn('Supabase load failed; using mock only', e);
          }

          // Mock fallback dataset
          const mock = getFallbackKnowledgeHubItems();

          // Merge + normalize
          const merged = [...fromSupabase, ...mock];

          // Apply search + activeFilters
          const matchesActiveFilters = (item: any): boolean => {
            if (!activeFilters.length) return true;

            // Normalize function to handle singular/plural matching
            const normalize = (str: string): string => {
              const s = String(str).toLowerCase().trim();
              // Remove trailing 's' for plural normalization
              return s.endsWith('s') ? s.slice(0, -1) : s;
            };

            // Group active filters by category
            const filtersByCategory: Record<string, string[]> = {};

            activeFilters.forEach((filterValue) => {
              // Find which category this filter belongs to
              const category = filterConfig.find(cat =>
                cat.options.some(opt => opt.name === filterValue)
              );

              if (category) {
                if (!filtersByCategory[category.id]) {
                  filtersByCategory[category.id] = [];
                }
                filtersByCategory[category.id].push(filterValue);
              }
            });

            // Build item's searchable values
            const itemValues: Record<string, string> = {
              mediaType: item.mediaType,
              category: item.domain,
              format: item.format,
              popularity: item.popularity,
              businessStage: item.businessStage
            };

            // Check filters: OR within category, AND across categories
            return Object.keys(filtersByCategory).every((categoryId) => {
              const categoryFilters = filtersByCategory[categoryId];
              const itemValue = itemValues[categoryId];

              if (!itemValue) {
                // If item doesn't have this field, check tags as fallback
                if (Array.isArray(item.tags)) {
                  return categoryFilters.some((filterValue) =>
                    item.tags.some((tag: string) => normalize(tag) === normalize(filterValue))
                  );
                }
                return false;
              }

              // OR logic: at least one filter in this category must match
              return categoryFilters.some((filterValue) =>
                normalize(itemValue) === normalize(filterValue)
              );
            });
          };

          const filteredKH = merged.filter((item) => {
            const matchesFilters = matchesActiveFilters(item);
            const matchesSearch =
              searchQuery.trim() === '' ||
              item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())));
            return matchesFilters && matchesSearch;
          });

          setItems(merged);
          setFilteredItems(filteredKH);
          setLoading(false);
          return;
        }

        // Handle Courses
        if (marketplaceType === "courses" && courseData) {
          const mappedItems = courseData.courses.items.map((course) => {
            const rawCost = (course as any)?.cost;
            const parsedCost =
              typeof rawCost === "number" ? rawCost : parseFloat(String(rawCost ?? ""));
            const normalizedCost = !isNaN(parsedCost) && parsedCost >= 1 ? parsedCost : 3200;
            
            const facetValues = [
              { code: "service-category", name: course.serviceCategory },
              { code: "business-stage", name: course.businessStage },
              { code: "provided-by", name: course.partner },
              { code: "pricing-model", name: course.pricingModel },
            ].filter((fv) => fv.name);
            
            return {
              id: course.id,
              title: course.name,
              slug: `courses/${course.id}`,
              description: course.description || "No description available",
              facetValues,
              provider: {
                name: course.partner || "Unknown Partner",
                logoUrl: course.logoUrl || "/default_logo.png",
                description: "No provider description available",
              },
              formUrl: null,
              Cost: normalizedCost,
              price: normalizedCost,
              BusinessStage: course.businessStage,
              rating: course.rating,
              reviewCount: course.reviewCount,
              duration: course.duration,
              pricingModel: course.pricingModel,
              serviceCategory: course.serviceCategory,
            };
          });

          // Apply filters + search
          const filtered = mappedItems.filter((item: any) => {
            const matchesAllFacets = Object.keys(filters).every((facetCode) => {
              const selectedValue = filters[facetCode];
              if (!selectedValue) return true;
              return (
                item.facetValues.some(
                  (facetValue: any) => facetValue.code === facetCode && facetValue.name === selectedValue
                ) ||
                (facetCode === "pricing-model" &&
                  selectedValue === "one-time-fee" &&
                  item.Cost &&
                  item.Cost > 0) ||
                (facetCode === "business-stage" &&
                  item.BusinessStage &&
                  selectedValue === item.BusinessStage)
              );
            });

            const matchesSearch =
              searchQuery.trim() === "" ||
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.facetValues.some((facetValue: any) =>
                facetValue.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

            return matchesAllFacets && matchesSearch;
          });

          setItems(mappedItems);
          setFilteredItems(filtered);
          setLoading(false);
          return;
        }

        // Handle Products (Financial & Non-Financial)
        if (productData) {
          let filteredServices = productData.products.items;

          if (marketplaceType === "financial") {
            filteredServices = productData.products.items.filter(
              (product) =>
                product.facetValues.some((fv) => fv.id === "66") &&
                !product.facetValues.some((fv) => fv.id === "67")
            );
          } else if (marketplaceType === "non-financial") {
            filteredServices = productData.products.items.filter(
              (product) =>
                product.facetValues.some((fv) => fv.id === "67") &&
                !product.facetValues.some((fv) => fv.id === "66")
            );
          }

          const fallbackLogos = [
            "/mzn_logo.png",
          ];

          // Map product data to match expected MarketplaceItem structure
          const mappedItems = filteredServices.map((product) => {
            const randomFallbackLogo =
              fallbackLogos[Math.floor(Math.random() * fallbackLogos.length)];

            const rawFormUrl = product.customFields?.formUrl;
            const finalFormUrl = rawFormUrl || "https://www.tamm.abudhabi/en/login";

            if (product.id === "133" || !rawFormUrl) {
              console.log(
                `Product "${product.name}" (ID: ${product.id}): Raw formUrl =`,
                rawFormUrl,
                "| Final =",
                finalFormUrl
              );
            }

            return {
              id: product.id,
              title: product.name,
              slug: product.slug,
              description:
                product.description ||
                "Through this service, you can easily reallocate your approved loan funds to different areas of your business to support changing needs and enhance growth.",
              facetValues: product.facetValues,
              tags: [product.customFields.BusinessStage, product.customFields.BusinessStage].filter(Boolean),
              provider: {
                name: product.customFields?.Partner || product.customFields?.Industry || "Khalifa Fund",
                logoUrl: product.customFields?.logoUrl || product.customFields?.Logo?.source || randomFallbackLogo,
                description: "No provider description available",
              },
              formUrl: finalFormUrl,
              ...product.customFields,
            };
          });

          // Apply filters and search query
          const filtered = mappedItems.filter((product: any) => {
            const matchesAllFacets = Object.keys(filters).every((facetCode) => {
              const selectedValue = filters[facetCode];
              if (!selectedValue) return true;
              return (
                product.facetValues.some(
                  (facetValue: any) => facetValue.code === selectedValue
                ) ||
                (facetCode === "pricing-model" &&
                  selectedValue === "one-time-fee" &&
                  product.Cost &&
                  product.Cost > 0) ||
                (facetCode === "business-stage" &&
                  product.BusinessStage &&
                  selectedValue === product.BusinessStage)
              );
            });

            const matchesSearch =
              searchQuery.trim() === "" ||
              product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.facetValues.some((facetValue: any) =>
                facetValue.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              );

            return matchesAllFacets && matchesSearch;
          });

          // Prioritize ID 133
          const prioritized = filtered.sort((a, b) => {
            if (a.id === "133") return -1;
            if (b.id === "133") return 1;
            return 0;
          });

          console.log("filters:", filters);
          console.log("filteredItems:", prioritized);

          setItems(mappedItems);
          setFilteredItems(prioritized);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error processing ${marketplaceType} items:`, err);
        setError(`Failed to load ${marketplaceType}`);
        setItems([]);
        setFilteredItems([]);
        setLoading(false);
      }
    };

    loadItems();
  }, [productData, courseData, filters, searchQuery, marketplaceType, activeFilters, filterConfig]);

  // Immediately hydrate compare from navigation state when arriving from details page
  useEffect(() => {
    const pending = location?.state?.addToCompare;
    if (pending) {
      // Add if not present and under cap
      if (
        !compareItems.some((c) => c.id === pending.id) &&
        compareItems.length < 3
      ) {
        setCompareItems((prev) => [...prev, pending]);
        storageAddCompareId(marketplaceType, pending.id);
      }
      // Clear the navigation state to avoid duplicate adds on back/refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state, location?.pathname, marketplaceType, compareItems]);

  // Hydrate compareItems from localStorage when items are available (merge, don't clear)
  useEffect(() => {
    if (!items || items.length === 0) return; // wait until items are loaded
    // Build a map for quick lookup
    const byId: Record<string, any> = {};
    items.forEach((it) => {
      byId[it.id] = it;
    });
    const storedIds = getStoredCompareIds(marketplaceType);
    if (!storedIds.length) return; // nothing stored; don't alter current state

    // Start with current selections
    const merged: ComparisonItem[] = [...compareItems];
    for (const id of storedIds) {
      if (merged.length >= 3) break;
      if (!merged.some((c) => c.id === id)) {
        const found = byId[id];
        if (found) merged.push(found);
      }
    }
    const currentIds = compareItems.map((i) => i.id).join(",");
    const nextIds = merged.map((i) => i.id).join(",");
    if (currentIds !== nextIds) {
      setCompareItems(merged.slice(0, 3));
    }
    setHasHydratedCompare(true);
  }, [items, marketplaceType, compareItems]);

  // Keep storage in sync with current compareItems
  useEffect(() => {
    // Don't sync to storage until we've attempted hydration to avoid wiping existing selections
    if (!hasHydratedCompare) return;
    const ids = compareItems.map((i) => i.id);
    setStoredCompareIds(marketplaceType, ids);
  }, [compareItems, marketplaceType, hasHydratedCompare]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value === prev[filterType] ? '' : value
      };

      // If changing media type, clear format filter if it's no longer valid
      if (filterType === 'mediaType' && prev.format) {
        const mediaTypeFormatMapping: Record<string, string[]> = {
          'News': ['Quick Reads'],
          'Reports': ['In-Depth Reports', 'Downloadable Templates'],
          'Toolkits & Templates': ['Interactive Tools', 'Downloadable Templates'],
          'Guides': ['Quick Reads', 'In-Depth Reports'],
          'Events': ['Live Events'],
          'Videos': ['Recorded Media'],
          'Podcasts': ['Recorded Media']
        };

        const newMediaType = newFilters[filterType];
        if (newMediaType && mediaTypeFormatMapping[newMediaType]) {
          const allowedFormats = mediaTypeFormatMapping[newMediaType];
          if (!allowedFormats.includes(prev.format)) {
            newFilters.format = '';
          }
        } else if (!newMediaType) {
          // If media type is cleared, keep the format filter as is
        }
      }

      return newFilters;
    });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    const emptyFilters: Record<string, string> = {};
    filterConfig.forEach((config) => {
      emptyFilters[config.id] = "";
    });
    setFilters(emptyFilters);
    setSearchQuery("");
    setActiveFilters([]);
  }, [filterConfig]);

  // Toggle sidebar visibility (only on mobile)
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Clear all comparison selections
  const handleClearComparison = useCallback(() => {
    setCompareItems([]);
    storageClearCompare(marketplaceType);
    setShowComparison(false);
  }, [marketplaceType]);

  // Toggle bookmark for an item
  const toggleBookmark = useCallback((itemId: string) => {
    setBookmarkedItems((prev) => {
      return prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
    });
  }, []);

  // Add an item to comparison
  const handleAddToComparison = useCallback(
    (item: any) => {
      if (
        compareItems.length < 3 &&
        !compareItems.some((c) => c.id === item.id)
      ) {
        setCompareItems((prev) => [...prev, item]);
        storageAddCompareId(marketplaceType, item.id);
      }
    },
    [compareItems, marketplaceType]
  );

  // Remove an item from comparison
  const handleRemoveFromComparison = useCallback(
    (itemId: string) => {
      setCompareItems((prev) => prev.filter((item) => item.id !== itemId));
      storageRemoveCompareId(marketplaceType, itemId);
    },
    [marketplaceType]
  );

  // Retry loading items after an error
  const retryFetch = useCallback(() => {
    setError(null);
    setLoading(true);
  }, []);

  // Filter the format options based on selected media type for knowledge-hub
  const filteredKnowledgeHubConfig = useMemo(() => {
    if (marketplaceType !== 'knowledge-hub') {
      return filterConfig;
    }

    // Find all selected media types from activeFilters
    const mediaTypeFilter = filterConfig.find(c => c.id === 'mediaType');
    const selectedMediaTypes = mediaTypeFilter?.options
      .filter(opt => activeFilters.includes(opt.name))
      .map(opt => opt.name) || [];

    return filterConfig.map(config => {
      // Only filter the Format category if at least one Media Type is selected
      if (config.id === 'format' && selectedMediaTypes.length > 0) {
        // Aggregate all allowed formats from all selected media types
        const allAllowedFormats = new Set<string>();
        selectedMediaTypes.forEach(mediaType => {
          const allowedFormats = MEDIA_TYPE_FORMAT_MAPPING[mediaType];
          if (allowedFormats) {
            allowedFormats.forEach(format => allAllowedFormats.add(format));
          }
        });

        // Filter to only show formats that are allowed by at least one selected media type
        return {
          ...config,
          options: config.options.filter(option => allAllowedFormats.has(option.name))
        };
      }
      return config;
    });
  }, [filterConfig, activeFilters, marketplaceType]);

  // Handle Knowledge Hub specific filter changes
  const handleKnowledgeHubFilterChange = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter];

      // If changing media type, clear format filters that are no longer valid
      const mediaTypeFilter = filterConfig.find(c => c.id === 'mediaType');
      const isMediaTypeFilter = mediaTypeFilter?.options.some(opt => opt.name === filter);

      if (isMediaTypeFilter) {
        const formatFilter = filterConfig.find(c => c.id === 'format');
        const currentFormatFilters = newFilters.filter(f =>
          formatFilter?.options.some(opt => opt.name === f)
        );

        // Find the new selected media type
        const newMediaTypes = newFilters.filter(f =>
          mediaTypeFilter?.options.some(opt => opt.name === f)
        );

        if (newMediaTypes.length > 0) {
          // Get allowed formats for all selected media types
          const allAllowedFormats = new Set<string>();
          newMediaTypes.forEach(mt => {
            const allowedFormats = MEDIA_TYPE_FORMAT_MAPPING[mt];
            if (allowedFormats) {
              allowedFormats.forEach(f => allAllowedFormats.add(f));
            }
          });

          // Remove format filters that aren't allowed
          return newFilters.filter(f => {
            const isFormatFilter = formatFilter?.options.some(opt => opt.name === f);
            if (isFormatFilter) {
              return allAllowedFormats.has(f);
            }
            return true;
          });
        }
      }

      return newFilters;
    });
  }, [filterConfig]);

  // Clear Knowledge Hub filters
  const clearKnowledgeHubFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Toggle collapse state for a filter category
  const toggleCategoryCollapse = useCallback((categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                <HomeIcon size={16} className="mr-1" />
                <span>Home</span>
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon size={16} className="text-gray-400" />
                <span className="ml-1 text-gray-500 md:ml-2">
                  {config.itemNamePlural}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {config.title}
          </h1>
        </div>
        <p className="text-gray-600 mb-6">{config.description}</p>
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="w-full">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        </div>
        
        {/* Comparison bar */}
        {compareItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-blue-800">
                {config.itemName} Comparison ({compareItems.length}/3)
              </h3>
              <div>
                <button
                  onClick={() => setShowComparison(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                >
                  Compare Selected
                </button>
                <button
                  onClick={handleClearComparison}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {compareItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-full px-3 py-1 flex items-center gap-2 text-sm border border-gray-200"
                >
                  <span className="truncate max-w-[150px]">{item.title}</span>
                  <button
                    onClick={() => handleRemoveFromComparison(item.id)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Remove ${item.title} from comparison`}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Mobile filter toggle */}
          <div className="xl:hidden sticky top-16 z-20 bg-gray-50 py-2 shadow-sm">
            <div className="flex justify-between items-center">
              <button
                onClick={toggleFilters}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 w-full justify-center"
                aria-expanded={showFilters}
                aria-controls="filter-sidebar"
              >
                <FilterIcon size={18} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              {(Object.values(filters).some((f) => f !== "") ||
                activeFilters.length > 0) && (
                <button
                  onClick={resetFilters}
                  className="ml-2 text-blue-600 text-sm font-medium whitespace-nowrap px-3 py-2"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {/* Filter sidebar - mobile/tablet */}
          <div
            className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 xl:hidden ${
              showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleFilters}
            aria-hidden={!showFilters}
          >
            <div
              id="filter-sidebar"
              className={`fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                showFilters ? "translate-x-0" : "-translate-x-full"
              }`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="h-full overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={toggleFilters}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close filters"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
                <div className="p-4">
                  {marketplaceType === 'knowledge-hub' ? (
                    <div className="space-y-4">
                      {filteredKnowledgeHubConfig.map(category => (
                        <div key={category.id} className="border-b border-gray-100 pb-3">
                          <h3 className="font-medium text-gray-900 mb-2">
                            {category.title}
                          </h3>
                          <div className="space-y-2">
                            {category.options.map((option) => (
                              <div
                                key={option.id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`mobile-${category.id}-${option.id}`}
                                  checked={activeFilters.includes(option.name)}
                                  onChange={() =>
                                    handleKnowledgeHubFilterChange(option.name)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor={`mobile-${category.id}-${option.id}`}
                                  className="ml-2 text-xs text-gray-700"
                                >
                                  {option.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FilterSidebar
                      filters={filters}
                      filterConfig={filterConfig}
                      onFilterChange={handleFilterChange}
                      onResetFilters={resetFilters}
                      isResponsive={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter sidebar - desktop - always visible */}
          <div className="hidden xl:block xl:w-1/4">
            <div className="bg-white rounded-lg shadow sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold">Filters</h2>
                {(Object.values(filters).some((f) => f !== "") ||
                  activeFilters.length > 0) && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>
              <div className="p-4 overflow-y-auto scrollbar-hide">
                {marketplaceType === 'knowledge-hub' ? (
                  <div className="space-y-2">
                    {filteredKnowledgeHubConfig.map(category => {
                      const isCollapsed = collapsedCategories[category.id];
                      const hasActiveFilters = category.options.some(opt => activeFilters.includes(opt.name));
                      return (
                        <div key={category.id} className="border-b border-gray-100 pb-2">
                          <button 
                            onClick={() => toggleCategoryCollapse(category.id)} 
                            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors" 
                            aria-expanded={!isCollapsed}
                          >
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                              {category.title}
                              {hasActiveFilters && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {category.options.filter(opt => activeFilters.includes(opt.name)).length}
                                </span>
                              )}
                            </h3>
                            {isCollapsed ? (
                              <ChevronDownIcon size={18} className="text-gray-500" />
                            ) : (
                              <ChevronUpIcon size={18} className="text-gray-500" />
                            )}
                          </button>
                          {!isCollapsed && (
                            <div className="space-y-2 mt-2 ml-1">
                              {category.options.map(option => (
                                <div key={option.id} className="flex items-center">
                                  <input 
                                    type="checkbox" 
                                    id={`desktop-${category.id}-${option.id}`} 
                                    checked={activeFilters.includes(option.name)} 
                                    onChange={() => handleKnowledgeHubFilterChange(option.name)} 
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                  />
                                  <label 
                                    htmlFor={`desktop-${category.id}-${option.id}`} 
                                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                                  >
                                    {option.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <FilterSidebar 
                    filters={filters} 
                    filterConfig={filterConfig} 
                    onFilterChange={handleFilterChange} 
                    onResetFilters={resetFilters} 
                    isResponsive={false} 
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="xl:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(6)].map((_, idx) => (
                  <CourseCardSkeleton key={idx} />
                ))}
              </div>
            ) : error || (!skipGraph && (facetError || productError)) || courseError ? (
              <ErrorDisplay
                message={
                  error ||
                  (!skipGraph && (facetError?.message || productError?.message)) ||
                  courseError?.message ||
                  `Failed to load ${marketplaceType}`
                }
                onRetry={retryFetch}
              />
            ) : filteredItems.length === 0 ? (
              <div className="text-center text-gray-600 py-8">
                No service available
              </div>
            ) : (
              <MarketplaceGrid
                items={filteredItems}
                marketplaceType={marketplaceType}
                bookmarkedItems={bookmarkedItems}
                onToggleBookmark={toggleBookmark}
                onAddToComparison={handleAddToComparison}
                promoCards={promoCards}
              />
            )}
          </div>
        </div>
        
        {/* Comparison modal */}
        {showComparison && (
          <MarketplaceComparison
            items={compareItems}
            onClose={() => setShowComparison(false)}
            onRemoveItem={handleRemoveFromComparison}
            marketplaceType={marketplaceType}
          />
        )}
      </div>
      <Footer isLoggedIn={false} />
    </div>
  );
};

export default MarketplacePage;
