import React, { useState } from 'react';
import { ExternalLink, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
interface FooterProps {
  'data-id'?: string;
  isLoggedIn?: boolean;
}
interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
}
function AccordionSection({
  title,
  children
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="border-b border-blue-500 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-4 flex items-center justify-between text-left" aria-expanded={isOpen}>
        <h3 className="font-semibold text-base text-white">{title}</h3>
        {isOpen ? <ChevronUp size={20} className="text-blue-100" /> : <ChevronDown size={20} className="text-blue-100" />}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>;
}
export function Footer({
  'data-id': dataId,
  isLoggedIn = false
}: FooterProps) {
  // Minimal App Footer (Post-login)
  if (isLoggedIn) {
    return <footer data-id={dataId} className="bg-gray-50 border-t border-gray-100 w-full h-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>(c) 2025 DTMA</span>
            <span className="hidden sm:inline">v2.1.0</span>
          </div>
          <a href="/dashboard/support" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Support
          </a>
        </div>
      </footer>;
  }
  // Full Website Footer (Pre-login)
  return <footer data-id={dataId} className="bg-blue-600 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Logo */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              DTMA
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Powered by Digital Qatalyst
            </p>
          </div>
          {/* Newsletter - Mobile Full Width */}
          <div className="mb-8">
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              Stay updated with the latest insights, courses, and tools for the
              AI working era from DTMA.
            </p>
            <div className="space-y-3">
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Email address for newsletter" />
              <button type="submit" className="w-full bg-white text-blue-600 px-4 py-3 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors font-medium" aria-label="Subscribe to newsletter">
                Subscribe
              </button>
            </div>
          </div>
          {/* Accordion Sections */}
          <div className="mb-8">
            <AccordionSection title="Get to Know Us">
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    About DTMA
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Help Centre
                  </a>
                </li>
                <li>
                  <a href="/discover-abudhabi" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Explore the AI Working Era
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </AccordionSection>
            <AccordionSection title="For You">
              <ul className="space-y-3">
                <li>
                  <a href="/marketplace/financial" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Financial Services
                  </a>
                </li>
                <li>
                  <a href="/marketplace/non-financial" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Business Services
                  </a>
                </li>
                <li>
                  <a href="https://ujs.qxk.mybluehost.me/website_e550b4e3/" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Business Business Communities
                  </a>
                </li>
                <li>
                  <a href="/marketplace/knowledge-hub" className="text-blue-100 hover:text-white transition-colors text-sm block">
                    Knowledge Hub
                  </a>
                </li>
              </ul>
            </AccordionSection>
            <AccordionSection title="Find Us">
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    Facebook
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    YouTube
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </AccordionSection>
          </div>
          {/* Copyright - Mobile */}
          <div className="border-t border-blue-500 pt-6 text-center">
            <p className="text-blue-100 text-xs">
              (c) 2025 DTMA. All rights reserved.
            </p>
            <p className="text-blue-100 text-xs mt-1">v2.1.0</p>
          </div>
        </div>
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Main Footer Content */}
          <div className="grid grid-cols-4 gap-12 mb-8">
            {/* Logo and Newsletter Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">DTMA</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Powered by Digital Qatalyst
                </p>
              </div>
              <div className="mb-6">
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                  Stay updated with the latest insights, courses, and tools for
                  the AI working era from DTMA.
                </p>
                <div className="bg-white rounded-md flex items-center justify-between px-4 py-3">
                  <span className="text-gray-600 text-sm">
                    Enter your email
                  </span>
                  <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" aria-label="Subscribe to newsletter">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            {/* Get to Know Us */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Get to Know Us</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm">
                    About DTMA
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Help Centre
                  </a>
                </li>
                <li>
                  <a href="/discover-abudhabi" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Explore the AI Working Era
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            {/* For You */}
            <div>
              <h3 className="font-semibold text-lg mb-6">For You</h3>
              <ul className="space-y-4">
                <li>
                  <a href="/marketplace/financial" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Financial Services
                  </a>
                </li>
                <li>
                  <a href="/marketplace/non-financial" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Business Services
                  </a>
                </li>
                <li>
                  <a href="https://ujs.qxk.mybluehost.me/website_e550b4e3/" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Business Communities
                  </a>
                </li>
                <li>
                  <a href="/marketplace/knowledge-hub" className="text-blue-100 hover:text-white transition-colors text-sm">
                    Knowledge Hub
                  </a>
                </li>
              </ul>
            </div>
            {/* Find Us */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Find Us</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    Facebook
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    YouTube
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Copyright - Desktop */}
          <div className="border-t border-blue-500 pt-6 flex items-center justify-between">
            <p className="text-blue-100 text-sm">
              (c) 2025 DTMA. All rights reserved.
            </p>
            <p className="text-blue-100 text-sm">v2.1.0</p>
          </div>
        </div>
      </div>
    </footer>;
}
