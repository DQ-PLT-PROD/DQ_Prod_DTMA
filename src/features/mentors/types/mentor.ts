/**
 * Mentor/Expert Types for DTMA Marketplace
 */

export interface Mentor {
  id: string;
  slug: string;
  name: string;
  title: string;
  organization: string;
  tagline: string;
  profileImage?: string;
  worksCount: number;
  bio: string;
  expertise: string[];
  location?: string;
  linkedIn?: string;
  website?: string;
  isFeatured?: boolean;

  // Detailed bio sections
  professionalSummary?: string;
  thoughtLeadership?: string;
  keyAchievements?: string[];
  education?: string[];
  specialization?: string;
  mentorshipApproach?: string;
  notableProjects?: string;
  speakingEngagements?: string[];
  academicBackground?: string;
  industryContributions?: string;
  testimonials?: {
    quote: string;
    author: string;
    role: string;
  }[];
  keyAreasOfExpertise?: {
    title: string;
    description: string;
  }[];
}

export interface MentorFilters {
  expertise?: string;
  search?: string;
}
