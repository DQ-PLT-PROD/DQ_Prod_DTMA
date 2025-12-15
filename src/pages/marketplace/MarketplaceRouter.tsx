import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MarketplacePage } from '../../components/marketplace/MarketplacePage';
import MarketplaceDetailsPage from './MarketplaceDetailsPage';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';

export const MarketplaceRouter: React.FC = () => {
  // Get configuration for courses marketplace
  const coursesConfig = getMarketplaceConfig('courses');

  return (
    <Routes>
      {/* Courses Marketplace - Always Active */}
      <Route path="/courses" element={<MarketplacePage marketplaceType="courses" title={coursesConfig.title} description={coursesConfig.description} />} />
      <Route path="/courses/:itemId" element={<MarketplaceDetailsPage marketplaceType="courses" />} />

      {/* Redirect removed marketplace types to 404 */}
      <Route path="/financial/*" element={<Navigate to="/404" replace />} />
      <Route path="/non-financial/*" element={<Navigate to="/404" replace />} />
      <Route path="/knowledge-hub/*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};