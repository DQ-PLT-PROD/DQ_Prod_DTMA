import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  BookmarkIcon,
  StarIcon,
  ChevronRightIcon,
  HomeIcon,
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
import { addCompareId } from "../../utils/comparisonStorage";
import { ErrorDisplay } from "../../components/SkeletonLoader";
import { Link } from "react-router-dom";
import { useProductDetails } from "../../hooks/useProductDetails";
import { Tag } from "../../components/ui/Tag";
import { CourseMeta } from "../../components/ui/CourseMeta";
import { MarketplaceCard } from "../../components/marketplace/MarketplaceCard";
import { MarketplaceQuickViewModal } from "../../components/marketplace/MarketplaceQuickViewModal";
interface MarketplaceDetailsPageProps {
  marketplaceType: "courses" | "financial" | "non-financial" | "knowledge-hub";
  bookmarkedItems?: string[];
  onToggleBookmark?: (itemId: string) => void;
  onAddToComparison?: (item: any) => void;
}
const MarketplaceDetailsPage: React.FC<MarketplaceDetailsPageProps> = ({
  marketplaceType,
  bookmarkedItems = [],
  onToggleBookmark = (_: string) => {},
  onAddToComparison = (_: any) => {},
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
  const [headerHeight, setHeaderHeight] = useState(80);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [relatedQuickView, setRelatedQuickView] = useState<{
    item: any;
    anchor: { x: number; y: number };
  } | null>(null);
  const hideQuickViewTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPointerFine, setIsPointerFine] = useState<boolean>(true);
  // Centralized data fetching & mapping
  const { item, relatedItems, loading, error, refetch } = useProductDetails({
    itemId,
    marketplaceType,
    shouldTakeAction,
  });

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
      const headerHeight = header ? header.offsetHeight : 80;
      setHeaderHeight(headerHeight);
      if (heroRef.current && mainContentRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        // Show floating card when hero section is scrolled past the header
        setIsVisible(heroBottom <= headerHeight + 16); // Add small margin
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
        .catch(() => {});
    }
  };
  const clearHideTimer = () => {
    if (hideQuickViewTimer.current) {
      clearTimeout(hideQuickViewTimer.current);
      hideQuickViewTimer.current = null;
    }
  };
  const scheduleHideQuickView = () => {
    clearHideTimer();
    hideQuickViewTimer.current = setTimeout(() => {
      setRelatedQuickView(null);
    }, 180);
  };
  const openQuickView = (item: any, anchor: { x: number; y: number }) => {
    clearHideTimer();
    const clampedLeft = Math.max(12, Math.min(anchor.x, window.innerWidth - 420));
    const top = Math.max(20, anchor.y);
    setRelatedQuickView({ item, anchor: { x: clampedLeft, y: top } });
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
      } catch {}
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
  const secondaryAction = config.secondaryCTA;
  // Extract tags based on marketplace type
  const displayTags =
    item.tags ||
    [
      item.category,
      marketplaceType === "courses" ? item.deliveryMode : item.serviceType,
      item.businessStage,
    ].filter(Boolean);
  const topicTags = Array.isArray((item as any).topicTags)
    ? (item as any).topicTags.slice(0, 3)
    : [];
  const introVideoUrl = (item as any)?.introVideoUrl;
  const introVideoPoster =
    (item as any)?.introVideoPosterUrl ||
    (item as any)?.heroImageUrl ||
    item?.provider?.logoUrl ||
    "/mzn_logo.png";
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
          <AboutTab
            itemDescription={itemDescription}
            marketplaceType={marketplaceType}
            item={item}
            serviceApplication={serviceApplication}
            config={config}
            highlights={highlights}
          />
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
            marketplaceType={marketplaceType}
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
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <main className="flex-grow">
        {/* Hero Banner - consistent header layout */}
        <div
          ref={heroRef}
          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* Breadcrumbs */}
            <nav className="flex pt-4" aria-label="Breadcrumb">
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
                    <span className="ml-1 text-gray-500 md:ml-2">
                      {itemTitle}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <div className={`grid gap-6 py-8 ${introVideoUrl ? "lg:grid-cols-3" : ""}`}>
              <div className={introVideoUrl ? "lg:col-span-2 flex flex-col items-start" : "flex flex-col items-start max-w-3xl"}>
                {/* Provider */}
                <div className="flex items-center mb-3">
                  <img
                    src={provider?.logoUrl || "/mzn_logo.png"}
                    alt={`${provider?.name || 'Provider'} logo`}
                    className="h-10 w-10 object-contain mr-3 rounded-md bg-white border border-gray-200 p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/mzn_logo.png";
                    }}
                  />
                  <span className="text-gray-600 font-medium">
                    {provider?.name || 'Provider'}
                  </span>
                </div>
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {itemTitle}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.category ? (
                    <Tag variant="category">{item.category}</Tag>
                  ) : null}
                  {(item as any).levelTag ? (
                    <Tag variant="level">{(item as any).levelTag}</Tag>
                  ) : null}
                  {(item as any).audienceLevel ? (
                    <Tag variant="audience">{(item as any).audienceLevel}</Tag>
                  ) : null}
                  {displayTags.length === 0 && topicTags.length === 0
                    ? null
                    : topicTags.map((tag, index) => (
                        <Tag key={`${tag}-${index}`} variant="topic">
                          {tag}
                        </Tag>
                      ))}
                </div>
                {/* Ratings and bookmark row - Now in a single row with proper alignment */}
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex items-center">
                    {marketplaceType === "courses" && (
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              size={16}
                              className={`${
                                parseFloat(rating) >= star
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {rating}
                        </span>
                        <span className="mx-1.5 text-gray-500">·</span>
                        <span className="text-sm text-gray-500">
                          {reviewCount} reviews
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Description */}
                <p className="text-gray-700 mb-4 max-w-2xl">{itemDescription}</p>
                <div className="flex flex-wrap gap-3 items-center mb-2">
                  <CourseMeta duration={item.duration} lessonCount={item.lessonCount} />
                  {item.deliveryMode ? (
                    <Tag variant="meta">{item.deliveryMode}</Tag>
                  ) : null}
                </div>
              </div>
              {introVideoUrl ? (
                <div className="w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black">
                    <video
                      ref={heroVideoRef}
                      src={introVideoUrl}
                      poster={introVideoPoster}
                      className="w-full h-64 lg:h-72 object-cover"
                      controls={isHeroVideoPlaying}
                      muted={!isHeroVideoPlaying}
                      playsInline
                      onPlay={() => setIsHeroVideoPlaying(true)}
                    />
                    {!isHeroVideoPlaying && (
                      <button
                        onClick={handleHeroPlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/35 text-white"
                        aria-label="Play intro video"
                      >
                        <span className="h-14 w-14 rounded-full bg-white/85 text-gray-900 flex items-center justify-center shadow-lg">
                          ▶
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
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
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-[96px]">
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
              <a
                href={config.route}
                className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
              >
                See All {config.itemNamePlural}
                <ChevronRightIcon size={16} className="ml-1" />
              </a>
            </div>
            {relatedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedItems.map((relatedItem) => {
                  return (
                    <div
                      key={relatedItem.id}
                      onMouseEnter={(e) => {
                        if (!isPointerFine) return;
                        const rect =
                          (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        openQuickView(relatedItem, {
                          x: rect.right + 12,
                          y: rect.top + window.scrollY,
                        });
                      }}
                      onMouseLeave={isPointerFine ? scheduleHideQuickView : undefined}
                      onClick={(e) => {
                        if (isPointerFine) return;
                        e.stopPropagation();
                        const rect =
                          (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        openQuickView(relatedItem, {
                          x: rect.right + 12,
                          y: rect.top + window.scrollY,
                        });
                      }}
                    >
                      <MarketplaceCard
                        item={relatedItem as any}
                        marketplaceType={marketplaceType}
                        isBookmarked={false}
                        onToggleBookmark={() => {}}
                        onAddToComparison={() => {}}
                        onQuickView={() =>
                          openQuickView(relatedItem, {
                            x: window.innerWidth / 2 - 180,
                            y: window.scrollY + 160,
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">
                  No related {config.itemNamePlural.toLowerCase()} found
                </p>
              </div>
            )}
          </div>
          {relatedQuickView && !isPointerFine && (
            <div
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => setRelatedQuickView(null)}
            />
          )}
          {relatedQuickView && (
            <MarketplaceQuickViewModal
              item={relatedQuickView.item}
              anchor={relatedQuickView.anchor}
              marketplaceType={marketplaceType}
              onClose={() => setRelatedQuickView(null)}
              onViewDetails={() => {
                navigate(`/marketplace/${marketplaceType}/${relatedQuickView.item.id}`);
                setRelatedQuickView(null);
              }}
              isBookmarked={false}
              onToggleBookmark={() => {}}
              onAddToComparison={() => {}}
              onPrimaryAction={() => {
                navigate(`/marketplace/${marketplaceType}/${relatedQuickView.item.id}`);
                setRelatedQuickView(null);
              }}
              onHover={() => clearHideTimer()}
              onLeave={scheduleHideQuickView}
            />
          )}
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
