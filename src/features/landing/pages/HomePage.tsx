import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import HeroSection from '../HeroSection';
import ProofAndTrust from '../ProofAndTrust';
import D6CategoriesSection from '../D6CategoriesSection';
import HowYouLearn from '../HowYouLearn';
import Home from '../Home';
import CallToAction from '../CallToAction';
import KhalifaFundAttribution from '../KhalifaFundAttribution';
import { PageLoader } from '@/components/loading';

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
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-gray-50 relative scroll-smooth">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                    transparent={true}
                />
            </div>

            <main>
                {/* Hero Section */}
                <section className="h-screen w-full snap-start relative">
                    <HeroSection />
                </section>

                {/* Proof & Trust */}
                <section className="min-h-screen w-full snap-start flex flex-col justify-center relative bg-gray-50">
                    <ProofAndTrust />
                </section>

                {/* Categories */}
                <section className="min-h-screen w-full snap-start flex flex-col justify-center relative bg-white">
                    <D6CategoriesSection />
                </section>

                {/* How You Learn */}
                <section className="min-h-screen w-full snap-start flex flex-col justify-center relative bg-[#f7f9fc]">
                    <HowYouLearn />
                </section>

                {/* Featured Courses (Home component) */}
                <section className="min-h-screen w-full snap-start flex flex-col justify-center relative bg-gray-50">
                    <Home />
                </section>

                {/* CTA & Footer */}
                {/* Combine CTA and Footer or separate? Footer is usually small. snap-start for footer? */}
                <section className="min-h-screen w-full snap-start flex flex-col justify-between relative bg-white">
                    <div className="flex-grow flex flex-col justify-center">
                        <CallToAction />
                    </div>
                    <div className="w-full">
                        <Footer isLoggedIn={false} />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;
