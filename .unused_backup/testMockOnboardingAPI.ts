// Test script for mock onboarding API
// This can be run in the browser console to test the functionality

import { mockOnboardingAPI } from './src/services/mockOnboardingAPI';

// Test function to verify mock API functionality
export const testMockOnboardingAPI = async () => {
  console.log('🧪 Testing Mock Onboarding API...');
  
  try {
    // Test 1: Check initial status
    console.log('1. Checking initial onboarding status...');
    const initialStatus = await mockOnboardingAPI.checkOnboardingStatus();
    console.log('Initial status:', initialStatus);
    
    // Test 2: Save progress
    console.log('2. Saving onboarding progress...');
    const testData = {
      tradeName: "Test Company",
      industry: "Technology",
      contactName: "Test User",
      email: "test@example.com",
      phone: "+971501234567"
    };
    
    const saveProgressResult = await mockOnboardingAPI.saveOnboardingProgress(testData);
    console.log('Save progress result:', saveProgressResult);
    
    // Test 3: Load progress
    console.log('3. Loading onboarding progress...');
    const loadedProgress = await mockOnboardingAPI.loadOnboardingProgress();
    console.log('Loaded progress:', loadedProgress);
    
    // Test 4: Save complete data
    console.log('4. Saving complete onboarding data...');
    const completeData = {
      ...testData,
      businessSize: "small",
      registrationNumber: "TRN-2024-001",
      establishmentDate: "15/01/2024",
      businessPitch: "We provide innovative technology solutions",
      problemStatement: "Many businesses struggle with outdated systems",
      employeeCount: 5,
      founders: "Test User, Test Partner",
      foundingYear: 2024,
      initialCapital: 50000,
      fundingNeeds: 100000,
      needsList: "Marketing, technology, talent",
      address: "123 Test Street",
      city: "Dubai",
      country: "UAE",
      website: "https://www.testcompany.com"
    };
    
    const saveCompleteResult = await mockOnboardingAPI.saveOnboardingData(completeData);
    console.log('Save complete result:', saveCompleteResult);
    
    // Test 5: Check final status
    console.log('5. Checking final onboarding status...');
    const finalStatus = await mockOnboardingAPI.checkOnboardingStatus();
    console.log('Final status:', finalStatus);
    
    // Test 6: Load complete data
    console.log('6. Loading complete onboarding data...');
    const loadedComplete = await mockOnboardingAPI.loadOnboardingData();
    console.log('Loaded complete data:', loadedComplete);
    
    console.log('✅ All tests completed successfully!');
    
    return {
      success: true,
      results: {
        initialStatus,
        saveProgressResult,
        loadedProgress,
        saveCompleteResult,
        finalStatus,
        loadedComplete
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test localStorage persistence
export const testLocalStoragePersistence = () => {
  console.log('🧪 Testing localStorage persistence...');
  
  const keys = [
    'onboardingData',
    'onboardingProgress', 
    'onboardingStatus',
    'onboardingComplete'
  ];
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value ? JSON.parse(value) : 'Not found');
  });
  
  console.log('✅ localStorage persistence test completed!');
};

// Clear all onboarding data for testing
export const clearOnboardingData = async () => {
  console.log('🧹 Clearing all onboarding data...');
  
  const result = await mockOnboardingAPI.resetOnboardingData();
  console.log('Clear result:', result);
  
  // Also clear localStorage manually
  const keys = [
    'onboardingData',
    'onboardingProgress', 
    'onboardingStatus',
    'onboardingComplete'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ All onboarding data cleared!');
};

// Usage instructions
console.log(`
📋 Mock Onboarding API Test Instructions:

1. Run testMockOnboardingAPI() to test the complete flow
2. Run testLocalStoragePersistence() to check localStorage data
3. Run clearOnboardingData() to reset all data

Example usage:
  import { testMockOnboardingAPI } from './testMockOnboardingAPI';
  await testMockOnboardingAPI();
`);
