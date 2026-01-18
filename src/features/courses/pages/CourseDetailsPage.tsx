import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ChevronRightIcon,
  HomeIcon,
  Share2Icon,
  Volume2,
  VolumeX,
  Maximize,
  ChevronDown,
} from "lucide-react";
import { Breadcrumb } from "../../../components/ui/Breadcrumb";
import { Header } from "../../../components/Header";
import { useAuth } from "@/lib/auth";
import { Footer } from "../../../components/Footer";
import RequiredDocumentsTab from "../components/details/tabs/RequiredDocumentsTab";

import AboutTab from "../components/details/tabs/AboutTab";
import ScheduleTab from "../components/details/tabs/ScheduleTab";
import LearningOutcomesTab from "../components/details/tabs/LearningOutcomesTab";
import EligibilityTermsTab from "../components/details/tabs/EligibilityTermsTab";
import ApplicationProcessTab from "../components/details/tabs/ApplicationProcessTab";
import ResourcesTab from "../components/details/tabs/ResourcesTab";
import TabsNav from "../components/details/TabsNav";
import { getCourseConfig } from "../../../utils/courseConfig";
import { getCourseMedia } from "../../../utils/courseMedia";

import { ErrorDisplay } from "../../../components/SkeletonLoader";
import { useProductDetails } from "../../../hooks/useProductDetails";
import { CourseMeta } from "../../../components/ui/CourseMeta";
import { Tag } from "../../../components/ui/Tag";
import { AudienceFitIndicator } from "../components/details/AudienceFitIndicator";
import { CourseTile } from "../components/CourseTile";
import { EnrollmentButton } from "@/components/enrollment/EnrollmentButton";


const CourseDetailsPage: React.FC = () => {
  const { itemId } = useParams<{
    itemId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldTakeAction = searchParams.get("action") === "true";
  const config = getCourseConfig();
  const { user, login } = useAuth();
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
  const [showDescription, setShowDescription] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Video starts muted for autoplay
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-hide description after 8 seconds to focus on video
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDescription(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Auto-hide scroll indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Centralized data fetching & mapping
  const { item, relatedItems, loading, error, refetch } = useProductDetails({
    itemId,
    shouldTakeAction,
  });

  const { videoUrl: introVideoUrl, poster: introVideoPoster } = useMemo(
    () => getCourseMedia(item),
    [item]
  );


  const seeAllHref = useMemo(() => {
    const params = new URLSearchParams();
    const courseItem: any = item || {};
    if (courseItem?.categorySlug) params.set("category", courseItem.categorySlug);
    if (courseItem?.audienceLevel) params.set("audience", courseItem.audienceLevel);
    if (courseItem?.levelTag) params.set("level", courseItem.levelTag);
    const qs = params.toString();
    return qs ? `/courses?${qs}` : '/courses';
  }, [item]);





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







  const handlePrimaryAction = () => {
    // Navigate to learning screen - EnrollmentButton will handle enrollment
    if (item) {
      navigate(`/learning?courseId=${encodeURIComponent(item.id)}`);
    }
  };

  const retryFetch = () => {
    if (itemId) {
      try {
        refetch?.();
      } catch (error) {
        console.warn("Failed to refetch course details.", error);
      }
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



  // Extract highlights/features
  const highlights = item.keyHighlights || item.learningOutcomes || [];

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


      case "resources":
        return <ResourcesTab resources={(item as any).resources} />;
      // Add other tab cases as needed
      default:
        if (tab.renderContent) {
          return (
            <div>
              <p className="text-gray-600 text-lg mb-6">
                Additional information about this{" "}
                {config.itemName.toLowerCase()}.
              </p>
              {tab.renderContent(item)}
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
        {/* Hero Banner - Netflix-style video with layered structure */}
        <div
          ref={heroRef}
          className="w-full text-white relative h-screen min-h-[600px] overflow-hidden isolate"
          onMouseEnter={() => setShowScrollIndicator(true)}
          onMouseLeave={() => setShowScrollIndicator(false)}
        >
          {/* Video Background Layer */}
          {introVideoUrl && (
            <video
              ref={videoRef}
              id="hero-video"
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
              src={introVideoUrl}
              poster={introVideoPoster}
              autoPlay
              muted={isMuted}
              loop
              playsInline
            />
          )}

          {/* Video Controls Layer */}
          {introVideoUrl && (
            <div className="absolute bottom-8 right-8 flex gap-2 z-20">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm border border-white/20"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.requestFullscreen();
                  }
                }}
                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm border border-white/20"
                aria-label="Fullscreen"
              >
                <Maximize size={22} />
              </button>
            </div>
          )}

          {/* Top Scrim Gradient - For breadcrumb visibility */}
          <div
            className="absolute inset-x-0 top-0 h-32 z-[5] pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)'
            }}
          />

          {/* Diagonal Scrim Gradient - Bottom Left */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: 'linear-gradient(to top right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)'
            }}
          />

          {/* Content Overlay Layer */}
          <div className="container mx-auto px-4 absolute inset-0 flex flex-col pt-20 pointer-events-none z-10">
            {/* Breadcrumbs - Fixed at top */}
            <div className="pb-4 pointer-events-auto flex-none">
              <Breadcrumb
                variant="overlay"
                items={[
                  { label: 'Home', href: '/' },
                  { label: config.itemNamePlural, href: config.route as string },
                  { label: itemTitle, current: true },
                ]}
              />
            </div>

            {/* Centered Content */}
            <div className="flex-1 flex flex-col justify-end items-start max-w-3xl pointer-events-auto pb-8">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {(item as any).category && (
                  <Tag variant="category" className="bg-blue-500/10 text-blue-300 border-blue-500/20 backdrop-blur-sm">
                    {(item as any).category}
                  </Tag>
                )}
                {(item as any).audienceLevel && (
                  <Tag variant="audience" className="bg-purple-500/10 text-purple-300 border-purple-500/20 backdrop-blur-sm">
                    {(item as any).audienceLevel}
                  </Tag>
                )}
                {(item as any).levelTag && (
                  <Tag variant="level" className="bg-white/10 text-gray-200 border-white/10 backdrop-blur-sm">
                    {(item as any).levelTag}
                  </Tag>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
                {itemTitle}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm mb-6">
                <CourseMeta
                  duration={item.duration}
                  lessonCount={item.lessonCount}
                  className="text-white/90 font-medium text-sm"
                />
              </div>

              {/* Description with Collapse Animation */}
              <div
                className={`overflow-hidden transition-all duration-1000 ease-in-out ${showDescription ? 'max-h-[300px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-4'}`}
                onMouseEnter={() => setShowDescription(true)}
              >
                <p className="text-white text-base leading-relaxed max-w-2xl font-light drop-shadow-md">
                  {itemDescription && itemDescription.split(' ').length > 25
                    ? itemDescription.split(' ').slice(0, 25).join(' ') + '...'
                    : itemDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto mt-2">
                <EnrollmentButton
                  course={item}
                  onEnrollmentSuccess={handlePrimaryAction}
                  className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-bold text-base rounded-xl shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1"
                />
                <button
                  className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                >
                  <Share2Icon size={20} />
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div
              className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none transition-all duration-500 ${showScrollIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <div className="animate-bounce">
                <ChevronDown size={32} className="text-white/70 drop-shadow-md" />
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
                <EnrollmentButton
                  course={item}
                  onEnrollmentSuccess={handlePrimaryAction}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                />
              </div>
            ) : undefined}
          />
        </div>

        {/* Main content area - full width */}
        <div
          ref={mainContentRef}
          className="container mx-auto px-4 md:px-6 max-w-7xl py-8"
        >
          {/* Tab Content - Full width */}
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
                  <CourseTile
                    title={relatedItem.title}
                    description={relatedItem.description}
                    thumbnailUrl={relatedItem.heroImageUrl || relatedItem.thumbnailUrl}
                    videoUrl={relatedItem.introVideoUrl}
                    category={relatedItem.category}
                    levelTag={relatedItem.levelTag}
                    audienceLevel={relatedItem.audienceLevel}
                    duration={relatedItem.duration}
                    lessonCount={relatedItem.lessonCount}
                    rating={relatedItem.rating}
                    reviewCount={relatedItem.reviewCount}
                    variant={relatedItem.isComingSoon ? "coming-soon" : "course"}
                    onCardClick={relatedItem.isComingSoon ? undefined : () => {
                      navigate(`/courses/${relatedItem.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
                    {item.price || "Free"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.duration || item.serviceType || ""}
                  </div>
                </div>
                <EnrollmentButton
                  course={item}
                  onEnrollmentSuccess={handlePrimaryAction}
                  className="flex-1 px-4 py-3 text-white font-bold rounded-md bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-colors shadow-md"
                />
              </div>
            </div>
          )
        }
      </main>
      <Footer isLoggedIn={false} />
    </div>
  );
};


export default CourseDetailsPage;
