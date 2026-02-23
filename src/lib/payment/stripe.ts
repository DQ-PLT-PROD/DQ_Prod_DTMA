/**
 * Stripe Integration Service
 * Implements thin payment integration per DTMA Spec (Jan 29)
 * 
 * This service handles Stripe Checkout session creation and verification.
 * For MVP, we use Stripe Checkout (hosted payment page) to minimize PCI compliance scope.
 */

import { PaymentPlan } from './service';

// Stripe configuration from environment
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const STRIPE_API_URL = import.meta.env.VITE_STRIPE_API_URL || '/api/stripe';

export interface StripeCheckoutSession {
    id: string;
    url: string;
    status: string;
}

export interface CreateCheckoutSessionParams {
    planId: string;
    plan: PaymentPlan;
    courseSlug: string;
    userId: string;
    userEmail?: string;
    successUrl: string;
    cancelUrl: string;
}

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = (): boolean => {
    return Boolean(STRIPE_PUBLIC_KEY);
};

/**
 * Create Stripe Checkout session
 * This creates a hosted payment page on Stripe
 */
export const createCheckoutSession = async (
    params: CreateCheckoutSessionParams
): Promise<{ success: boolean; session?: StripeCheckoutSession; error?: string }> => {
    if (!isStripeConfigured()) {
        console.warn('Stripe not configured - using mock mode');
        return {
            success: false,
            error: 'Payment system not configured. Please contact support.',
        };
    }

    try {
        // Call backend API to create Stripe Checkout session
        // Backend handles Stripe secret key and session creation
        const response = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId: params.planId,
                priceAmount: params.plan.price * 100, // Convert to cents
                currency: params.plan.currency.toLowerCase(),
                courseSlug: params.courseSlug,
                userId: params.userId,
                userEmail: params.userEmail,
                successUrl: params.successUrl,
                cancelUrl: params.cancelUrl,
                metadata: {
                    courseSlug: params.courseSlug,
                    userId: params.userId,
                    planId: params.planId,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Failed to create payment session',
            };
        }

        const data = await response.json();
        return {
            success: true,
            session: {
                id: data.sessionId,
                url: data.url,
                status: data.status || 'open',
            },
        };
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return {
            success: false,
            error: 'Failed to initialize payment. Please try again.',
        };
    }
};

/**
 * Verify Stripe Checkout session
 * Called after user returns from successful payment
 */
export const verifyCheckoutSession = async (
    sessionId: string
): Promise<{ success: boolean; paid: boolean; metadata?: any; error?: string }> => {
    if (!isStripeConfigured()) {
        return {
            success: false,
            paid: false,
            error: 'Payment system not configured',
        };
    }

    try {
        // Call backend API to verify session with Stripe
        const response = await fetch(`${STRIPE_API_URL}/verify-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                paid: false,
                error: error.message || 'Failed to verify payment',
            };
        }

        const data = await response.json();
        return {
            success: true,
            paid: data.paymentStatus === 'paid',
            metadata: data.metadata,
        };
    } catch (error) {
        console.error('Error verifying Stripe session:', error);
        return {
            success: false,
            paid: false,
            error: 'Failed to verify payment. Please contact support.',
        };
    }
};

/**
 * Get Stripe public key for client-side usage
 */
export const getStripePublicKey = (): string => {
    return STRIPE_PUBLIC_KEY;
};

/**
 * Mock Stripe integration for development/testing
 * Simulates successful payment flow without actual Stripe calls
 */
export const mockStripeCheckout = async (
    params: CreateCheckoutSessionParams
): Promise<{ success: boolean; session?: StripeCheckoutSession; error?: string }> => {
    console.log('🧪 Mock Stripe Checkout:', params);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For free plans, return success immediately
    if (params.plan.price === 0) {
        return {
            success: true,
            session: {
                id: 'mock_session_free',
                url: params.successUrl,
                status: 'complete',
            },
        };
    }

    // For paid plans, simulate Stripe Checkout URL
    const mockSessionId = `mock_session_${Date.now()}`;
    const mockCheckoutUrl = `${params.successUrl}?session_id=${mockSessionId}&payment=success`;

    return {
        success: true,
        session: {
            id: mockSessionId,
            url: mockCheckoutUrl,
            status: 'open',
        },
    };
};

/**
 * Mock session verification for development/testing
 */
export const mockVerifySession = async (
    sessionId: string
): Promise<{ success: boolean; paid: boolean; metadata?: any }> => {
    console.log('🧪 Mock Verify Session:', sessionId);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock sessions are always paid
    return {
        success: true,
        paid: true,
        metadata: {
            courseSlug: 'mock-course',
            userId: 'mock-user',
            planId: 'premium',
        },
    };
};
