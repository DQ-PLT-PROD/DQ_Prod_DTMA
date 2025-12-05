import React, { useState } from "react";
import {
  PageLayout,
  PageSection,
  SectionHeader,
  SectionContent,
  PrimaryButton,
} from "../../../components/PageLayout";
import { NotificationCenter } from "../../../components/Header/notifications/NotificationCenter";
import { OnboardingProgress } from "./OnboardingProgress";
import { MetricsOverview } from "./MetricsOverview";
import { ServiceRequestsTable } from "./ServiceRequestsTable";
import { ObligationsDeadlines } from "./ObligationsDeadlines";
import { QuickActions } from "./QuickActions";
import { Announcements } from "./Announcements";
import { BurgerMenuButton } from '../../../components/Sidebar';
export const Overview: React.FC<{
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
}> = ({
  setIsOpen,
  isLoggedIn
}: {
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [showNotificationCenter, setShowNotificationCenter] = useState(false);
    // Mock onboarding progress data
    const onboardingData = {
      profileCompletion: 75,
      documentCompletion: 60,
      overallCompletion: 68,
    };
    // Handle retry if data loading fails
    const handleRetry = () => {
      setIsLoading(true);
      setHasError(false);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };
    // Handle new request button click
    const handleNewRequest = () => {
      // Use hash navigation for better reliability
      window.location.href = "/#services-marketplaces";
    };

    // Handle view all announcements click
    const handleViewAllAnnouncements = () => {
      setShowNotificationCenter(true);
    };

    // Close notification center
    const closeNotificationCenter = () => {
      setShowNotificationCenter(false);
    };
    if (hasError) {
      return (
        <PageLayout title="Dashboard Overview">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Unable to load dashboard data
            </h3>
            <p className="text-gray-600 mb-6">
              We encountered an issue while loading your dashboard. Please try
              again.
            </p>
            <PrimaryButton onClick={handleRetry}>Retry</PrimaryButton>
          </div>
        </PageLayout>
      );
    }
    return (
      <>

        <PageLayout
          title="Dashboard Overview"
          headerClassName="pt-4 pb-4 pl-0.5"
          titleClassName="text-3xl font-bold text-gray-900"
          setIsOpen={setIsOpen}
          isLoggedIn={isLoggedIn}
        >

          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 ml-4">
              Your central view of business status, requests, and upcoming
              obligations.
            </p>
          </div>
          {/* New Dashboard Layout Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width on desktop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Setup Card or Metrics Card (conditional) */}
              {onboardingData.overallCompletion < 80 ? (
                <PageSection>
                  <OnboardingProgress
                    profileCompletion={onboardingData.profileCompletion}
                    documentCompletion={onboardingData.documentCompletion}
                    overallCompletion={onboardingData.overallCompletion}
                    isLoading={isLoading}
                  />
                </PageSection>
              ) : (
                <PageSection>
                  <SectionHeader title="Key Metrics">
                    <p className="text-sm text-gray-500 mt-1">
                      Overview of Your Business Performance Indicators
                    </p>
                  </SectionHeader>
                  <SectionContent>
                    <MetricsOverview isLoading={isLoading} />
                  </SectionContent>
                </PageSection>
              )}
              {/* Obligations & Deadlines */}
              <PageSection>
                <SectionHeader title="Reporting Obligations">
                  <h3 className="text-lg font-semibold text-gray-800 mt-4 px-6">
                    Track Important Deadlines and Required Actions
                  </h3>
                </SectionHeader>
                <SectionContent>
                  <ObligationsDeadlines isLoading={isLoading} />
                </SectionContent>
              </PageSection>
              {/* Service Requests Table */}
              <PageSection>
                <SectionHeader title="Recent Service Requests">
                  <h3 className="text-lg font-semibold text-gray-800 mt-4 px-6">
                    View and Manage Your Recent Service Requests
                  </h3>
                </SectionHeader>
                <SectionContent>
                  <ServiceRequestsTable isLoading={isLoading} />
                </SectionContent>
              </PageSection>
            </div>
            {/* Right Column - 1/3 width on desktop */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <PageSection>
                <SectionHeader title="Quick Actions">
                  <h3 className="text-lg font-semibold text-gray-800 mt-4 px-6">
                    Common Tasks and Shortcuts for Your Business
                  </h3>
                </SectionHeader>
                <SectionContent>
                  <QuickActions />
                </SectionContent>
              </PageSection>
              {/* Announcements - Taller to match combined height */}
              <PageSection className="lg:flex-grow">
                <SectionHeader title="Announcements">
                  <h3 className="text-lg font-semibold text-gray-800 mt-4 px-6">
                    Important Updates and Notifications
                  </h3>
                </SectionHeader>
                <SectionContent>
                  <Announcements
                    isLoading={isLoading}
                    onViewAllClick={handleViewAllAnnouncements}
                  />
                </SectionContent>
              </PageSection>
            </div>
          </div>

          {/* Notification Center Modal */}
          {showNotificationCenter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={closeNotificationCenter}
              ></div>
              <div className="relative bg-white shadow-xl rounded-lg max-w-2xl w-full max-h-[90vh] m-4 transform transition-all duration-300">
                <NotificationCenter onBack={closeNotificationCenter} />
              </div>
            </div>
          )}
        </PageLayout>
      </>
    );
  };
