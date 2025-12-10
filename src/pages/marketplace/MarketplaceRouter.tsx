import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MarketplacePage } from '../../components/marketplace/MarketplacePage';
import MarketplaceDetailsPage from './MarketplaceDetailsPage';
import { DollarSign, Briefcase, Users, Calendar, Newspaper, BookOpen, Video } from 'lucide-react';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { FEATURES } from '../../config/features';

// Promo cards for courses marketplace
const coursePromoCards = [{
  id: 'finance-promo',
  title: 'Looking for funding?',
  description: 'Explore financial opportunities and resources to grow your business.',
  icon: <DollarSign size={24} className="text-white" />,
  path: '/marketplace/financial',
  gradientFrom: 'from-blue-600',
  gradientTo: 'to-indigo-700'
}, {
  id: 'advisory-promo',
  title: 'Need expert advice?',
  description: 'Connect with industry experts and get personalized guidance.',
  icon: <Briefcase size={24} className="text-white" />,
  path: '/marketplace/non-financial',
  gradientFrom: 'from-purple-600',
  gradientTo: 'to-pink-500'
}];
// Promo cards for financial services marketplace
const financialPromoCards = [{
  id: 'courses-promo',
  title: 'Improve your skills',
  description: 'Discover courses to enhance your financial knowledge.',
  icon: <Calendar size={24} className="text-white" />,
  path: '/marketplace/courses',
  gradientFrom: 'from-green-500',
  gradientTo: 'to-teal-400'
}, {
  id: 'advisory-promo',
  title: 'Need expert advice?',
  description: 'Connect with industry experts and get personalized guidance.',
  icon: <Briefcase size={24} className="text-white" />,
  path: '/marketplace/non-financial',
  gradientFrom: 'from-purple-600',
  gradientTo: 'to-pink-500'
}];
// Promo cards for non-financial services marketplace
const nonFinancialPromoCards = [{
  id: 'courses-promo',
  title: 'Improve your skills',
  description: 'Discover courses to enhance your business knowledge.',
  icon: <Calendar size={24} className="text-white" />,
  path: '/marketplace/courses',
  gradientFrom: 'from-green-500',
  gradientTo: 'to-teal-400'
}, {
  id: 'finance-promo',
  title: 'Looking for funding?',
  description: 'Explore financial opportunities and resources to grow your business.',
  icon: <DollarSign size={24} className="text-white" />,
  path: '/marketplace/financial',
  gradientFrom: 'from-blue-600',
  gradientTo: 'to-indigo-700'
}];
// Promo cards for knowledge hub marketplace
const knowledgeHubPromoCards = [{
  id: 'courses-promo',
  title: 'Enhance your skills',
  description: 'Discover courses to develop your business capabilities.',
  icon: <BookOpen size={24} className="text-white" />,
  path: '/marketplace/courses',
  gradientFrom: 'from-green-500',
  gradientTo: 'to-teal-400'
}, {
  id: 'finance-promo',
  title: 'Explore funding options',
  description: 'Find financial services to support your business growth.',
  icon: <DollarSign size={24} className="text-white" />,
  path: '/marketplace/financial',
  gradientFrom: 'from-blue-600',
  gradientTo: 'to-indigo-700'
}];

export const MarketplaceRouter: React.FC = () => {
  // Get configurations for each marketplace type
  const coursesConfig = getMarketplaceConfig('courses');
  const financialConfig = getMarketplaceConfig('financial');
  const nonFinancialConfig = getMarketplaceConfig('non-financial');
  const knowledgeHubConfig = getMarketplaceConfig('knowledge-hub');

  // State for bookmarked items and comparison
  const [bookmarkedItems, setBookmarkedItems] = useState<Record<string, string[]>>({
    courses: [],
    financial: [],
    'non-financial': [],
    'knowledge-hub': []
  });

  // Toggle bookmark for an item
  const handleToggleBookmark = (marketplaceType: string, itemId: string) => {
    setBookmarkedItems(prev => {
      const currentItems = prev[marketplaceType] || [];
      const updatedItems = currentItems.includes(itemId) ? currentItems.filter(id => id !== itemId) : [...currentItems, itemId];
      return {
        ...prev,
        [marketplaceType]: updatedItems
      };
    });
  };

  return (
    <Routes>
      {/* Courses Marketplace - Always Active */}
      <Route path="/courses" element={<MarketplacePage marketplaceType="courses" title={coursesConfig.title} description={coursesConfig.description} promoCards={coursePromoCards} />} />
      <Route path="/courses/:itemId" element={<MarketplaceDetailsPage marketplaceType="courses" bookmarkedItems={bookmarkedItems.courses} onToggleBookmark={itemId => handleToggleBookmark('courses', itemId)} />} />

      {/* Feature Flagged: Financial Services Marketplace */}
      {FEATURES.OTHER_MARKETPLACES ? (
        <>
          <Route path="/financial" element={<MarketplacePage marketplaceType="financial" title={financialConfig.title} description={financialConfig.description} promoCards={financialPromoCards} />} />
          <Route path="/financial/:itemId" element={<MarketplaceDetailsPage marketplaceType="financial" bookmarkedItems={bookmarkedItems.financial} onToggleBookmark={itemId => handleToggleBookmark('financial', itemId)} />} />
        </>
      ) : (
        <Route path="/financial/*" element={<Navigate to="/404" replace />} />
      )}

      {/* Feature Flagged: Non-Financial Services Marketplace */}
      {FEATURES.OTHER_MARKETPLACES ? (
        <>
          <Route path="/non-financial" element={<MarketplacePage marketplaceType="non-financial" title={nonFinancialConfig.title} description={nonFinancialConfig.description} promoCards={nonFinancialPromoCards} />} />
          <Route path="/non-financial/:itemId" element={<MarketplaceDetailsPage marketplaceType="non-financial" bookmarkedItems={bookmarkedItems['non-financial']} onToggleBookmark={itemId => handleToggleBookmark('non-financial', itemId)} />} />
        </>
      ) : (
        <Route path="/non-financial/*" element={<Navigate to="/404" replace />} />
      )}

      {/* Feature Flagged: Knowledge Hub Marketplace */}
      {FEATURES.OTHER_MARKETPLACES ? (
        <>
          <Route path="/knowledge-hub" element={<MarketplacePage marketplaceType="knowledge-hub" title={knowledgeHubConfig.title} description={knowledgeHubConfig.description} promoCards={knowledgeHubPromoCards} />} />
          <Route path="/knowledge-hub/:itemId" element={<MarketplaceDetailsPage marketplaceType="knowledge-hub" bookmarkedItems={bookmarkedItems['knowledge-hub']} onToggleBookmark={itemId => handleToggleBookmark('knowledge-hub', itemId)} />} />
        </>
      ) : (
        <Route path="/knowledge-hub/*" element={<Navigate to="/404" replace />} />
      )}
    </Routes>
  );
};