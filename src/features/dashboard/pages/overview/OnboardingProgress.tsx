import React from 'react';
interface OnboardingProgressProps {
    profileCompletion: number;
    documentCompletion: number;
    overallCompletion: number;
    isLoading: boolean;
}
export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
    profileCompletion,
    documentCompletion,
    overallCompletion,
    isLoading,
}) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                        <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Complete Your Setup
                        </h3>
                        <span className="text-sm font-medium text-gray-600">
                            {overallCompletion}% Complete
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Complete your profile and upload required documents to access all
                        platform features
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-teal-400 h-3 rounded-full"
                            style={{
                                width: `${overallCompletion}%`,
                            }}
                        ></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Business Profile</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {profileCompletion}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gray-500 h-2 rounded-full"
                                    style={{
                                        width: `${profileCompletion}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    Required Documents
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    {documentCompletion}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gray-500 h-2 rounded-full"
                                    style={{
                                        width: `${documentCompletion}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => window.location.href = '/dashboard/profile'}
                            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Continue Setup
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
