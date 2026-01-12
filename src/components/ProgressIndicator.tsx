import React, { useRef } from 'react';
import { CheckIcon, ChevronRightIcon, ChevronDownIcon, XIcon, CheckCircleIcon } from 'lucide-react';

export function ProgressIndicator({
    steps,
    currentStep,
    showStepsDropdown,
    autoSaving,
    progressSaved,
    onToggleDropdown,
    onJumpToStep,
    getStepCompletionStatus,
}) {
    const stepsDropdownRef = useRef(null);

    const MobileStepper = () => (
        <div className="md:hidden">
            <div className="flex justify-between items-center mb-5">
                <div>
                    <div className="text-sm font-medium text-gray-600">
                        Step {currentStep + 1} of {steps.length}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mt-1">
                        {steps[currentStep].title}
                    </div>
                </div>
                <button
                    type="button"
                    className="flex items-center text-blue-600 text-sm font-medium"
                    onClick={onToggleDropdown}
                >
                    {showStepsDropdown ? (
                        <>
                            <XIcon size={16} className="mr-1" />
                            Close
                        </>
                    ) : (
                        <>
                            All Steps
                            <ChevronDownIcon size={16} className="ml-1" />
                        </>
                    )}
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-200 rounded-full mb-5">
                <div
                    className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
            </div>

            {/* Steps dropdown */}
            {showStepsDropdown && (
                <div
                    className="absolute top-[140px] left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg max-h-[50vh] overflow-y-auto"
                    ref={stepsDropdownRef}
                >
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="font-medium text-gray-700">All Steps</h4>
                        <button onClick={onToggleDropdown} className="text-gray-500">
                            <XIcon size={18} />
                        </button>
                    </div>
                    <div className="py-2">
                        {steps.map((step, index) => {
                            const isComplete = getStepCompletionStatus(index);
                            const isCurrent = currentStep === index;

                            return (
                                <button
                                    key={step.id}
                                    className={`w-full text-left px-4 py-3 flex items-center ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        } border-b border-gray-100`}
                                    onClick={() => onJumpToStep(index)}
                                >
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${isCurrent
                                            ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                                            : isComplete
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {isComplete && !isCurrent ? (
                                            <CheckIcon size={16} />
                                        ) : (
                                            <span>{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {step.title}
                                        </div>
                                        {step.sections && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {step.sections.map(section => section.title).join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                    {isCurrent && (
                                        <div className="text-blue-600 ml-2">
                                            <ChevronRightIcon size={16} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const DesktopStepper = () => (
        <div className="hidden md:block mb-10">
            <div className="grid grid-cols-7 gap-1">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center relative">
                        <div
                            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${index < currentStep
                                ? 'bg-blue-500 text-white'
                                : index === currentStep
                                    ? 'bg-white border-2 border-blue-500 text-blue-500'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {index < currentStep ? (
                                <CheckIcon size={18} />
                            ) : (
                                step.icon || <span>{index + 1}</span>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="hidden sm:block absolute h-[2px] bg-gray-200 top-6 w-full left-1/2 -z-10">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: index < currentStep ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                        <span className="text-xs mt-2 font-medium text-gray-600 text-center">
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            <div className="relative mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full">
                    <div
                        className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                    Step {currentStep + 1} of {steps.length}
                </span>
                {(autoSaving || progressSaved) && (
                    <div className={`flex items-center text-sm ${progressSaved ? 'text-green-600' : 'text-gray-500'}`}>
                        {autoSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-500 border-t-transparent mr-1.5" />
                                Auto-saving...
                            </>
                        ) : progressSaved ? (
                            <>
                                <CheckCircleIcon size={14} className="mr-1" />
                                Progress saved
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <DesktopStepper />
            <MobileStepper />
        </>
    );
}
