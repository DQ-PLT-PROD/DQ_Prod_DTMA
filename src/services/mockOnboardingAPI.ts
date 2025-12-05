// Mock Onboarding API Service
// This service simulates API calls for onboarding data persistence

interface OnboardingData {
  id?: string;
  tradeName?: string;
  industry?: string;
  businessSize?: string;
  registrationNumber?: string;
  establishmentDate?: string;
  businessPitch?: string;
  problemStatement?: string;
  employeeCount?: number;
  founders?: string;
  foundingYear?: number;
  initialCapital?: number;
  fundingNeeds?: number;
  needsList?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  companyStage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OnboardingStatus {
  isComplete: boolean;
  completedSteps: number[];
  lastSavedAt?: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
const mockAPIResponses = {
  success: { success: true, message: "Operation completed successfully" },
  error: { success: false, message: "An error occurred" }
};

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_DATA: 'onboardingData',
  ONBOARDING_PROGRESS: 'onboardingProgress',
  ONBOARDING_STATUS: 'onboardingStatus',
  ONBOARDING_COMPLETE: 'onboardingComplete'
};

// Mock API service
export const mockOnboardingAPI = {
  // Check onboarding status
  async checkOnboardingStatus(): Promise<OnboardingStatus> {
    await delay(300); // Simulate API latency
    
    try {
      const statusData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS);
      const isComplete = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
      
      if (statusData) {
        return JSON.parse(statusData);
      }
      
      return {
        isComplete,
        completedSteps: [],
        lastSavedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return {
        isComplete: false,
        completedSteps: [],
        lastSavedAt: new Date().toISOString()
      };
    }
  },

  // Save onboarding progress (intermediate state)
  async saveOnboardingProgress(formData: OnboardingData): Promise<{ success: boolean; message: string }> {
    await delay(500); // Simulate API latency
    
    try {
      // Save progress data
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, JSON.stringify({
        ...formData,
        updatedAt: new Date().toISOString()
      }));

      // Update status
      const currentStatus = await this.checkOnboardingStatus();
      const updatedStatus = {
        ...currentStatus,
        lastSavedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(updatedStatus));
      
      return mockAPIResponses.success;
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      return mockAPIResponses.error;
    }
  },

  // Save complete onboarding data
  async saveOnboardingData(formData: OnboardingData): Promise<{ success: boolean; message: string }> {
    await delay(800); // Simulate API latency
    
    try {
      // Clean and validate form data
      const cleanedData = this.cleanFormData(formData);
      
      // Save complete data
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify({
        ...cleanedData,
        id: cleanedData.id || this.generateId(),
        createdAt: cleanedData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Mark onboarding as complete
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      
      // Update status
      const updatedStatus = {
        isComplete: true,
        completedSteps: [0, 1, 2, 3, 4, 5], // All steps completed
        lastSavedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(updatedStatus));
      
      return mockAPIResponses.success;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return mockAPIResponses.error;
    }
  },

  // Load onboarding data
  async loadOnboardingData(): Promise<OnboardingData | null> {
    await delay(200); // Simulate API latency
    
    try {
      // Try to load complete data first
      const completeData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      if (completeData) {
        return JSON.parse(completeData);
      }

      // Fallback to progress data
      const progressData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      if (progressData) {
        return JSON.parse(progressData);
      }

      return null;
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return null;
    }
  },

  // Load onboarding progress
  async loadOnboardingProgress(): Promise<OnboardingData | null> {
    await delay(200); // Simulate API latency
    
    try {
      const progressData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      if (progressData) {
        return JSON.parse(progressData);
      }
      return null;
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
      return null;
    }
  },

  // Reset onboarding data
  async resetOnboardingData(): Promise<{ success: boolean; message: string }> {
    await delay(300); // Simulate API latency
    
    try {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      
      return mockAPIResponses.success;
    } catch (error) {
      console.error('Error resetting onboarding data:', error);
      return mockAPIResponses.error;
    }
  },

  // Helper methods
  cleanFormData(formData: OnboardingData): OnboardingData {
    const cleaned: OnboardingData = {};
    
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof OnboardingData];
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          cleaned[key as keyof OnboardingData] = value.trim() as any;
        } else {
          cleaned[key as keyof OnboardingData] = value;
        }
      }
    });
    
    return cleaned;
  },

  generateId(): string {
    return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get mock initial data (for testing/demo purposes)
  getMockInitialData(): OnboardingData {
    return {
      tradeName: "Future Tech Solutions",
      industry: "Technology",
      companyStage: "Startup",
      contactName: "John Smith",
      email: "jsmith.futuretech@gmail.com",
      phone: "+971501234567",
      businessSize: "small",
      registrationNumber: "TRN-2024-001",
      establishmentDate: "15/01/2024",
      businessPitch: "We develop innovative software solutions for small and medium businesses to streamline their operations and increase productivity.",
      problemStatement: "Many SMEs struggle with outdated systems and manual processes that slow down their operations and limit growth potential.",
      employeeCount: 8,
      founders: "John Smith, Sarah Johnson",
      foundingYear: 2024,
      initialCapital: 50000,
      fundingNeeds: 200000,
      needsList: "Marketing support, technology infrastructure, talent acquisition, market expansion",
      address: "123 Business Bay, Dubai",
      city: "Dubai",
      country: "UAE",
      website: "https://www.futuretech.com"
    };
  }
};

// Export individual functions for backward compatibility
export const checkOnboardingStatus = mockOnboardingAPI.checkOnboardingStatus.bind(mockOnboardingAPI);
export const saveOnboardingProgress = mockOnboardingAPI.saveOnboardingProgress.bind(mockOnboardingAPI);
export const saveOnboardingData = mockOnboardingAPI.saveOnboardingData.bind(mockOnboardingAPI);
export const loadOnboardingData = mockOnboardingAPI.loadOnboardingData.bind(mockOnboardingAPI);
export const loadOnboardingProgress = mockOnboardingAPI.loadOnboardingProgress.bind(mockOnboardingAPI);
export const resetOnboardingData = mockOnboardingAPI.resetOnboardingData.bind(mockOnboardingAPI);
