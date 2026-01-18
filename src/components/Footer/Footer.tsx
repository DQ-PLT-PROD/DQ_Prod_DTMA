import React, { useState } from "react";
import { ArrowRight, Instagram, Linkedin, X } from "lucide-react";
import { FEATURES } from "../../config/features";
import { subscribeToNewsletter } from "../../features/landing/services/newsletterService";

interface FooterProps {
  "data-id"?: string;
  isLoggedIn?: boolean;
}

const FOOTER_GRADIENT = "var(--brand-gradient)";

const ABOUT_TEXT = [
  "DTMA (Digital Transformation and Management Academy) equips professionals and organizations with essential digital skills through AI-driven, bite-sized learning paths. Using the 6XD framework, we offer practical, personalized courses for digital workers and leaders across six key digital economy perspectives.",
  "Our courses help both individuals and executives stay ahead in a fast-changing landscape by focusing on real-world application, innovation, and adaptability to future-proof careers and drive business transformation.",
];

const QUICK_LINKS = [
  { label: "Explore Courses", href: "/courses" },
  { label: "Help Center", href: "/coming-soon/help-center" },
  FEATURES.GROWTH_AREAS && { label: "Explore the AI Working Era", href: "/discover-abudhabi" },
  { label: "Privacy Policy", href: "/coming-soon/privacy-policy" },
  { label: "Terms of Service", href: "/coming-soon/terms-of-service" },
].filter(Boolean) as { label: string; href: string }[];

export function Footer({ "data-id": dataId, isLoggedIn = false }: FooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!email.trim()) {
      setMessage("Please enter your email.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      await subscribeToNewsletter(email, "footer");
      setStatus("success");
      setMessage("Thanks! You're subscribed.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Unable to subscribe right now.");
    }
  };

  if (isLoggedIn) {
    return (
      <footer data-id={dataId} className="bg-[color:var(--md-background)] border-t border-[color:var(--md-outline-variant)] w-full h-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-[color:var(--md-on-surface-variant)]">
            <span>(c) 2025 DTMA</span>
            <span className="hidden sm:inline">v2.1.0</span>
          </div>
          <a href="/dashboard/support" className="text-xs text-[color:var(--md-on-surface-variant)] hover:text-[color:var(--md-on-surface)] transition-colors">
            Support
          </a>
        </div>
      </footer>
    );
  }

  return (
    <footer
      data-id={dataId}
      className="text-white w-full"
      style={{ background: FOOTER_GRADIENT }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <img src="/logo/dtma-logo-white.svg" alt="DTMA" className="h-10 w-auto" />
          <div className="flex items-center gap-4 text-white">
            <a
              href="https://www.linkedin.com/company/digitalqatalyst/posts/?feedView=all"
              aria-label="LinkedIn"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://www.instagram.com/digitalqatalyst/"
              aria-label="Instagram"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://x.com/drstephane_"
              aria-label="X (Twitter)"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X size={18} strokeWidth={2} />
            </a>
          </div>
        </div>
        <div className="h-px w-full bg-white/30" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left items-start pt-4">
          <div className="space-y-4 text-blue-100 text-sm leading-relaxed">
            <h3 className="font-semibold text-lg text-white">About Us</h3>
            {ABOUT_TEXT.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="space-y-4 self-start">
            <h3 className="font-semibold text-lg text-white">Quick Links</h3>
            <div className="text-blue-100 text-sm">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center py-2 border-b border-white/30 hover:text-white transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4 self-start">
            <h3 className="font-semibold text-lg text-white">Subscribe</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Stay updated with the latest insights, courses, and tools for the AI working era
              from DTMA.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="bg-white rounded-full flex items-center justify-between px-4 py-2.5 text-gray-900 shadow-md-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-500 text-sm sm:text-base"
                  aria-label="Email address"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-[color:var(--md-primary)] text-white p-2 rounded-full hover:bg-[color:var(--md-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              {message && (
                <p
                  className={`text-xs ${
                    status === "success" ? "text-green-100" : "text-red-100"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          <p>(c) 2025 DTMA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
