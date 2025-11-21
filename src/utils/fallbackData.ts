import { getCourses, toMarketplaceItem } from '../lib/api/dtmaCourses'
import {
  mockFinancialServices,
  mockNonFinancialServices,
  mockKnowledgeHubItems,
} from './mockMarketplaceData'

/**
 * Get fallback items for a specific marketplace type when API calls fail
 */
export const getFallbackItems = (marketplaceType: string): any[] => {
  switch (marketplaceType) {
    case 'courses':
      return getCourses().map(toMarketplaceItem)
    case 'financial':
      return mockFinancialServices
    case 'non-financial':
      return mockNonFinancialServices
    case 'knowledge-hub':
      return mockKnowledgeHubItems
    default:
      return []
  }
}

/**
 * Get fallback item details for a specific marketplace type and item ID when API calls fail
 */
export const getFallbackItemDetails = (
  marketplaceType: string,
  itemId: string,
): any => {
  const items = getFallbackItems(marketplaceType)
  // Try to find the item with the matching ID
  const item = items.find((item) => item.id === itemId)
  // If item is found, return it
  if (item) {
    return item
  }
  // If item is not found, return the first item as a fallback
  return items.length > 0 ? items[0] : null
}

/**
 * Get Knowledge Hub items directly from the fallback dataset
 * This function always returns the mockKnowledgeHubItems without any API calls
 */
export const getFallbackKnowledgeHubItems = () => {
  const items = mockKnowledgeHubItems.map((item) => {
    // Add video URLs to video items
    if (item.mediaType.toLowerCase() === 'video') {
      return {
        ...item,
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      }
    }
    // Add audio URLs to podcast items
    if (item.mediaType.toLowerCase() === 'podcast') {
      // Simulate having both processedAudioUrl and audioUrl for some items
      // and only audioUrl for others to test fallback logic
      if (item.id.startsWith('p1') || item.id.startsWith('p2')) {
        return {
          ...item,
          processedAudioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        }
      } else {
        return {
          ...item,
          audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        }
      }
    }
    return item
  })
  return items
}

/**
 * Get Knowledge Hub item details by ID directly from the fallback dataset
 */
export const getFallbackKnowledgeHubItemDetails = (itemId: string): any => {
  const item = mockKnowledgeHubItems.find((item) => item.id === itemId)
  return (
    item || (mockKnowledgeHubItems.length > 0 ? mockKnowledgeHubItems[0] : null)
  )
}

// Sample data for development and testing
export const sampleKnowledgeHubItems = [
  {
    id: '1',
    title: 'Abu Dhabi Launches New SME Support Program',
    description:
      'The Abu Dhabi government has launched a new program to support SMEs with access to funding and resources.',
    mediaType: 'News',
    date: '2023-05-15',
    category: 'Government',
    source: 'Abu Dhabi Times',
    provider: {
      name: 'Abu Dhabi Times',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Government', 'SME', 'Funding'],
    domain: 'Business',
    businessStage: 'Growth',
  },
  {
    id: '2',
    title: 'Tech Startups in Abu Dhabi See 40% Growth',
    description:
      'Technology startups in Abu Dhabi have seen a 40% growth in the past year, according to a new report.',
    mediaType: 'News',
    date: '2023-04-28',
    category: 'Technology',
    source: 'TechNews Daily',
    provider: {
      name: 'TechNews Daily',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Technology', 'Startups', 'Growth'],
    domain: 'Technology',
    businessStage: 'Startup',
  },
  {
    id: '3',
    title: 'New E-commerce Regulations to Boost Online Businesses',
    description:
      'Abu Dhabi has introduced new e-commerce regulations aimed at boosting online businesses in the emirate.',
    mediaType: 'News',
    date: '2023-04-10',
    category: 'Regulations',
    source: 'Business Insider UAE',
    provider: {
      name: 'Business Insider UAE',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['E-commerce', 'Regulations', 'Online Business'],
    domain: 'E-commerce',
    businessStage: 'Established',
  },
  {
    id: '4',
    title: 'Abu Dhabi Business Forum 2023',
    description:
      'Join the premier business networking event in Abu Dhabi with industry leaders and government officials.',
    mediaType: 'Event',
    date: '2023-06-15',
    location: 'Abu Dhabi National Exhibition Centre',
    type: 'Conference',
    organizer: 'Abu Dhabi Chamber of Commerce',
    provider: {
      name: 'Abu Dhabi Chamber of Commerce',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Business', 'Networking', 'Conference'],
    domain: 'Business Development',
    businessStage: 'All Stages',
  },
  {
    id: '5',
    title: 'Startup Pitch Competition',
    description:
      'Present your startup idea to potential investors and win funding and mentorship opportunities.',
    mediaType: 'Event',
    date: '2023-05-25',
    location: 'Hub71, Abu Dhabi',
    type: 'Competition',
    organizer: 'Hub71',
    provider: {
      name: 'Hub71',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Startup', 'Pitch', 'Investment'],
    domain: 'Entrepreneurship',
    businessStage: 'Startup',
  },
  {
    id: '6',
    title: 'Business Plan Template',
    description:
      'Comprehensive business plan template with financial projections, market analysis, and strategic planning sections.',
    mediaType: 'Toolkits & Templates',
    type: 'Templates',
    provider: {
      name: 'Abu Dhabi Business Hub',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    downloadUrl: '#',
    fileSize: '2.5 MB',
    downloadCount: 1847,
    lastUpdated: '2024-01-15',
    tags: ['Business', 'Template', 'Planning'],
    domain: 'Business Planning',
    businessStage: 'Startup',
  },
  {
    id: '7',
    title: 'How to Register a Business in Abu Dhabi',
    description:
      'Step-by-step guide to registering your business in Abu Dhabi, including required documents and fees.',
    mediaType: 'Video',
    duration: '15:30',
    provider: {
      name: 'Abu Dhabi Department of Economic Development',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['Business Registration', 'Legal', 'Startup Guide'],
    domain: 'Legal & Compliance',
    businessStage: 'Pre-Startup',
  },
  {
    id: '8',
    title: 'Export Market Analysis Report',
    description:
      'Detailed analysis of export opportunities for Abu Dhabi businesses with market insights and regulatory information.',
    mediaType: 'Report',
    type: 'Guide',
    provider: {
      name: 'Abu Dhabi Export Office',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    downloadUrl: '#',
    fileSize: '4.1 MB',
    downloadCount: 3254,
    lastUpdated: '2023-12-10',
    tags: ['Export', 'Market Research', 'International Trade'],
    domain: 'International Business',
    businessStage: 'Expansion',
  },
  {
    id: '9',
    title: 'Business Growth Strategies Podcast',
    description:
      'Weekly podcast featuring interviews with successful entrepreneurs and business leaders sharing growth strategies.',
    mediaType: 'Podcast',
    episodes: 45,
    duration: '45:00',
    provider: {
      name: 'Abu Dhabi Business Network',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    audioUrl: 'https://www.example.com/podcast.mp3',
    tags: ['Business Growth', 'Entrepreneurship', 'Leadership'],
    domain: 'Business Strategy',
    businessStage: 'Growth',
  },
  {
    id: '10',
    title: 'Digital Transformation Workshop',
    description:
      'Practical workshop on implementing digital solutions to streamline business operations and enhance customer experience.',
    mediaType: 'Event',
    date: '2023-06-05',
    location: 'Yas Creative Hub',
    type: 'Workshop',
    organizer: 'Digital Abu Dhabi',
    provider: {
      name: 'Digital Abu Dhabi',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Digital Transformation', 'Technology', 'Operations'],
    domain: 'Digital Innovation',
    businessStage: 'Established',
  },
  {
    id: '11',
    title: 'Financial Planning Templates',
    description:
      'Ready-to-use templates for financial planning and forecasting with automated calculations and projections.',
    mediaType: 'Toolkits & Templates',
    type: 'Templates',
    provider: {
      name: 'Abu Dhabi Financial Services Authority',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    downloadUrl: '#',
    fileSize: '1.8 MB',
    downloadCount: 5632,
    lastUpdated: '2024-02-20',
    tags: ['Finance', 'Planning', 'Templates'],
    domain: 'Finance',
    businessStage: 'All Stages',
  },
  {
    id: '12',
    title: 'Abu Dhabi Investment Fund Allocates AED 1 Billion for Startups',
    description:
      'A new investment fund has been established to support innovative startups in key sectors.',
    mediaType: 'News',
    date: '2023-03-22',
    category: 'Investment',
    source: 'Financial Times UAE',
    provider: {
      name: 'Financial Times UAE',
      logoUrl: 'https://via.placeholder.com/50',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Investment', 'Startups', 'Funding'],
    domain: 'Finance',
    businessStage: 'Startup',
  },
]
