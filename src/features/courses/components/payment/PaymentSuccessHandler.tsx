/**
 * Payment Success Handler Component
 * Handles payment success redirect and enrollment creation
 * Spec requirement: Success redirect handling + enrollment creation
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { handlePaymentSuccess } from '@/lib/payment';
import { enrollInCourse } from '@/lib/enrollment';

export const PaymentSuccessHandler: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { databaseUser } = useAuth();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing your payment...');

    useEffect(() => {
        const processPayment = async () => {
            // Get parameters from URL
            const sessionId = searchParams.get('session_id');
            const courseSlug = searchParams.get('courseId');
            const paymentStatus = searchParams.get('payment');

            // Validate parameters
            if (!sessionId || !courseSlug || !databaseUser?.id) {
                setStatus('error');
                setMessage('Invalid payment session. Please try again.');
                return;
            }

            // Handle payment cancellation
            if (paymentStatus === 'cancelled') {
                setStatus('error');
                setMessage('Payment was cancelled. You can try again from the course page.');
                setTimeout(() => {
                    navigate(`/courses/${courseSlug}`);
                }, 3000);
                return;
            }

            try {
                // Step 1: Verify payment with Stripe
                setMessage('Verifying payment...');
                const paymentResult = await handlePaymentSuccess(
                    sessionId,
                    databaseUser.id,
                    courseSlug
                );

                if (!paymentResult.success) {
                    setStatus('error');
                    setMessage(paymentResult.error || 'Payment verification failed');
                    return;
                }

                // Step 2: Create enrollment
                setMessage('Creating your enrollment...');
                const enrollmentResult = await enrollInCourse(
                    databaseUser.id,
                    courseSlug,
                    'explicit'
                );

                if (!enrollmentResult.success) {
                    setStatus('error');
                    setMessage(enrollmentResult.error || 'Failed to create enrollment');
                    return;
                }

                // Success!
                setStatus('success');
                setMessage('Payment successful! Redirecting to your course...');

                // Redirect to learning screen after 2 seconds
                setTimeout(() => {
                    navigate(`/learning?courseId=${encodeURIComponent(courseSlug)}`);
                }, 2000);
            } catch (error) {
                console.error('Error processing payment:', error);
                setStatus('error');
                setMessage('An unexpected error occurred. Please contact support.');
            }
        };

        processPayment();
    }, [searchParams, databaseUser?.id, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                {/* Icon */}
                <div className="mb-6">
                    {status === 'processing' && (
                        <Loader2 className="animate-spin text-blue-600 mx-auto" size={64} />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="text-green-600 mx-auto" size={64} />
                    )}
                    {status === 'error' && (
                        <XCircle className="text-red-600 mx-auto" size={64} />
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {status === 'processing' && 'Processing Payment'}
                    {status === 'success' && 'Payment Successful!'}
                    {status === 'error' && 'Payment Failed'}
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-6">{message}</p>

                {/* Action Buttons */}
                {status === 'error' && (
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/courses')}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Browse Courses
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-sm text-gray-500">
                        You will be redirected automatically...
                    </div>
                )}
            </div>
        </div>
    );
};
