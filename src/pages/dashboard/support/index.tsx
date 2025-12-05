import { Sidebar, HomeIcon, ChevronRightIcon, LifeBuoyIcon, ChevronLeftIcon } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { Footer } from '../../../components/Footer';
import { AuthProvider, Header } from '../../../components/Header';
import { PageLayout, PageSection, SectionHeader, PrimaryButton, SectionContent } from '../../../components/PageLayout';
import ContactSupportTab from '../../../components/support/ContactSupportTab';
import DocumentationTab from '../../../components/support/DocumentationTab';
import FAQsTab from '../../../components/support/FAQsTab';
import TicketHistoryTab from '../../../components/support/TicketHistoryTab';
import { BurgerMenuButton } from '../../../components/Sidebar';

export default function SupportPage({
    setIsOpen,
    isLoggedIn
}: {
    setIsOpen?: (isOpen: boolean) => void;
    isLoggedIn?: boolean;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeResourceTab, setActiveResourceTab] = useState('faqs');
    const [activeContactTab, setActiveContactTab] = useState('contact');
    const [showTabControls, setShowTabControls] = useState(false);
    const resourceTabsRef = useRef<HTMLDivElement>(null);
    const contactTabsRef = useRef<HTMLDivElement>(null);
    // Check if tabs container needs scroll controls
    const checkTabsOverflow = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            const { scrollWidth, clientWidth } = ref.current;
            return scrollWidth > clientWidth;
        }
        return false;
    };
    // Handle window resize to check if tab controls should be shown
    useEffect(() => {
        const handleResize = () => {
            setShowTabControls(
                checkTabsOverflow(resourceTabsRef) || checkTabsOverflow(contactTabsRef),
            );
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Scroll tabs horizontally
    const scrollTabs = (
        ref: React.RefObject<HTMLDivElement>,
        direction: 'left' | 'right',
    ) => {
        if (ref.current) {
            const scrollAmount = 150;
            const scrollPosition =
                direction === 'left'
                    ? ref.current.scrollLeft - scrollAmount
                    : ref.current.scrollLeft + scrollAmount;
            ref.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
        }
    };
    // Create sticky tab state for mobile view
    const [isSticky, setIsSticky] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            const tabsSection = document.getElementById('resource-tabs-section');
            if (tabsSection) {
                const tabsSectionTop = tabsSection.getBoundingClientRect().top;
                setIsSticky(tabsSectionTop <= 0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">

                <div className="flex flex-1">
                    <div className="flex-1 w-full">
                        {/* Breadcrumbs */}

                        {/* Sticky mobile tab navigation */}
                        {isSticky && (
                            <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-sm md:hidden">
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <div className="font-medium text-gray-900">
                                        Support Resources
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setActiveResourceTab('faqs')}
                                            className={`px-3 py-1 text-sm rounded-full ${activeResourceTab === 'faqs' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}`}
                                        >
                                            FAQs
                                        </button>
                                        <button
                                            onClick={() => setActiveResourceTab('documentation')}
                                            className={`px-3 py-1 text-sm rounded-full ${activeResourceTab === 'documentation' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}`}
                                        >
                                            Docs
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <PageLayout
                            title="Support"
                            headerClassName="pt-4 pb-4 pl-0.5"
                            titleClassName="text-3xl font-bold text-gray-900"
                            setIsOpen={setIsOpen}
                            isLoggedIn={isLoggedIn}
                        >
                            {/* Support Resources Section */}
                            <PageSection>
                                <SectionHeader
                                    title="Support Resources"
                                    description="Access frequently asked questions and documentation to help you get the most out of our platform."
                                    actions={
                                        <PrimaryButton
                                            onClick={() =>
                                                (window.location.href = '#contact-support')
                                            }
                                            className="hidden sm:flex"
                                        >
                                            <LifeBuoyIcon className="h-4 w-4 mr-2" />
                                            Contact Support
                                        </PrimaryButton>
                                    }
                                />
                                <SectionContent className="p-0">
                                    {/* Tabs */}
                                    <div
                                        className="border-b border-gray-200 relative"
                                        id="resource-tabs-section"
                                    >
                                        <div className="px-4 sm:px-6 pt-4 flex items-center">
                                            {showTabControls && (
                                                <button
                                                    onClick={() => scrollTabs(resourceTabsRef, 'left')}
                                                    className="md:hidden flex-shrink-0 h-8 w-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center mr-2"
                                                    aria-label="Scroll tabs left"
                                                >
                                                    <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
                                                </button>
                                            )}
                                            <div
                                                ref={resourceTabsRef}
                                                className="flex space-x-6 overflow-x-auto"
                                                style={{
                                                    scrollbarWidth: 'none',
                                                    msOverflowStyle: 'none',
                                                }}
                                            >
                                                <style jsx>{`
                          div::-webkit-scrollbar {
                            display: none;
                          }
                        `}</style>
                                                <button
                                                    onClick={() => setActiveResourceTab('faqs')}
                                                    className={`relative flex items-center py-4 px-1 border-b-2 whitespace-nowrap ${activeResourceTab === 'faqs' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                                >
                                                    <span className="text-sm sm:text-base">
                                                        Frequently Asked Questions
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveResourceTab('documentation')}
                                                    className={`relative flex items-center py-4 px-1 border-b-2 whitespace-nowrap ${activeResourceTab === 'documentation' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                                >
                                                    <span className="text-sm sm:text-base">
                                                        Documentation & Guides
                                                    </span>
                                                </button>
                                            </div>
                                            {showTabControls && (
                                                <button
                                                    onClick={() => scrollTabs(resourceTabsRef, 'right')}
                                                    className="md:hidden flex-shrink-0 h-8 w-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center ml-2"
                                                    aria-label="Scroll tabs right"
                                                >
                                                    <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Tab Content */}
                                    <div className="p-4 sm:p-6">
                                        {activeResourceTab === 'faqs' && <FAQsTab />}
                                        {activeResourceTab === 'documentation' && (
                                            <DocumentationTab />
                                        )}
                                    </div>

                                    <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-200 p-4">
                                        <a
                                            href="/documentation"
                                            className="flex items-center justify-center w-full py-2 px-4 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50"
                                        >
                                            View All FAQs & Documentation
                                            <ChevronRightIcon className="ml-1 h-4 w-4" />
                                        </a>
                                    </div>
                                </SectionContent>
                            </PageSection>
                            {/* Contact & Support Tickets Section */}
                            <PageSection id="contact-support">
                                <SectionHeader
                                    title="Contact & Support"
                                    description="Get in touch with our support team or view your support ticket history."
                                />
                                <SectionContent className="p-0">
                                    {/* Tabs */}
                                    <div className="border-b border-gray-200 relative">
                                        <div className="px-4 sm:px-6 pt-4 flex items-center">
                                            {showTabControls && (
                                                <button
                                                    onClick={() => scrollTabs(contactTabsRef, 'left')}
                                                    className="md:hidden flex-shrink-0 h-8 w-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center mr-2"
                                                    aria-label="Scroll tabs left"
                                                >
                                                    <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
                                                </button>
                                            )}
                                            <div
                                                ref={contactTabsRef}
                                                className="flex space-x-6 overflow-x-auto"
                                                style={{
                                                    scrollbarWidth: 'none',
                                                    msOverflowStyle: 'none',
                                                }}
                                            >
                                                <style jsx>{`
                          div::-webkit-scrollbar {
                            display: none;
                          }
                        `}</style>
                                                <button
                                                    onClick={() => setActiveContactTab('contact')}
                                                    className={`relative flex items-center py-4 px-1 border-b-2 whitespace-nowrap ${activeContactTab === 'contact' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                                >
                                                    <span className="text-sm sm:text-base">
                                                        Submit a Request
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveContactTab('history')}
                                                    className={`relative flex items-center py-4 px-1 border-b-2 whitespace-nowrap opacity-50 cursor-not-allowed ${activeContactTab === 'history' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
                                                    disabled
                                                    title="Available in future release"
                                                >
                                                    <span className="text-sm sm:text-base">
                                                        Ticket History
                                                    </span>
                                                    <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        Coming Soon
                                                    </span>
                                                </button>
                                            </div>
                                            {showTabControls && (
                                                <button
                                                    onClick={() => scrollTabs(contactTabsRef, 'right')}
                                                    className="md:hidden flex-shrink-0 h-8 w-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center ml-2"
                                                    aria-label="Scroll tabs right"
                                                >
                                                    <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Tab Content */}
                                    <div className="p-4 sm:p-6">
                                        {activeContactTab === 'contact' && <ContactSupportTab />}
                                        {activeContactTab === 'history' && <TicketHistoryTab />}
                                    </div>
                                </SectionContent>
                            </PageSection>
                            {/* Mobile: Contact Support button */}
                            <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6">
                                <PrimaryButton
                                    onClick={() => (window.location.href = '#contact-support')}
                                    className="w-full justify-center"
                                >
                                    <LifeBuoyIcon className="h-4 w-4 mr-2" />
                                    Contact Support
                                </PrimaryButton>
                            </div>
                        </PageLayout>
                    </div>
                </div>
            </div>
        </AuthProvider>
    );
}
