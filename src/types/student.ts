// Student Profile Types
export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  studentType: 'Undergraduate Student' | 'Graduate Student' | 'Professional';
  university: string;
  profileStrength: number;
  missingMandatoryFields: number;
}

export interface TechnicalCapabilities {
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
}

export interface SoftSkills {
  skills: string[];
}

export interface SkillsAndInterests {
  technicalCapabilities: TechnicalCapabilities;
  softSkills: SoftSkills;
  completionPercentage: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LearningGoals {
  goals: LearningGoal[];
  completionPercentage: number;
}

export interface AcademicHistory {
  degree: string;
  major: string;
  university: string;
  graduationYear?: number;
  gpa?: number;
  completionPercentage: number;
}

export interface AccountSettings {
  emailNotifications: boolean;
  courseRecommendations: boolean;
  privacySettings: string;
  completionPercentage: number;
}

export type ProfileSection = 
  | 'academic-history'
  | 'skills-interests'
  | 'learning-goals'
  | 'account-settings';
