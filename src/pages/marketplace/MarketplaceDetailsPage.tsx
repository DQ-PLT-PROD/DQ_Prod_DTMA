import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  BookmarkIcon,
  StarIcon,
  ChevronRightIcon,
  HomeIcon,
  Share2Icon,
} from "lucide-react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import RequiredDocumentsTab from "../../components/marketplace/details/tabs/RequiredDocumentsTab";
import ProviderTab from "../../components/marketplace/details/tabs/ProviderTab";
import AboutTab from "../../components/marketplace/details/tabs/AboutTab";
import ScheduleTab from "../../components/marketplace/details/tabs/ScheduleTab";
import LearningOutcomesTab from "../../components/marketplace/details/tabs/LearningOutcomesTab";
import EligibilityTermsTab from "../../components/marketplace/details/tabs/EligibilityTermsTab";
import ApplicationProcessTab from "../../components/marketplace/details/tabs/ApplicationProcessTab";
import SummaryCard from "../../components/marketplace/details/SummaryCard";
import TabsNav from "../../components/marketplace/details/TabsNav";
import { getMarketplaceConfig } from "../../utils/marketplaceConfig";
import { getCourseMedia } from "../../utils/courseMedia";
import { addCompareId } from "../../utils/comparisonStorage";
import { ErrorDisplay } from "../../components/SkeletonLoader";
import { useProductDetails } from "../../hooks/useProductDetails";
import { CourseMeta } from "../../components/ui/CourseMeta";
import { AudienceFitIndicator } from "../../components/marketplace/details/AudienceFitIndicator";
import { DimensionBadge } from "../../components/marketplace/details/DimensionBadge";
import { MarketplaceCard } from "../../components/marketplace/MarketplaceCard";
import { BRAND_GRADIENT } from "../../constants/branding";

interface MarketplaceDetailsPageProps {
  marketplaceType: "courses" | "financial" | "non-financial" | "knowledge-hub";
  bookmarkedItems?: string[];
  onToggleBookmark?: (itemId: string) => void;
  onAddToComparison?: (item: any) => void;
}

const MarketplaceDetailsPage: React.FC<MarketplaceDetailsPageProps> = ({
  marketplaceType,
  bookmarkedItems = [],
  onToggleBookmark = (_: string) => { },
  onAddToComparison = (_: any) => { },
}) => {
  const { itemId } = useParams<{
    itemId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldTakeAction = searchParams.get("action") === "true";
  const config = getMarketplaceConfig(marketplaceType);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTabsMenu, setShowTabsMenu] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(true);
  const [showStickyBottomCTA, setShowStickyBottomCTA] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState<boolean>(true);

  // Centralized data fetching & mapping
  const { item, relatedItems, loading, error, refetch } = useProductDetails({
    itemId,
    marketplaceType,
    shouldTakeAction,
  });

  const { videoUrl: introVideoUrl, poster: introVideoPoster } = useMemo(
    () => getCourseMedia(item),
    [item]
  );

  const seeAllHref = useMemo(() => {
    if (marketplaceType !== "courses") return config.route;
    const params = new URLSearchParams();
    const courseItem: any = item || {};
    if (courseItem?.categorySlug) params.set("category", courseItem.categorySlug);
    if (courseItem?.audienceLevel) params.set("audience", courseItem.audienceLevel);
    if (courseItem?.levelTag) params.set("level", courseItem.levelTag);
    const qs = params.toString();
    return qs ? `${config.route}?${qs}` : config.route;
  }, [item, config.route, marketplaceType]);

  // Sync bookmark state when item or bookmarks change
  useEffect(() => {
    if (item?.id) {
      setIsBookmarked(bookmarkedItems.includes(item.id));
    }
  }, [item?.id, bookmarkedItems]);

  // Check if tabs overflow and need navigation controls
  const checkOverflow = () => {
    if (tabsRef.current && containerRef.current) {
      const scrollWidth = tabsRef.current.scrollWidth;
      const clientWidth = containerRef.current.clientWidth - 96; // Account for potential arrow buttons
      setShowNavigation(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [config.tabs]);

  // Update floating card visibility based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Get header height dynamically
      const header = document.querySelector("header");
      const currentHeaderHeight = header ? header.offsetHeight : 80;

      if (heroRef.current && mainContentRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        // Show floating card when hero section is scrolled past the header
        setIsVisible(heroBottom <= currentHeaderHeight + 16); // Add small margin
        // For mobile, we'll handle this differently with the sticky bottom CTA
        if (window.innerWidth < 1024) {
          const summaryCardBottom =
            summaryCardRef.current?.getBoundingClientRect().bottom || 0;
          setShowStickyBottomCTA(summaryCardBottom < 0);
        } else {
          setShowStickyBottomCTA(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    // Initial check
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (summaryCardRef.current && window.innerWidth < 1024) {
        const summaryCardBottom =
          summaryCardRef.current.offsetTop +
          summaryCardRef.current.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;
        // Show sticky CTA when scrolled past summary card
        setShowStickyBottomCTA(scrollPosition > summaryCardBottom + 100);
      } else {
        setShowStickyBottomCTA(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsPointerFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleHeroPlay = () => {
    const video = heroVideoRef.current;
    if (video) {
      video.muted = false;
      video
        .play()
        .then(() => setIsHeroVideoPlaying(true))
        .catch(() => { });
    }
  };

  const [activeTab, setActiveTab] = useState<string>(
    config.tabs[0]?.id || "about"
  );

  const rating = (item as any)?.rating
    ? String((item as any).rating)
    : (4 + Math.random()).toFixed(1);
  const reviewCount = (item as any)?.reviewCount
    ? Number((item as any).reviewCount)
    : Math.floor(Math.random() * 50) + 10;

  const handleToggleBookmark = () => {
    if (item) {
      onToggleBookmark(item.id);
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleAddToComparison = () => {
    if (item) {
      // Persist selection locally so it is available on marketplace pages
      addCompareId(marketplaceType, item.id);
      // Keep existing behavior: inform parent handler (if provided)
      onAddToComparison(item);
      // Navigate to marketplace listing so the user can add more services,
      // also pass the item in state for immediate UI hydration
      const configForType = getMarketplaceConfig(marketplaceType);
      navigate(configForType.route, { state: { addToCompare: item } });
    }
  };

  const handlePrimaryAction = () => {
    let url: string | undefined = (item as any)?.formUrl?.trim();
    if (!url) {
      url = "/forms/request-for-membership";
    }
    // External absolute URL: redirect
    if (/^https?:\/\//i.test(url)) {
      window.location.href = url;
      return;
    }
    // Internal relative path: ensure it is prefixed with /forms/
    if (!url.startsWith("/forms")) {
      url = `/forms/${url.replace(/^\/+/, "")}`;
    }
    navigate(url);
  };

  const retryFetch = () => {
    if (itemId) {
      try {
        refetch?.();
      } catch { }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[300px] flex-grow">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="container mx-auto px-4 py-8 flex-grow">
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
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-gray-400" />
                  <Link
                    to={config.route}
                    className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2"
                  >
                    {config.itemNamePlural}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-gray-400" />
                  <span className="ml-1 text-gray-500 md:ml-2">Details</span>
                </div>
              </li>
            </ol>
          </nav>
          <ErrorDisplay
            message={error?.message || "Failed to load item"}
            onRetry={retryFetch}
            additionalMessage={undefined}
          />
        </div>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[300px] flex-grow">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              {config.itemName} Not Found
            </h2>
            <p className="text-gray-500 mb-4">
              The {config.itemName.toLowerCase()} you're looking for doesn't
              exist or has been removed.
            </p>
            <Link
              to={config.route}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Back to {config.itemNamePlural}
            </Link>
          </div>
        </div>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  // Extract display properties based on marketplace type
  const itemTitle = item.title;
  const itemDescription = item.description;
  const serviceApplication = item.serviceApplication;
  const provider = item.provider;
  const primaryAction = config.primaryCTA;

  // Extract details for the sidebar
  const detailItems = config.attributes
    .map((attr) => {
      const raw = (item as any)[attr.key];
      const formatted = attr?.formatter ? attr.formatter(raw) : raw;
      return {
        label: attr.label,
        value: formatted || "N/A",
      };
    })
    .filter((detail) => detail.value !== "N/A");

  // Extract highlights/features based on marketplace type
  const highlights =
    marketplaceType === "courses"
      ? item.keyHighlights || item.learningOutcomes || []
      : item.details || item.keyHighlights || [];

  // Render tab content with consistent styling
  const renderTabContent = (tabId: string) => {
    const tab = config.tabs.find((t) => t.id === tabId);
    if (!tab) return null;

    // Return specific tab content based on tab ID
    switch (tabId) {
      case "about":
        return (
          <div className="space-y-8">
            <AboutTab
              itemDescription={itemDescription}
              marketplaceType={marketplaceType}
              item={item}
              serviceApplication={serviceApplication}
              config={config}
              highlights={highlights}
            />
            {/* Audience Fit Indicator - DTMA Specific */}
            {(item as any).audienceLevel && (
              <AudienceFitIndicator audienceLevel={(item as any).audienceLevel} />
            )}
          </div>
        );

      case "schedule":
        return <ScheduleTab item={item} />;

      case "learning_outcomes":
        return (
          <LearningOutcomesTab
            outcomes={Array.isArray(item.learningOutcomes) ? item.learningOutcomes : highlights}
            skills={item.skillsGained}
            uponCompletion={item.uponCompletion}
          />
        );
      case "eligibility_terms":
        return (
          <EligibilityTermsTab
            item={item}
            providerName={item.provider?.name || "Service Provider"}
          />
        );
      case "application_process":
        return <ApplicationProcessTab process={item.applicationProcess} />;
      case "required_documents":
        return <RequiredDocumentsTab documents={item.requiredDocuments} />;

      case "provider":
        return (
          <ProviderTab
            provider={provider}
            marketplaceType={marketplaceType as any}
            item={item}
          />
        );
      // Add other tab cases as needed
      default:
        if (tab.renderContent) {
          return (
            <div>
              <p className="text-gray-600 text-lg mb-6">
                Additional information about this{" "}
                {config.itemName.toLowerCase()}.
              </p>
              {tab.renderContent(item, marketplaceType)}
            </div>
          );
        }
        return (
          <div>
            <p className="text-gray-600 text-lg mb-6">
              Additional information about this {config.itemName.toLowerCase()}.
            </p>
            <p className="text-gray-500">Content for {tab.label} tab</p>
          </div>
        );
    }
  };

  // SummaryCard is now an external presentational component
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        transparent={true}
      />
      <main id="main-content" className="flex-grow">
        {/* Hero Banner - consistent header layout */}
        <div
          ref={heroRef}
          className="w-full text-white relative overflow-hidden"
          style={{
            minHeight: '500px',
            background: BRAND_GRADIENT
          }}
        >
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

          {/* Gradient Overlay for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>

          <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-20 h-full flex flex-col justify-center pt-24">
            {/* Breadcrumbs */}
            <nav className="flex pt-8 pb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm">
                <li className="inline-flex items-center">
                  <Link
                    to="/"
                    className="text-white/70 hover:text-white inline-flex items-center transition-colors"
                  >
                    <HomeIcon size={14} className="mr-1.5" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon size={14} className="text-white/40" />
                    <Link
                      to={config.route as string}
                      className="ml-1 text-white/70 hover:text-white md:ml-2 transition-colors"
                    >
                      {config.itemNamePlural}
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <ChevronRightIcon size={14} className="text-white/40" />
                    <span className="ml-1 text-white font-medium md:ml-2 line-clamp-1 max-w-[200px] sm:max-w-none">
                      {itemTitle}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className={`grid gap-12 py-8 lg:py-16 ${introVideoUrl ? "lg:grid-cols-12" : ""}`}>
              <div className={introVideoUrl ? "lg:col-span-7 flex flex-col items-start justify-center" : "flex flex-col items-start max-w-4xl justify-center"}>
                {/* Badges Row */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {(item as any).category && (
                    <DimensionBadge dimension={(item as any).category} />
                  )}
                  {(item as any).audienceLevel && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-wider text-white">
                      For {(item as any).audienceLevel}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  {itemTitle}
                </h1>

                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
                      <img
                        src={provider?.logoUrl || "/mzn_logo.png"}
                        alt={`${provider?.name || 'Provider'} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="font-bold text-lg">{provider?.name || 'Provider'}</span>
                  </div>

                  {marketplaceType === "courses" && (
                    <>
                      <span className="text-white/30 text-xl">•</span>
                      <div className="flex items-center gap-1.5">
                        <StarIcon size={18} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-lg">{rating}</span>
                        <span className="text-white/70">({reviewCount} reviews)</span>
                      </div>
                      <span className="text-white/30 text-xl">•</span>
                      <CourseMeta
                        duration={item.duration}
                        lessonCount={item.lessonCount}
                        className="text-white/90 font-medium text-base"
                      />
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/90 text-xl leading-relaxed mb-10 max-w-3xl font-light">
                  {itemDescription}
                </p>

                {/* Action Buttons (Mobile Only - Desktop has sticky card) */}
                <div className="flex gap-3 lg:hidden w-full sm:w-auto">
                  <button
                    onClick={handlePrimaryAction}
                    className="flex-1 sm:flex-none px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl shadow-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1"
                  >
                    {primaryAction}
                  </button>
                  <button
                    onClick={handleToggleBookmark}
                    className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                  >
                    <BookmarkIcon size={24} className={isBookmarked ? "fill-white" : ""} />
                  </button>
                  <button
                    className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                  >
                    <Share2Icon size={24} />
                  </button>
                </div>
              </div>

              {/* Video Column */}
              {introVideoUrl && (
                <div className="lg:col-span-5 w-full flex items-center">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black aspect-video transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <video
                      ref={heroVideoRef}
                      src={introVideoUrl}
                      poster={introVideoPoster}
                      className="w-full h-full object-cover"
                      controls={isHeroVideoPlaying}
                      muted={!isHeroVideoPlaying}
                      playsInline
                      onPlay={() => setIsHeroVideoPlaying(true)}
                    />
                    {!isHeroVideoPlaying && (
                      <button
                        onClick={handleHeroPlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 group hover:bg-black/30 transition-colors"
                        aria-label="Play intro video"
                      >
                        <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="h-14 w-14 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg pl-1">
                            <span className="text-2xl">▶</span>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Tabs Navigation */}
        <TabsNav
          tabs={config.tabs as any}
          activeTab={activeTab}
          onChange={setActiveTab}
          showNavigation={showNavigation}
          showTabsMenu={showTabsMenu}
          setShowTabsMenu={setShowTabsMenu}
          tabsRef={tabsRef}
          containerRef={containerRef}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
          onCheckOverflow={checkOverflow}
        />
        {/* Main content area with 12-column grid layout */}
        <div
          ref={mainContentRef}
          className="container mx-auto px-4 md:px-6 max-w-7xl py-8"
        >
          <div className="grid grid-cols-12 gap-8">
            {/* Content column (~8 columns) */}
            <div className="col-span-12 lg:col-span-8">
              {/* Tab Content */}
              <div className="mb-8">
                {config.tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={activeTab === tab.id ? "block" : "hidden"}
                    id={`tabpanel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tab.id}`}
                  >
                    {renderTabContent(tab.id)}
                  </div>
                ))}
              </div>
              {/* Mobile/Tablet Summary Card - only visible on mobile/tablet; hidden while floating card is visible */}
              {!isVisible && (
                <div className="lg:hidden mt-8">
                  <SummaryCard
                    isFloating={false}
                    summaryCardRef={summaryCardRef}
                    config={config}
                    detailItems={detailItems}
                    highlights={highlights}
                    primaryAction={primaryAction}
                    onPrimaryAction={handlePrimaryAction}
                    onAddToComparison={handleAddToComparison}
                    onCloseFloating={() => setIsFloatingCardVisible(false)}
                  />
                </div>
              )}
            </div>
            {/* Summary card column (~4 columns) - visible only on desktop */}
            <div className="hidden lg:block lg:col-span-4 relative">
              <div className="sticky top-[110px] z-30">
                {isFloatingCardVisible && (
                  <SummaryCard
                    isFloating={isVisible}
                    config={config}
                    detailItems={detailItems}
                    highlights={highlights}
                    primaryAction={primaryAction}
                    onPrimaryAction={handlePrimaryAction}
                    onAddToComparison={handleAddToComparison}
                    onCloseFloating={() => setIsFloatingCardVisible(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating card - visible when scrolled past hero section (mobile/tablet only) */}
        {isVisible && isFloatingCardVisible && (
          <div className="lg:hidden">
            <SummaryCard
              isFloating={true}
              config={config}
              detailItems={detailItems}
              highlights={highlights}
              primaryAction={primaryAction}
              onPrimaryAction={handlePrimaryAction}
              onAddToComparison={handleAddToComparison}
              onCloseFloating={() => setIsFloatingCardVisible(false)}
            />
          </div>
        )}

        {/* Related Items */}
        <section className="bg-gray-50 py-10 border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Related {config.itemNamePlural}
              </h2>
              <Link
                to={seeAllHref}
                className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
              >
                See All {config.itemNamePlural}
                <ChevronRightIcon size={16} className="ml-1" />
              </Link>
            </div>

            {/* Related Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem) => (
                <div key={relatedItem.id} className="h-full">
                  <MarketplaceCard
                    item={relatedItem}
                    marketplaceType={marketplaceType}
                    isBookmarked={bookmarkedItems.includes(relatedItem.id)}
                    onToggleBookmark={() => onToggleBookmark(relatedItem.id)}
                    onAddToComparison={() => onAddToComparison(relatedItem)}
                    isPointerFine={isPointerFine}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky mobile CTA */}
        {showStickyBottomCTA && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:hidden z-30 transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between max-w-sm mx-auto">
              <div className="mr-3">
                <div className="text-gray-900 font-bold">
                  {marketplaceType === "courses"
                    ? item.price || "Free"
                    : marketplaceType === "financial"
                      ? item.amount || "Apply Now"
                      : "Request Now"}
                </div>
                <div className="text-sm text-gray-600">
                  {item.duration || item.serviceType || ""}
                </div>
              </div>
              <button
                onClick={handlePrimaryAction}
                className="flex-1 px-4 py-3 text-white font-bold rounded-md bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 hover:from-teal-600 hover:via-blue-600 hover:to-purple-700 transition-colors shadow-md"
              >
                {primaryAction}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer isLoggedIn={false} />
    </div>
  );
};

export default MarketplaceDetailsPage;
