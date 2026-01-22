import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from './services/newsletterService';

const ComingSoonPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setStatus('error');
            setMessage('Please enter your email address.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await subscribeToNewsletter(email);
            setStatus('success');
            setMessage('Thank you! We\'ll notify you when we launch.');
            setEmail('');
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0030E3] via-[#1a1a2e] to-[#0d0d1a]">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient orbs */}
                <motion.div
                    className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, #00E5D1 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, #954BF9 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2,
                    }}
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 py-12">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 flex flex-col items-center gap-4"
                >
                    {/* DTMA Logo */}
                    <img
                        src="/logo/dtma-logo-white.svg"
                        alt="Digital Transformation Management Academy"
                        className="h-20 md:h-28 w-auto"
                    />
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </motion.div>

                {/* Main heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
                        Coming{' '}
                        <span className="bg-gradient-to-r from-[#00E5D1] to-[#954BF9] bg-clip-text text-transparent">
                            Soon
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-body leading-relaxed">
                        We're building something extraordinary. The{' '}
                        <span className="text-[#0030E3] font-semibold">Digital Transformation Management Academy</span>
                        {' '}is launching soon to empower leaders and digital workers with cutting-edge digital skills.
                    </p>
                </motion.div>

                {/* Newsletter Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl">
                        <h2 className="text-white text-lg font-semibold mb-2 font-body">
                            Be the first to know
                        </h2>
                        <p className="text-white/60 text-sm mb-6 font-body">
                            Subscribe to get notified when we launch and receive exclusive early access.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={status === 'loading'}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00E5D1] focus:ring-2 focus:ring-[#00E5D1]/20 transition-all duration-300 font-body disabled:opacity-50"
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={status === 'loading'}
                                whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                                whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                                className="w-full bg-gradient-to-r from-[#00E5D1] to-[#0030E3] text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#00E5D1]/25 disabled:opacity-70 disabled:cursor-not-allowed font-body"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Subscribing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Notify Me</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Status messages */}
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mt-4 flex items-start gap-2 p-3 rounded-lg ${status === 'success'
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-red-500/20 text-red-300'
                                        }`}
                                >
                                    {status === 'success' ? (
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    )}
                                    <p className="text-sm font-body">{message}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Footer attribution */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <p className="text-white/40 text-sm font-body">
                        Powered by{' '}
                        <span className="text-white/60">Digital Qatalyst</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default ComingSoonPage;
