/**
 * ComingSoonEmptyState Component
 * 
 * High-conversion empty state module with Glassmorphism aesthetic
 * Displays when course catalog filters yield zero results
 * 
 * Features:
 * - Glassmorphism design with DTMA brand colors
 * - Email capture for waitlist
 * - WCAG accessibility compliant
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '@/services/newsletterService';

interface ComingSoonEmptyStateProps {
  onBrowseAll?: () => void;
  className?: string;
}

export const ComingSoonEmptyState: React.FC<ComingSoonEmptyStateProps> = ({
  onBrowseAll,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  const handleNotifyMe = () => {
    setShowEmailCapture(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      setMessage("Thank you! We'll notify you when new courses are available.");
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setShowEmailCapture(false);
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className={`flex items-center justify-center py-16 px-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(0, 48, 227, 0.15)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(0, 48, 227, 0.1)',
        }}
      >
        <div className="p-8 md:p-12 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #0030E3 0%, #1839AD 100%)',
              boxShadow: '0 4px 16px 0 rgba(0, 48, 227, 0.25)',
            }}
          >
            <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
          </motion.div>

          {/* Headline */}
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0030E3' }}
          >
            Expanding Our Horizons
          </h2>

          {/* Subtext */}
          <p 
            className="text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto"
            style={{ color: '#374151' }}
          >
            We are currently curating expert-led content for this specific path. 
            Our team is working behind the scenes to bring you the best digital 
            worker training in this category.
          </p>

          {/* Email Capture Form or Success Message */}
          {showEmailCapture ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              {status === 'success' ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2 p-4 rounded-lg"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">{message}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={status === 'loading'}
                      className="flex-1 px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: status === 'error' ? '#EF4444' : 'rgba(0, 48, 227, 0.2)',
                        background: 'rgba(255, 255, 255, 0.9)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0030E3';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 227, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 48, 227, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                      aria-label="Email address"
                      aria-invalid={status === 'error'}
                      aria-describedby={status === 'error' ? 'email-error' : undefined}
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #0030E3 0%, #1839AD 100%)',
                        boxShadow: '0 4px 12px 0 rgba(0, 48, 227, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        if (status !== 'loading') {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(0, 48, 227, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 48, 227, 0.3)';
                      }}
                      aria-label="Subscribe to notifications"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  {status === 'error' && message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm"
                      id="email-error"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </form>
              )}
            </motion.div>
          ) : (
            /* Primary CTA Button */
            <button
              onClick={handleNotifyMe}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all duration-200 mb-6"
              style={{
                background: 'linear-gradient(135deg, #0030E3 0%, #1839AD 100%)',
                boxShadow: '0 4px 12px 0 rgba(0, 48, 227, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(0, 48, 227, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 48, 227, 0.3)';
              }}
              aria-label="Get notified when courses are available"
            >
              <span>Notify Me When Available</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {/* Secondary Link */}
          <button
            onClick={onBrowseAll}
            className="inline-flex items-center gap-1 text-base font-medium transition-all duration-200 group"
            style={{ color: '#0030E3' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
            aria-label="Browse all active courses"
          >
            <span>Browse All Active Courses</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
