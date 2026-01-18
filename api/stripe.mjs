/**
 * Stripe API Backend Stub
 * This is a minimal backend API for Stripe integration
 * 
 * In production, this should be a separate backend service with:
 * - Proper authentication
 * - Rate limiting
 * - Webhook handling
 * - Database integration
 * 
 * For MVP, this provides the minimal endpoints needed for Stripe Checkout
 */

import express from 'express';
import cors from 'cors';

const router = express.Router();

// Enable CORS for frontend
router.use(cors());
router.use(express.json());

/**
 * Create Stripe Checkout Session
 * POST /api/stripe/create-checkout-session
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const {
            planId,
            priceAmount,
            currency,
            courseSlug,
            userId,
            userEmail,
            successUrl,
            cancelUrl,
            metadata,
        } = req.body;

        // Validate required fields
        if (!planId || !priceAmount || !currency || !successUrl || !cancelUrl) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        // Check if Stripe is configured
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            console.warn('⚠️ Stripe not configured - using mock mode');
            
            // Return mock session for development
            const mockSessionId = `mock_session_${Date.now()}`;
            return res.json({
                sessionId: mockSessionId,
                url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id=${mockSessionId}`,
                status: 'open',
            });
        }

        // Initialize Stripe (only if configured)
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
        });

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: `Course Enrollment - ${courseSlug}`,
                            description: `Enrollment for course: ${courseSlug}`,
                        },
                        unit_amount: priceAmount, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: userEmail,
            metadata: {
                ...metadata,
                courseSlug,
                userId,
                planId,
            },
        });

        res.json({
            sessionId: session.id,
            url: session.url,
            status: session.status,
        });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({
            error: 'Failed to create payment session',
            message: error.message,
        });
    }
});

/**
 * Verify Stripe Checkout Session
 * POST /api/stripe/verify-session
 */
router.post('/verify-session', async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                error: 'Session ID required',
            });
        }

        // Handle mock sessions
        if (sessionId.startsWith('mock_session_')) {
            return res.json({
                paymentStatus: 'paid',
                metadata: {
                    courseSlug: 'mock-course',
                    userId: 'mock-user',
                    planId: 'premium',
                },
            });
        }

        // Check if Stripe is configured
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            return res.status(500).json({
                error: 'Stripe not configured',
            });
        }

        // Initialize Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
        });

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            paymentStatus: session.payment_status,
            metadata: session.metadata,
            customerEmail: session.customer_email,
        });
    } catch (error) {
        console.error('Error verifying Stripe session:', error);
        res.status(500).json({
            error: 'Failed to verify payment',
            message: error.message,
        });
    }
});

/**
 * Stripe Webhook Handler (for future use)
 * POST /api/stripe/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.warn('⚠️ Stripe webhook secret not configured');
            return res.status(400).json({ error: 'Webhook not configured' });
        }

        // Initialize Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });

        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        // Handle webhook events
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('✅ Payment successful:', session.id);
                // TODO: Create enrollment in database
                break;

            case 'checkout.session.expired':
                console.log('⏰ Session expired:', event.data.object.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook error', message: error.message });
    }
});

export default router;
