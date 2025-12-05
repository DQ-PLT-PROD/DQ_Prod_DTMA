// Mock API service for Enterprise Journey
import { mockHeroData, mockGrowthAreas, mockDirectoryItems, mockMapLocations, mockBusinessInsights, mockInvestmentOpportunities, mockEconomicIndicators, mockEventCalendar, mockNewsItems } from './mockData';
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// Add some randomness to API delays to simulate network variability
const randomDelay = () => delay(500 + Math.random() * 1000);
// API functions with artificial delay to simulate network requests
export const fetchHeroData = async () => {
  await randomDelay();
  return mockHeroData;
};
export const fetchGrowthAreas = async (filter?: string) => {
  await randomDelay();
  if (filter) {
    return mockGrowthAreas.filter(area => area.title.toLowerCase().includes(filter.toLowerCase()) || area.description.toLowerCase().includes(filter.toLowerCase()));
  }
  return mockGrowthAreas;
};
export const fetchDirectoryItems = async (options?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  await randomDelay();
  let results = [...mockDirectoryItems];
  if (options?.category && options.category !== 'all') {
    results = results.filter(item => item.category === options.category);
  }
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    results = results.filter(item => item.name.toLowerCase().includes(searchLower) || item.category.toLowerCase().includes(searchLower) || item.location.toLowerCase().includes(searchLower));
  }
  // Handle pagination
  const page = options?.page || 1;
  const limit = options?.limit || 6;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    items: results.slice(startIndex, endIndex),
    total: results.length,
    page,
    totalPages: Math.ceil(results.length / limit)
  };
};
export const fetchMapLocations = async (region?: string) => {
  await randomDelay();
  if (region) {
    return mockMapLocations.filter(location => location.region === region);
  }
  return mockMapLocations;
};
export const fetchBusinessInsights = async (sector?: string) => {
  await randomDelay();
  if (sector) {
    return mockBusinessInsights.filter(insight => insight.sector === sector);
  }
  return mockBusinessInsights;
};
export const fetchInvestmentOpportunities = async (options?: {
  sector?: string;
  minInvestment?: number;
  maxInvestment?: number;
}) => {
  await randomDelay();
  let results = [...mockInvestmentOpportunities];
  if (options?.sector) {
    results = results.filter(opportunity => opportunity.sector === options.sector);
  }
  if (options?.minInvestment !== undefined) {
    results = results.filter(opportunity => opportunity.investmentAmount >= options.minInvestment);
  }
  if (options?.maxInvestment !== undefined) {
    results = results.filter(opportunity => opportunity.investmentAmount <= options.maxInvestment);
  }
  return results;
};
export const fetchEconomicIndicators = async (year?: number) => {
  await randomDelay();
  if (year) {
    return mockEconomicIndicators.filter(indicator => indicator.year === year);
  }
  return mockEconomicIndicators;
};
export const fetchEventCalendar = async (options?: {
  month?: number;
  category?: string;
}) => {
  await randomDelay();
  let results = [...mockEventCalendar];
  if (options?.month !== undefined) {
    results = results.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === options.month;
    });
  }
  if (options?.category) {
    results = results.filter(event => event.category === options.category);
  }
  return results;
};
export const fetchNewsItems = async (options?: {
  category?: string;
  limit?: number;
}) => {
  await randomDelay();
  let results = [...mockNewsItems];
  if (options?.category) {
    results = results.filter(news => news.category === options.category);
  }
  if (options?.limit) {
    results = results.slice(0, options.limit);
  }
  return results;
};