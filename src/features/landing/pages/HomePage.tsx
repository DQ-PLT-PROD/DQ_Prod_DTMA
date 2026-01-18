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
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
            />
            <main className="flex-grow">
                <HeroSection />
                <ProofAndTrust />
                <D6CategoriesSection />
                <HowYouLearn />

                <Home />
                <CallToAction />
            </main>
            <Footer isLoggedIn={false} />
            {/* <KhalifaFundAttribution /> */}
        </div>
    );
};

export default HomePage;
