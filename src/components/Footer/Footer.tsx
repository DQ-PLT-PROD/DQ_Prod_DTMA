import React from "react";
import { ArrowRight, Facebook, Instagram, Twitter } from "lucide-react";
import { FEATURES } from "../../config/features";

interface FooterProps {
  "data-id"?: string;
  isLoggedIn?: boolean;
}

const FOOTER_GRADIENT =
  "linear-gradient(90deg, #0a32a0 0%, #2a4090 40%, #4e5a8b 70%, #8b90a3 100%)";

const ABOUT_TEXT = [
  "DTMA (Digital Transformation and Management Academy) equips professionals and organizations with essential digital skills through AI-driven, bite-sized learning paths. Using the 6XD framework, we offer practical, personalized courses for digital workers and leaders across six key digital economy perspectives.",
  "Our courses help both individuals and executives stay ahead in a fast-changing landscape by focusing on real-world application, innovation, and adaptability to future-proof careers and drive business transformation.",
];

const QUICK_LINKS = [
  { label: "Help Center", href: "#" },
  FEATURES.GROWTH_AREAS && { label: "Explore the AI Working Era", href: "/discover-abudhabi" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
].filter(Boolean) as { label: string; href: string }[];

export function Footer({ "data-id": dataId, isLoggedIn = false }: FooterProps) {
  if (isLoggedIn) {
    return (
      <footer data-id={dataId} className="bg-gray-50 border-t border-gray-100 w-full h-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>(c) 2025 DTMA</span>
            <span className="hidden sm:inline">v2.1.0</span>
          </div>
          <a href="/dashboard/support" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
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
          <img src="/DTMA%20LOGO%20WHITE.svg" alt="DTMA" className="h-10 w-auto" />
          <div className="flex items-center gap-4 text-white">
            <a
              href="#"
              aria-label="Facebook"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Twitter size={18} />
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
            <div className="bg-white rounded-md flex items-center justify-between px-4 py-3 text-gray-900">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent outline-none placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-[#0a32a0] text-white p-2 rounded-md hover:bg-[#2a4090] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          <p>(c) 2025 DTMA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
