import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import HeroSection from "../features/landing/HeroSection";
import ProofAndTrust from "../features/landing/ProofAndTrust";
import D6CategoriesSection from "../features/landing/D6CategoriesSection";
import HowYouLearn from "../features/landing/HowYouLearn";
import PublicLandingPage from "../features/landing/PublicLandingPage";
import CallToAction from "../features/landing/CallToAction";
import KhalifaFundAttribution from "../features/landing/KhalifaFundAttribution";
import { PageLoader } from "./loading";

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading Digital Worker Academy"
        subMessage="Your gateway to AI-era leadership and skills"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--md-background)]">
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <main className="flex-grow">
        <HeroSection />
        <ProofAndTrust />
        <D6CategoriesSection />
        <HowYouLearn />

        {/* Dev D Feature D1: Public Landing Page with Featured Courses */}
        <PublicLandingPage />

        <CallToAction />
      </main>
      <Footer isLoggedIn={false} />
      {/* <KhalifaFundAttribution /> */}
    </div>
  );
};

export default HomePage;
