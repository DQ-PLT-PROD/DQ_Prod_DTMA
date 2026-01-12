import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, SaveIcon } from 'lucide-react';

export function StepNavigation({
    currentStep,
    totalSteps,
    loading,
    isRevisit,
    savingProgress,
    onPrevious,
    onNext,
    onSaveProgress,
    onSubmit,
}) {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const isRegularStep = !isFirstStep && !isLastStep;

    return (
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <button
                type="button"
                onClick={onPrevious}
                disabled={isFirstStep}
                className={`px-5 py-3 rounded-md flex items-center ${isFirstStep
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                <ChevronLeftIcon size={18} className="mr-1.5" />
                Back
            </button>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {isRegularStep && (
                    <button
                        type="button"
                        onClick={onSaveProgress}
                        disabled={savingProgress}
                        className={`w-full sm:w-auto order-2 sm:order-1 px-5 py-3 text-blue-600 border border-blue-200 bg-white rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center ${savingProgress ? 'opacity-70 cursor-wait' : ''
                            }`}
                    >
                        {savingProgress ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-1.5" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SaveIcon size={16} className="mr-1.5" />
                                Save Progress
                            </>
                        )}
                    </button>
                )}

                {!isLastStep ? (
                    <button
                        type="button"
                        onClick={onNext}
                        className="w-full sm:w-auto order-1 sm:order-2 px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
                    >
                        Continue
                        <ChevronRightIcon size={18} className="ml-1.5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading}
                        className={`w-full sm:w-auto order-1 sm:order-2 px-5 py-3 ${isRevisit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                            } text-white rounded-md flex items-center justify-center transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
                                Completing...
                            </>
                        ) : isRevisit ? (
                            'Return to Dashboard'
                        ) : (
                            <>
                                <SaveIcon size={18} className="mr-1.5" />
                                Complete Onboarding
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
