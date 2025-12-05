import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, AlertTriangle, Sparkles } from 'lucide-react';

interface ProfileSection {
  id: string;
  label: string;
  percentage: number;
}

const StudentProfilePage = () => {
  const [activeSection, setActiveSection] = useState<string>('skills-interests');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    'technical-capabilities': true,
    'soft-skills': false,
  });

  const profileSections: ProfileSection[] = [
    { id: 'academic-history', label: 'Academic History', percentage: 32 },
    { id: 'skills-interests', label: 'Skills & Interests', percentage: 0 },
    { id: 'learning-goals', label: 'Learning Goals', percentage: 60 },
    { id: 'account-settings', label: 'Account Settings', percentage: 100 },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span className="flex items-center gap-1">
          <span className="text-gray-400">🏠</span> Home
        </span>
        <ChevronRight className="w-4 h-4" />
        <span>Students</span>
        <ChevronRight className="w-4 h-4" />
        <span className="flex items-center gap-1">
          <span className="text-gray-400">👤</span> Profile
        </span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Profile</h1>

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-orange-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">Alex Rivera</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  Undergraduate Student
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">🎓</span>
                <span>Tech University</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-700 font-medium">8 missing mandatory fields</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Profile Strength</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-sm font-semibold text-gray-900">45%</span>
            </div>
            <button className="mt-2 flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Ask AI Advisor
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-4 px-6 py-4 border-b">
          <button className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex gap-4 flex-1">
            {profileSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{section.label}</span>
                  <span className={`flex items-center gap-1 text-xs ${
                    section.percentage === 100 ? 'text-green-600' : 
                    section.percentage > 0 ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      section.percentage === 100 ? 'bg-green-600' : 
                      section.percentage > 0 ? 'bg-yellow-600' : 'bg-gray-400'
                    }`}></span>
                    {section.percentage}%
                  </span>
                </div>
              </button>
            ))}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Academic History Content */}
      {activeSection === 'academic-history' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Academic History</h3>
            <span className="text-sm text-gray-600">3 sections available</span>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Current Education</h4>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Degree:</span>
                  <span className="font-medium">Bachelor of Science</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Major:</span>
                  <span className="font-medium">Computer Science</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Graduation:</span>
                  <span className="font-medium">May 2026</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Previous Education</h4>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
              </div>
              <p className="text-sm text-gray-500 italic">No previous education added</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Certifications</h4>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
              </div>
              <p className="text-sm text-gray-500 italic">No certifications added</p>
            </div>
          </div>
        </div>
      )}

      {/* Skills & Interests Content */}
      {activeSection === 'skills-interests' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Skills & Interests Overview</h3>
            <span className="text-sm text-gray-600">2 sections available</span>
          </div>

          {/* Technical Capabilities Section */}
          <div className="border border-gray-200 rounded-lg mb-4">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900">Technical Capabilities</h4>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    ⚠ REQUIRED
                  </span>
                  <span className="text-sm text-gray-500">0%</span>
                </div>
                <button
                  onClick={() => toggleSection('technical-capabilities')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit Section {expandedSections['technical-capabilities'] ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {expandedSections['technical-capabilities'] && (
              <div className="p-4 space-y-4">
                {/* Programming Languages */}
                <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">Programming Languages</span>
                        <span className="text-red-600 text-sm">*</span>
                      </div>
                      <div className="text-red-600 italic text-sm">Not provided</div>
                      <div className="text-red-600 text-xs mt-1">This field is required for certification</div>
                    </div>
                  </div>
                </div>

                {/* Frameworks */}
                <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">Frameworks</span>
                        <span className="text-red-600 text-sm">*</span>
                      </div>
                      <div className="text-red-600 italic text-sm">Not provided</div>
                      <div className="text-red-600 text-xs mt-1">This field is required for certification</div>
                    </div>
                  </div>
                </div>

                {/* Tools */}
                <div className="p-4 bg-white rounded border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">Tools</div>
                      <div className="text-gray-400 italic text-sm">Optional not provided</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded text-sm text-gray-700">
                  <span className="text-blue-600">ℹ️</span>
                  <span>Completing this section improves your course recommendations by 15%.</span>
                </div>
              </div>
            )}
          </div>

          {/* Soft Skills Section */}
          <div className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900">Soft Skills</h4>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    ⚠ REQUIRED
                  </span>
                  <span className="text-sm text-gray-500">0%</span>
                </div>
                <button
                  onClick={() => toggleSection('soft-skills')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit Section {expandedSections['soft-skills'] ? '▲' : '▼'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Goals Content */}
      {activeSection === 'learning-goals' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Learning Goals</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add New Goal
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Master React & TypeScript</h4>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">High Priority</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Build production-ready applications using modern React patterns and TypeScript</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 Target: Dec 2025</span>
                    <span>📚 Category: Technical Skills</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Improve Communication Skills</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Medium Priority</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Enhance presentation and public speaking abilities</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 Target: Mar 2026</span>
                    <span>📚 Category: Soft Skills</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>30%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <p className="text-gray-500 text-sm mb-3">Set more learning goals to get personalized course recommendations</p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">+ Add Another Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Content */}
      {activeSection === 'account-settings' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Account Settings</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">✓ Complete</span>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Notification Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email notifications for new courses</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Course recommendations</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Learning reminders</span>
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                </label>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Privacy Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Profile visible to other students</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show learning progress</span>
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                </label>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Account Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">alex.rivera@techuni.edu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium">TU-2024-1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">September 2024</span>
                </div>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">Change Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
