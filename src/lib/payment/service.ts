/**
 * Payment Service - Thin payment integration for DTMA Spec (Jan 29)
 * 
 * Scope: STRICTLY THIN
 * - Plan selection
 * - Payment redirect initiation
 * - Success/cancel redirect handling
 * 
 * Out of Scope:
 * - Webhooks
 * - Subscription lifecycle sync
 * - Invoice storage
 * - Refunds, proration, coupons
 */

import {
    createCheckoutSession,
    verifyCheckoutSession,
    isStripeConfigured,
    mockStripeCheckout,
    mockVerifySession,
    CreateCheckoutSessionParams
} from './stripe';

// Use mock mode if Stripe is not configured
const USE_MOCK_MODE = !isStripeConfigured();

export interface PaymentPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'one-time' | 'monthly' | 'yearly';
    features: string[];
}

export interface PaymentRedirectParams {
    planId: string;
    courseSlug: string;
    userId: string;
    userEmail?: string;
    successUrl: string;
    cancelUrl: string;
}

export interface PaymentResult {
    success: boolean;
    redirectUrl?: string;
    error?: string;
}

/**
 * Available payment plans
 * For MVP, we support free and paid plans
 */
export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
    free: {
        id: 'free',
        name: 'Free Access',
        description: 'Access to preview content only',
        price: 0,
        currency: 'USD',
        interval: 'one-time',
        features: [
            'Preview lessons',
            'Course overview',
            'Community access',
        ],
    },
    premium: {
        id: 'premium',
        name: 'Premium Access',
        description: 'Full course access with all features',
        price: 99,
        currency: 'USD',
        interval: 'one-time',
        features: [
            'All course content',
            'Downloadable resources',
            'Certificate of completion',
            'Priority support',
            'Lifetime access',
        ],
    },
    subscription: {
        id: 'subscription',
        name: 'Monthly Subscription',
        description: 'Access to all courses',
        price: 29,
        currency: 'USD',
        interval: 'monthly',
        features: [
            'All courses',
            'New courses added monthly',
            'All premium features',
            'Cancel anytime',
        ],
    },
};

/**
 * Get plan by ID
 */
export const getPlan = (planId: string): PaymentPlan | null => {
    return PAYMENT_PLANS[planId] || null;
};

/**
 * Get all available plans
 */
export const getAllPlans = (): PaymentPlan[] => {
    return Object.values(PAYMENT_PLANS);
};

/**
 * Initiate payment redirect to Stripe Checkout
 * Spec requirement: Redirect to payment provider
 * 
 * For MVP, this creates a Stripe Checkout session and returns redirect URL
 */
export const initiatePayment = async (
    params: PaymentRedirectParams
): Promise<PaymentResult> => {
    const { planId, courseSlug, userId, userEmail, successUrl, cancelUrl } = params;

    // Validate plan exists
    const plan = getPlan(planId);
    if (!plan) {
        return {
            success: false,
            error: 'Invalid plan selected',
        };
    }

    // Free plan doesn't require payment
    if (plan.price === 0) {
        return {
            success: true,
            redirectUrl: successUrl,
        };
    }

    try {
        console.log('💳 Initiating payment for plan:', plan.name);

        // Use mock mode if Stripe not configured
        const checkoutFn = USE_MOCK_MODE ? mockStripeCheckout : createCheckoutSession;

        const result = await checkoutFn({
            planId,
            plan,
            courseSlug,
            userId,
            userEmail,
            successUrl,
            cancelUrl,
        });

        if (!result.success || !result.session) {
            return {
                success: false,
                error: result.error || 'Failed to create payment session',
            };
        }

        console.log('✅ Payment session created:', result.session.id);

        return {
            success: true,
            redirectUrl: result.session.url,
        };
    } catch (error) {
        console.error('Error initiating payment:', error);
        return {
            success: false,
            error: 'Failed to initiate payment. Please try again.',
        };
    }
};

/**
 * Handle payment success redirect
 * Spec requirement: Success redirect handling
 * 
 * Called when user returns from successful payment
 */
export const handlePaymentSuccess = async (
    sessionId: string,
    userId: string,
    courseSlug: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('✅ Handling payment success:', { sessionId, userId, courseSlug });

        // Verify payment with Stripe
        const verifyFn = USE_MOCK_MODE ? mockVerifySession : verifyCheckoutSession;
        const verification = await verifyFn(sessionId);

        if (!verification.success || !verification.paid) {
            return {
                success: false,
                error: verification.error || 'Payment not completed'
            };
        }

        console.log('✅ Payment verified successfully');
        return { success: true };
    } catch (error) {
        console.error('Error handling payment success:', error);
        return {
            success: false,
            error: 'Failed to verify payment',
        };
    }
};

/**
 * Handle payment cancellation redirect
 * Spec requirement: Cancel redirect handling
 * 
 * Called when user cancels payment
 */
export const handlePaymentCancel = async (
    sessionId: string
): Promise<{ success: boolean }> => {
    // Log cancellation for analytics
    console.log('Payment cancelled:', { sessionId });

    // No action needed for cancellation
    return { success: true };
};

/**
 * Check if course requires payment
 */
export const courseRequiresPayment = (courseSlug: string): boolean => {
    // For MVP, all courses are free
    // This can be extended to check course pricing in database
    return false;
};

/**
 * Get recommended plan for a course
 */
export const getRecommendedPlan = (courseSlug: string): PaymentPlan => {
    // For MVP, recommend free plan
    // This can be extended based on course metadata
    return PAYMENT_PLANS.free;
};
