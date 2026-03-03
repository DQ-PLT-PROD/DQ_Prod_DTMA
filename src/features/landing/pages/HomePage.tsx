import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroSection from "../components/HeroSection";
import AboutDTMA from "../components/AboutDTMA";
import FeaturedCourses from "../components/FeaturedCourses";
import WhyChooseUs from "../components/WhyChooseUs";
import ExpertInstructors from "../components/ExpertInstructors";
import TrustedPartners from "../components/TrustedPartners";
import HowYouLearn from "../components/HowYouLearn";
import CallToAction from "../components/CallToAction";
import { AIWidgetStandalone } from "@/lib/ai-widget";

/**
 * Shared Tailwind classes for every non-hero section wrapper.
 *
 * min-h-screen          — section fills at least the full viewport
 * flex flex-col         — enables vertical centring of content
 * justify-center        — vertically centres content within the viewport
 * snap-start            — scroll-snap anchor at the top of each section
 * scroll-mt-16          — 64px snap offset so content clears the fixed header
 *                         (matches --header-h: 64px defined in index.css)
 */
const SECTION =
  "min-h-screen w-full flex flex-col justify-center snap-start scroll-mt-16";

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /**
     * Scroll container:
     *   snap-y snap-mandatory — one section per scroll gesture on desktop
     *   overflow-y-auto       — the page's scrollable root
     *
     * To disable snapping sitewide, remove "snap-y snap-mandatory" here.
     */
    <div className="h-screen w-full overflow-y-auto bg-gray-50 relative snap-y snap-mandatory">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          transparent={true}
        />
      </div>

      <main>
        {/* ── Section 1 — Hero ───────────────────────────────────────────────────
            Full-screen: transparent header overlays the hero image naturally.
            snap-start without scroll-mt so it always anchors to the very top.   */}
        <section className="h-screen w-full relative snap-start">
          <HeroSection />
        </section>

        {/* ── Section 2 — About DTMA ─────────────────────────────────────────── */}
        <section className={`${SECTION} bg-white`}>
          <AboutDTMA />
        </section>

        {/* ── Section 3 — Featured Courses ───────────────────────────────────── */}
        <section className={`${SECTION} bg-gray-50`}>
          <FeaturedCourses />
        </section>

        {/* ── Section 4 — Why Choose Us ──────────────────────────────────────── */}
        <section className={`${SECTION} bg-white`}>
          <WhyChooseUs />
        </section>

        {/* ── Section 5 — Expert Instructors ─────────────────────────────────── */}
        <section className="w-full snap-start scroll-mt-16 bg-gray-50">
          <ExpertInstructors />
        </section>

        {/* ── Section 6 — Trusted Partners ───────────────────────────────────── */}
        <section className="w-full snap-start scroll-mt-16 bg-white">
          <TrustedPartners />
        </section>

        {/* ── Section 7 — How Learning Works ───────────────────────────────── */}
        <section className={`${SECTION} bg-gray-50`}>
          <HowYouLearn />
        </section>

        {/* ── Section 8 — CTA + Footer ──────────────────────────────────────── */}
        <section className="min-h-screen w-full flex flex-col justify-between snap-start scroll-mt-16 bg-white relative">
          <div className="flex-grow flex flex-col justify-center">
            <CallToAction />
          </div>
          <div className="w-full">
            <Footer isLoggedIn={false} />
          </div>
        </section>
      </main>

      {/* AI Widget */}
      <AIWidgetStandalone />
    </div>
  );
};

export default HomePage;
