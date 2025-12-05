import { Sidebar, HomeIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Footer } from '../../../components/Footer';
import { AuthProvider, Header } from '../../../components/Header';
import { PageLayout, PageSection, SectionHeader, SectionContent } from '../../../components/PageLayout';
import IntegrationsBillingTab from '../../../components/settings/IntegrationsBillingTab';
import PreferencesNotificationsTab from '../../../components/settings/PreferencesNotificationsTab';
import SecurityComplianceTab from '../../../components/settings/SecurityComplianceTab';
import UserRolesTab from '../../../components/settings/UserRolesTab';
import { BurgerMenuButton } from '../../../components/Sidebar';

export default function SettingsPage({
  setIsOpen,
  isLoggedIn
}: {
  setIsOpen?: (isOpen: boolean) => void;
  isLoggedIn?: boolean;
} = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabs = [{
    id: 'users-roles',
    title: 'Users & Roles',
    completion: 0,
    mandatoryCompletion: {
      percentage: 0
    }
  }, {
    id: 'security-compliance',
    title: 'Security & Compliance',
    completion: 0,
    mandatoryCompletion: {
      percentage: 0
    }
  }, {
    id: 'preferences-notifications',
    title: 'Preferences & Notifications',
    completion: 0,
    mandatoryCompletion: {
      percentage: 0
    }
  }, {
    id: 'integrations-billing',
    title: 'Integrations & Billing',
    completion: 0,
    mandatoryCompletion: {
      percentage: 0
    },
    comingSoon: true
  }];
  const updateScrollButtons = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = tabsRef.current;
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    el.addEventListener('scroll', onScroll);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    const amount = Math.min(280, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0:
        return <UserRolesTab />;
      case 1:
        return <SecurityComplianceTab />;
      case 2:
        return <PreferencesNotificationsTab />;
      case 3:
        return <IntegrationsBillingTab />;
      default:
        return <UserRolesTab />;
    }
  };
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
        <div className="flex flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            {/*  */}

            <PageLayout
              title="Settings"
              headerClassName="pt-4 pb-4 pl-0.5"
              titleClassName="text-3xl font-bold text-gray-900"
              isLoggedIn={isLoggedIn}
              setIsOpen={setIsOpen}
            >
              <PageSection>
                <SectionHeader
                  children={<></>}
                  title="Settings"
                  description="Configure your organization's settings, manage users, and control security preferences."
                />
                <SectionContent className="p-0">
                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    {/* contain the tabs rail */}
                    <div className="px-4 sm:px-6 pt-4 w-full max-w-screen-2xl mx-auto">
                      <div className="relative">
                        {canScrollLeft && (
                          <button
                            type="button"
                            aria-label="Scroll tabs left"
                            onClick={() => scrollTabs('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white shadow ring-1 ring-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canScrollRight && (
                          <button
                            type="button"
                            aria-label="Scroll tabs right"
                            onClick={() => scrollTabs('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white shadow ring-1 ring-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        )}

                        {/* Only the tabs row scrolls; content stays contained */}
                        <div className="overflow-hidden">
                          <div
                            ref={tabsRef}
                            className="flex flex-nowrap items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide px-8"
                            role="tablist"
                            aria-label="Settings tabs"
                          >
                            {tabs.map((tab, index) => (
                              <button
                                key={tab.id}
                                onClick={() => setActiveTabIndex(index)}
                                role="tab"
                                aria-selected={activeTabIndex === index}
                                className={`relative shrink-0 flex-none flex items-center py-3 sm:py-4 px-1 border-b-2 whitespace-nowrap text-sm sm:text-base ${activeTabIndex === index
                                  ? 'border-blue-600 text-blue-600 font-medium'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                  } ${tab.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={tab.comingSoon}
                              >
                                {tab.title}
                                {tab.comingSoon && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    Coming Soon
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 sm:p-6 max-w-full overflow-x-hidden">
                    {renderTabContent()}
                  </div>
                </SectionContent>
              </PageSection>
            </PageLayout>
          </div>
        </div>
      </div>
    </AuthProvider>
  );

}
