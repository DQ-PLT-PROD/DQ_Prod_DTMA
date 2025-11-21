import React, { Component } from 'react';
/**
 * LEGACY: Unused legacy course catalog page.
 *
 * Router currently serves the canonical course marketplace at
 * `/marketplace/courses` via MarketplacePage + marketplaceConfig.
 * Keep this file only for reference; do not wire new routes here.
 */

import CourseMarketplace from '../components/CourseMarketplace';
/**
 * CourseMarketplacePage Component
 *
 * @returns The complete Course Marketplace page
 */
const CourseMarketplacePage: React.FC = () => {
  return <CourseMarketplace />;
};
export default CourseMarketplacePage;
