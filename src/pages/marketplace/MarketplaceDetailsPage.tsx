import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  BookmarkIcon,
  ChevronRightIcon,
  HomeIcon,
  Share2Icon,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Play,
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
import ResourcesTab from "../../components/marketplace/details/tabs/ResourcesTab";
import TabsNav from "../../components/marketplace/details/TabsNav";
import { getMarketplaceConfig } from "../../utils/marketplaceConfig";
import { getCourseMedia } from "../../utils/courseMedia";

import { ErrorDisplay } from "../../components/SkeletonLoader";
import { useProductDetails } from "../../hooks/useProductDetails";
import { CourseMeta } from "../../components/ui/CourseMeta";
import { AudienceFitIndicator } from "../../components/marketplace/details/AudienceFitIndicator";
import { MarketplaceCard } from "../../components/marketplace/MarketplaceCard";
import { BRAND_GRADIENT } from "../../constants/branding";

interface MarketplaceDetailsPageProps {
  marketplaceType: "courses" | "financial" | "non-financial" | "knowledge-hub";
  bookmarkedItems?: string[];
  onToggleBookmark?: (itemId: string) => void;

}

const MarketplaceDetailsPage: React.FC<MarketplaceDetailsPageProps> = ({
  marketplaceType,
  bookmarkedItems = [],
  onToggleBookmark = (_: string) => { },

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
  const [showStickyBottomCTA, setShowStickyBottomCTA] = useState(false);
  const [showStickyHeaderCTA, setShowStickyHeaderCTA] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLElement>(null);
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



  // Update floating card visibility based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Get header height dynamically



      if (heroRef.current && mainContentRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        // For mobile, we'll handle this differently with the sticky bottom CTA
        if (window.innerWidth < 1024) {
          setShowStickyBottomCTA(heroBottom < 0);
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
      if (heroRef.current && relatedRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const relatedRect = relatedRef.current.getBoundingClientRect();

        // Show sticky header CTA when hero is scrolled past (bottom < 80 for sticky header offset)
        // and before related courses section (top > 80)
        const isPastHero = heroRect.bottom < 80;
        const isBeforeRelated = relatedRect.top > 80;

        setShowStickyHeaderCTA(isPastHero && isBeforeRelated);

        // Mobile sticky bottom CTA logic (keep existing behavior for mobile if needed, or adjust)
        if (window.innerWidth < 1024) {
          setShowStickyBottomCTA(heroRect.bottom < 0);
        } else {
          setShowStickyBottomCTA(false);
        }
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



  const [activeTab, setActiveTab] = useState<string>(
    config.tabs[0]?.id || "about"
  );



  const handleToggleBookmark = () => {
    if (item) {
      onToggleBookmark(item.id);
      setIsBookmarked(!isBookmarked);
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
      case "resources":
        return <ResourcesTab />;
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

          {/* Video Background with Fade - Absolute Positioned */}
          {introVideoUrl && (
            <div
              className="absolute top-0 right-0 h-full w-full lg:w-[65%] z-10 pointer-events-auto"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%, black 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 40%, black 100%)'
              }}
            >
              <HeroVideoPlayer
                videoUrl={introVideoUrl}
                posterUrl={introVideoPoster}
                onStartLearning={handlePrimaryAction}

                isBookmarked={isBookmarked}
              />
            </div>
          )}

          <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-20 h-full flex flex-col justify-center pt-20 pointer-events-none">
            {/* Breadcrumbs */}
            <nav className="flex pb-4 pointer-events-auto" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm">
                <li className="inline-flex items-center">
                  <Link
                    to="/"
                    className="text-white/80 hover:text-white inline-flex items-center transition-colors"
                  >
                    <HomeIcon size={14} className="mr-1.5" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon size={14} className="text-white/60" />
                    <Link
                      to={config.route as string}
                      className="ml-1 text-white/80 hover:text-white md:ml-2 transition-colors"
                    >
                      {config.itemNamePlural}
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <ChevronRightIcon size={14} className="text-white/60" />
                    <span className="ml-1 text-white font-medium md:ml-2 line-clamp-1 max-w-[200px] sm:max-w-none">
                      {itemTitle}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex flex-col items-start max-w-3xl justify-center pointer-events-auto py-8 lg:py-16">
              {/* Badges Row */}
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {(item as any).category && (
                  <span className="text-[13px] font-bold uppercase tracking-wider text-blue-400">
                    {(item as any).category}
                  </span>
                )}
                {(item as any).audienceLevel && (
                  <span className="px-2 py-1 bg-white/10 backdrop-blur-sm text-purple-300 text-[11px] font-bold uppercase tracking-wider rounded-md border border-purple-500/30">
                    {(item as any).audienceLevel}
                  </span>
                )}
                {(item as any).levelTag && (
                  <span className="text-[11px] font-medium text-gray-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                    {(item as any).levelTag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {itemTitle}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm mb-8">
                {marketplaceType === "courses" && (
                  <>
                    <CourseMeta
                      duration={item.duration}
                      lessonCount={item.lessonCount}
                      className="text-white/90 font-medium text-base"
                    />
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-white text-xl leading-relaxed mb-10 max-w-2xl font-light">
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
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="sticky top-[80px] z-40 bg-white border-b border-gray-200 shadow-sm">
          <TabsNav
            tabs={config.tabs as any}
            activeTab={activeTab}
            onChange={setActiveTab}
            showNavigation={false} // User requested to remove arrows
            showTabsMenu={showTabsMenu}
            setShowTabsMenu={setShowTabsMenu}
            tabsRef={tabsRef as React.RefObject<HTMLDivElement>}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            scrollLeft={scrollLeft}
            scrollRight={scrollRight}
            onCheckOverflow={() => { }}
            rightContent={showStickyHeaderCTA ? (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">

                <button
                  onClick={handlePrimaryAction}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Start Learning
                </button>
              </div>
            ) : undefined}
          />
        </div>
        {/* Main content area with 12-column grid layout */}
        <div
          ref={mainContentRef}
          className="container mx-auto px-4 md:px-6 max-w-7xl py-8"
        >
          <div className="grid grid-cols-12 gap-8">
            {/* Content column (Full width since summary card is removed) */}
            <div className="col-span-12">
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
            </div>
          </div>
        </div>

        {/* Related Items */}
        <section ref={relatedRef} className="bg-gray-50 py-10 border-t border-gray-200">
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

            {/* Related Items Grid - Adjusted to fill width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.slice(0, 4).map((relatedItem) => (
                <div key={relatedItem.id} className="h-full">
                  <MarketplaceCard
                    item={relatedItem}
                    marketplaceType={marketplaceType}
                    isBookmarked={bookmarkedItems.includes(relatedItem.id)}
                    onToggleBookmark={() => onToggleBookmark(relatedItem.id)}

                    isPointerFine={isPointerFine}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky mobile CTA */}
        {
          showStickyBottomCTA && (
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
          )
        }
      </main>
      <Footer isLoggedIn={false} />
    </div>
  );
};

// Internal Hero Video Component with Custom Controls
const HeroVideoPlayer: React.FC<{
  videoUrl: string;
  posterUrl?: string;
  onStartLearning: () => void;

  isBookmarked: boolean;
}> = ({ videoUrl, posterUrl, onStartLearning, isBookmarked }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Autoplay after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => { /* Autoplay prevented */ });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full object-cover"
        playsInline
        onClick={togglePlay}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Overlay Controls */}
      <div
        className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-6 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Top Right Controls */}
        <div className="flex justify-end gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <Maximize size={20} />
          </button>
        </div>

        {/* Center Play Button (only when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={togglePlay}
              className="pointer-events-auto h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg pl-1">
                <Play size={24} fill="currentColor" />
              </div>
            </button>
          </div>
        )}

        {/* Bottom Controls & CTAs */}
        <div className="flex flex-col gap-4 mt-auto">
          {/* Progress Bar (Simple) */}
          {/* <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-1/3"></div>
          </div> */}

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAddToLibrary(); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md border transition-colors ${isBookmarked
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
              >
                {isBookmarked ? "Saved" : "Save"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onStartLearning(); }}
                className="px-3 py-1.5 rounded-lg bg-white text-blue-900 text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetailsPage;
