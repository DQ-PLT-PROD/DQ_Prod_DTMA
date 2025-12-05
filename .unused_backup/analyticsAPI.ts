// Analytics API service for Enterprise Journey
import { mockBusinessInsights, mockEconomicIndicators } from './mockData';
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// Add some randomness to API delays to simulate network variability
const randomDelay = () => delay(500 + Math.random() * 1000);
// Generate growth trend data for various metrics
export const fetchBusinessGrowthTrends = async (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  await randomDelay();
  // Generate realistic growth trend data based on the requested period
  const currentDate = new Date();
  const dataPoints = period === 'monthly' ? 12 : period === 'quarterly' ? 8 : 5;
  const labels = [];
  // Generate appropriate labels based on period
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    if (period === 'monthly') {
      date.setMonth(date.getMonth() - i);
      labels.push(date.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      }));
    } else if (period === 'quarterly') {
      date.setMonth(date.getMonth() - i * 3);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      labels.push(`Q${quarter} ${date.getFullYear()}`);
    } else {
      date.setFullYear(date.getFullYear() - i);
      labels.push(date.getFullYear().toString());
    }
  }
  // Generate series data for different metrics
  return {
    labels,
    datasets: [{
      name: 'Business Registrations',
      data: Array.from({
        length: dataPoints
      }, () => Math.floor(800 + Math.random() * 400))
    }, {
      name: 'Investment Volume (AED M)',
      data: Array.from({
        length: dataPoints
      }, () => Math.floor(250 + Math.random() * 150))
    }, {
      name: 'Job Creation',
      data: Array.from({
        length: dataPoints
      }, () => Math.floor(1200 + Math.random() * 800))
    }]
  };
};
// Fetch sector performance data
export const fetchSectorPerformance = async (year: number = new Date().getFullYear()) => {
  await randomDelay();
  // Define sectors with realistic growth rates
  const sectors = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Real Estate', 'Tourism', 'Energy', 'Logistics', 'Education'];
  // Generate performance data for each sector
  return sectors.map(sector => {
    // Generate realistic growth rate based on the sector
    let baseGrowth;
    switch (sector) {
      case 'Technology':
        baseGrowth = 12;
        break;
      case 'Healthcare':
        baseGrowth = 9;
        break;
      case 'Tourism':
        baseGrowth = 8;
        break;
      case 'Finance':
        baseGrowth = 7;
        break;
      case 'Energy':
        baseGrowth = 6;
        break;
      default:
        baseGrowth = 5;
    }
    const growthRate = (baseGrowth + Math.random() * 4 - 2).toFixed(1);
    const investmentScore = Math.floor(60 + Math.random() * 40);
    const employmentGrowth = (baseGrowth / 2 + Math.random() * 3 - 1).toFixed(1);
    return {
      sector,
      growthRate: `${growthRate}%`,
      investmentScore,
      employmentGrowth: `${employmentGrowth}%`,
      innovationIndex: Math.floor(1 + Math.random() * 100),
      exportGrowth: `${(baseGrowth / 1.5 + Math.random() * 5 - 2.5).toFixed(1)}%`
    };
  });
};
// Fetch regional business activity data
export const fetchRegionalBusinessActivity = async () => {
  await randomDelay();
  // Define emirates with realistic business activity data
  const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
  // Generate business activity data for each emirate
  return emirates.map(emirate => {
    // Assign realistic values based on emirate
    let businessCount, growthRate, investmentVolume;
    switch (emirate) {
      case 'Dubai':
        businessCount = Math.floor(45000 + Math.random() * 5000);
        growthRate = (6.5 + Math.random() * 2).toFixed(1);
        investmentVolume = Math.floor(80 + Math.random() * 20);
        break;
      case 'Abu Dhabi':
        businessCount = Math.floor(35000 + Math.random() * 5000);
        growthRate = (5.8 + Math.random() * 2).toFixed(1);
        investmentVolume = Math.floor(75 + Math.random() * 20);
        break;
      case 'Sharjah':
        businessCount = Math.floor(20000 + Math.random() * 3000);
        growthRate = (4.5 + Math.random() * 1.5).toFixed(1);
        investmentVolume = Math.floor(40 + Math.random() * 15);
        break;
      default:
        businessCount = Math.floor(5000 + Math.random() * 5000);
        growthRate = (3 + Math.random() * 3).toFixed(1);
        investmentVolume = Math.floor(15 + Math.random() * 25);
    }
    return {
      emirate,
      businessCount,
      growthRate: `${growthRate}%`,
      investmentVolume,
      topSectors: getTopSectorsForEmirate(emirate),
      newRegistrations: Math.floor(businessCount * (0.05 + Math.random() * 0.05))
    };
  });
};
// Helper function to get top sectors for each emirate
function getTopSectorsForEmirate(emirate: string): string[] {
  switch (emirate) {
    case 'Abu Dhabi':
      return ['Energy', 'Finance', 'Healthcare', 'Technology', 'Tourism'];
    case 'Dubai':
      return ['Finance', 'Tourism', 'Real Estate', 'Technology', 'Retail'];
    case 'Sharjah':
      return ['Manufacturing', 'Education', 'Healthcare', 'Logistics', 'Culture'];
    case 'Ajman':
      return ['Manufacturing', 'Real Estate', 'Retail', 'Hospitality', 'Services'];
    case 'Umm Al Quwain':
      return ['Tourism', 'Manufacturing', 'Agriculture', 'Fisheries', 'Retail'];
    case 'Ras Al Khaimah':
      return ['Manufacturing', 'Tourism', 'Cement', 'Pharmaceuticals', 'Agriculture'];
    case 'Fujairah':
      return ['Logistics', 'Maritime', 'Tourism', 'Mining', 'Manufacturing'];
    default:
      return ['Retail', 'Services', 'Manufacturing', 'Tourism', 'Technology'];
  }
}
// Fetch business insights data
export const fetchBusinessInsights = async (sector?: string) => {
  await randomDelay();
  if (sector) {
    return mockBusinessInsights.filter(insight => insight.sector === sector);
  }
  return mockBusinessInsights;
};
// Fetch economic indicators data
export const fetchEconomicIndicators = async (year?: number) => {
  await randomDelay();
  if (year) {
    return mockEconomicIndicators.filter(indicator => indicator.year === year);
  }
  return mockEconomicIndicators;
};
// Fetch business sentiment data
export const fetchBusinessSentiment = async (period: 'monthly' | 'quarterly' = 'quarterly') => {
  await randomDelay();
  // Generate realistic business sentiment data
  const currentDate = new Date();
  const dataPoints = period === 'monthly' ? 12 : 8;
  const labels = [];
  // Generate appropriate labels based on period
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    if (period === 'monthly') {
      date.setMonth(date.getMonth() - i);
      labels.push(date.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      }));
    } else {
      date.setMonth(date.getMonth() - i * 3);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      labels.push(`Q${quarter} ${date.getFullYear()}`);
    }
  }
  // Generate sentiment scores (0-100)
  const overallSentiment = [];
  const growthOutlook = [];
  const investmentIntent = [];
  const hiringOutlook = [];
  // Start with a baseline and add some variability while maintaining a trend
  let sentimentBaseline = 65;
  let growthBaseline = 62;
  let investmentBaseline = 58;
  let hiringBaseline = 60;
  for (let i = 0; i < dataPoints; i++) {
    // Add some variability while maintaining a realistic trend
    sentimentBaseline += Math.random() * 6 - 3;
    sentimentBaseline = Math.max(40, Math.min(90, sentimentBaseline));
    overallSentiment.push(Math.round(sentimentBaseline));
    growthBaseline += Math.random() * 6 - 3;
    growthBaseline = Math.max(40, Math.min(90, growthBaseline));
    growthOutlook.push(Math.round(growthBaseline));
    investmentBaseline += Math.random() * 6 - 3;
    investmentBaseline = Math.max(40, Math.min(90, investmentBaseline));
    investmentIntent.push(Math.round(investmentBaseline));
    hiringBaseline += Math.random() * 6 - 3;
    hiringBaseline = Math.max(40, Math.min(90, hiringBaseline));
    hiringOutlook.push(Math.round(hiringBaseline));
  }
  return {
    labels,
    datasets: [{
      name: 'Overall Business Sentiment',
      data: overallSentiment
    }, {
      name: 'Growth Outlook',
      data: growthOutlook
    }, {
      name: 'Investment Intent',
      data: investmentIntent
    }, {
      name: 'Hiring Outlook',
      data: hiringOutlook
    }]
  };
};