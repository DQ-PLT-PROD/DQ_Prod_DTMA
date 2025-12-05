import React from "react";
import {
  ShieldIcon,
  LaptopIcon,
  ClockIcon,
  ExternalLinkIcon,
} from "lucide-react";
// Mock data for connected devices
const mockDevices = [
  {
    id: 1,
    name: "Windows 11 - Chrome",
    location: "Dubai, UAE",
    lastActive: "2 minutes ago",
    isCurrent: true,
  },
  {
    id: 2,
    name: "MacBook Pro - Safari",
    location: "Dubai, UAE",
    lastActive: "2 days ago",
    isCurrent: false,
  },
  {
    id: 3,
    name: "iPhone 13 - Mobile Safari",
    location: "Abu Dhabi, UAE",
    lastActive: "5 days ago",
    isCurrent: false,
  },
];
export default function SecurityComplianceTab() {
  return (
    <div className="space-y-6">
      {/* Security & Access Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Security & Access
        </h2>
        <div className="space-y-4">
          {/* Password Reset Link */}
          <div className="bg-white p-4 border border-gray-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <ShieldIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Password Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Reset your password or manage your security settings
                    </p>
                    <div className="mt-3">
                      <a
                        href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reset password with Azure External ID
                        <ExternalLinkIcon className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Connected Devices - Greyed Out */}
          <div className="bg-white p-4 border border-gray-200 rounded-md opacity-50 cursor-not-allowed">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-900">
                  Connected Devices
                </h3>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {mockDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-start p-3 border border-gray-100 rounded-md bg-gray-50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <LaptopIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {device.name}
                          </h4>
                          {device.isCurrent && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>{device.location}</span>
                          <span className="mx-1">•</span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {device.lastActive}
                          </span>
                        </div>
                      </div>
                      {!device.isCurrent && (
                        <button className="text-xs text-red-600 hover:text-red-800">
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Audit & Activity Logs Section (Coming Soon) */}
      <section className="opacity-50 cursor-not-allowed">
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Audit & Activity Logs
          </h2>
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-gray-500">
            Track user activities and system events for security and compliance
            purposes.
          </p>
        </div>
      </section>
      {/* Data Management & Compliance Section (Coming Soon) */}
      <section className="opacity-50 cursor-not-allowed">
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Data Management & Compliance
          </h2>
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-gray-500">
            Manage data retention policies, data export, and compliance
            settings.
          </p>
        </div>
      </section>
    </div>
  );
}
