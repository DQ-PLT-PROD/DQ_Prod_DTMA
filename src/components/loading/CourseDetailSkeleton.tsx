import React from 'react';
import { PageContainer } from "../layouts/PageContainer";
import { Header } from "../Header";
import { Footer } from "../Footer";

export const CourseDetailSkeleton: React.FC = () => {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Header
                sidebarOpen={false}
                toggleSidebar={() => { }}
                transparent={true}
            />

            {/* Hero Skeleton Matches the real Hero layout */}
            <div className="w-full relative h-screen min-h-[600px] overflow-hidden bg-gray-900">
                <div className="absolute inset-0 animate-pulse bg-gray-800"></div>

                <PageContainer className="absolute inset-0 flex flex-col pt-20 z-10">
                    {/* Breadcrumb Skeleton */}
                    <div className="flex space-x-2 mb-8 animate-pulse">
                        <div className="h-4 w-12 bg-white/20 rounded"></div>
                        <div className="h-4 w-4 bg-white/20 rounded"></div>
                        <div className="h-4 w-24 bg-white/20 rounded"></div>
                        <div className="h-4 w-4 bg-white/20 rounded"></div>
                        <div className="h-4 w-32 bg-white/20 rounded"></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end items-start max-w-3xl pb-8">
                        {/* Badges Skeleton */}
                        <div className="flex flex-wrap items-center gap-3 mb-6 animate-pulse">
                            <div className="h-8 w-24 bg-white/20 rounded-full"></div>
                            <div className="h-8 w-20 bg-white/20 rounded-full"></div>
                        </div>

                        {/* Title Skeleton */}
                        <div className="space-y-3 mb-6 w-full animate-pulse">
                            <div className="h-10 w-3/4 bg-white/20 rounded"></div>
                            <div className="h-10 w-1/2 bg-white/20 rounded"></div>
                        </div>

                        {/* Meta Skeleton */}
                        <div className="flex flex-wrap items-center gap-6 mb-6 animate-pulse">
                            <div className="h-5 w-24 bg-white/20 rounded"></div>
                            <div className="h-5 w-24 bg-white/20 rounded"></div>
                        </div>

                        {/* Description Skeleton */}
                        <div className="space-y-2 mb-8 w-full max-w-2xl animate-pulse">
                            <div className="h-4 w-full bg-white/20 rounded"></div>
                            <div className="h-4 w-full bg-white/20 rounded"></div>
                            <div className="h-4 w-2/3 bg-white/20 rounded"></div>
                        </div>

                        {/* Buttons Skeleton */}
                        <div className="flex gap-3 w-full sm:w-auto mt-2 animate-pulse">
                            <div className="h-12 w-40 bg-white/20 rounded-xl"></div>
                            <div className="h-12 w-12 bg-white/20 rounded-xl"></div>
                        </div>
                    </div>
                </PageContainer>
            </div>

            <Footer isLoggedIn={false} />
        </div>
    );
};
