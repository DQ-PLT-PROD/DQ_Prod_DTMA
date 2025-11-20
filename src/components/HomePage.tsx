import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import HeroSection from './HeroSection';
import ProofAndTrust from './ProofAndTrust';
import D6CategoriesSection from './D6CategoriesSection';
import EnterpriseStages from './EnterpriseStages';
import Home from './Home';
import CallToAction from './CallToAction';
import KhalifaFundAttribution from './KhalifaFundAttribution';
import { BRAND_GRADIENT, BRAND_BACKDROP_BLUR, BRAND_PRIMARY } from '../constants/branding';

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
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          background: BRAND_GRADIENT,
          backdropFilter: BRAND_BACKDROP_BLUR,
          WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: BRAND_PRIMARY,
              borderTopColor: "transparent",
            }}
          ></div>
          <h2 className="text-white text-xl font-bold">
            Loading Digital Worker Academy
          </h2>
          <p className="text-blue-200 mt-2">
            Your gateway to AI-era leadership and skills
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen} 
      />
      <main className="flex-grow">
        <HeroSection />
        <ProofAndTrust />
        <D6CategoriesSection />
        <CallToAction />
        <EnterpriseStages />
        <Home />
      </main>
      <Footer isLoggedIn={false} />
      {/* <KhalifaFundAttribution /> */}
    </div>
  );
};

export default HomePage;
