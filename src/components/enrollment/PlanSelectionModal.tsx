/**
 * Plan Selection Modal Component
 * Thin payment integration - Plan selection UI
 * Spec requirement: Plan selection (thin)
 */
import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { PaymentPlan, getAllPlans, initiatePayment } from '@/lib/payment';
import { Course } from '../../types/dtma-lms';

interface PlanSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    userId: string;
    onPaymentInitiated?: () => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
    isOpen,
    onClose,
    course,
    userId,
    onPaymentInitiated,
}) => {
    const [selectedPlan, setSelectedPlan] = useState<string>('free');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const plans = getAllPlans();

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        setError(null);
    };

    const handleContinue = async () => {
        if (!selectedPlan) {
            setError('Please select a plan');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const currentUrl = window.location.origin;
            const successUrl = `${currentUrl}/payment/success?courseId=${encodeURIComponent(course.slug || course.id)}`;
            const cancelUrl = `${currentUrl}/courses/${encodeURIComponent(course.id)}?payment=cancelled`;

            const result = await initiatePayment({
                planId: selectedPlan,
                courseSlug: course.slug || course.id,
                userId,
                userEmail: undefined, // Can be added from user profile if available
                successUrl,
                cancelUrl,
            });

            if (result.success && result.redirectUrl) {
                // Redirect to payment provider
                if (onPaymentInitiated) {
                    onPaymentInitiated();
                }
                window.location.href = result.redirectUrl;
            } else {
                setError(result.error || 'Failed to initiate payment');
            }
        } catch (err) {
            console.error('Error initiating payment:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                        <p className="text-sm text-gray-600 mt-1">Select a plan to enroll in "{course.title}"</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isSelected={selectedPlan === plan.id}
                                onSelect={() => handlePlanSelect(plan.id)}
                                disabled={isProcessing}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={isProcessing || !selectedPlan}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Continue to Enrollment'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PlanCardProps {
    plan: PaymentPlan;
    isSelected: boolean;
    onSelect: () => void;
    disabled: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect, disabled }) => {
    const isPopular = plan.id === 'premium';

    return (
        <button
            onClick={onSelect}
            disabled={disabled}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                        RECOMMENDED
                    </span>
                </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                    </div>
                </div>
            )}

            {/* Plan Name */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

            {/* Price */}
            <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                </span>
                {plan.interval !== 'one-time' && (
                    <span className="text-gray-600 ml-2">/ {plan.interval}</span>
                )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            {/* Features */}
            <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </button>
    );
};
