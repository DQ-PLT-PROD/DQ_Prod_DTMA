import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  XIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  MapPinIcon,
  BuildingIcon,
  TagIcon,
  BarChart3Icon,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: number;
    name: string;
    logo: string;
    category: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    address?: string;
    founded?: string;
    employees?: string;
    revenue?: string;
    services?: string[];
  } | null;
}

const ProfileModal = ({ isOpen, onClose, profile }: ProfileModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalRoot = document.getElementById('modal-root') || document.body;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-xl overflow-hidden w-full max-w-4xl my-8 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header - Fixed at the top */}
        <div className="p-4 sm:p-6 flex justify-between items-center border-b sticky top-0 bg-white z-10">
          <div className="flex items-center min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mr-3 sm:mr-4 shadow-sm flex-shrink-0">
              <img
                src={profile.logo}
                alt={`${profile.name} logo`}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold truncate">
                {profile.name}
              </h3>
              <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-light bg-opacity-20 text-primary-dark text-xs rounded-full font-body font-medium">
                {profile.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="font-display text-lg font-bold mb-3">About</h4>
                  <p className="font-body text-gray-600">
                    {profile.description}
                  </p>
                </div>
                
                {profile.services && (
                  <div>
                    <h4 className="font-display text-lg font-bold mb-3">
                      Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-body"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl h-fit space-y-6">
                <div>
                  <h4 className="font-display text-lg font-bold mb-3">
                    Contact Information
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <PhoneIcon className="w-4 h-4 mt-1 mr-2.5 text-primary flex-shrink-0" />
                      <a
                        href={`tel:${profile.phone}`}
                        className="font-body text-gray-600 hover:text-primary text-sm sm:text-base break-words"
                      >
                        {profile.phone}
                      </a>
                    </li>
                    <li className="flex items-start">
                      <MailIcon className="w-4 h-4 mt-1 mr-2.5 text-primary flex-shrink-0" />
                      <a
                        href={`mailto:${profile.email}`}
                        className="font-body text-gray-600 hover:text-primary text-sm sm:text-base break-all"
                      >
                        {profile.email}
                      </a>
                    </li>
                    <li className="flex items-start">
                      <GlobeIcon className="w-4 h-4 mt-1 mr-2.5 text-primary flex-shrink-0" />
                      <a
                        href={`https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-gray-600 hover:text-primary text-sm sm:text-base break-all"
                      >
                        {profile.website}
                      </a>
                    </li>
                    {profile.address && (
                      <li className="flex items-start">
                        <MapPinIcon className="w-4 h-4 mt-1 mr-2.5 text-primary flex-shrink-0" />
                        <span className="font-body text-gray-600 text-sm sm:text-base">
                          {profile.address}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {(profile.founded || profile.employees || profile.revenue) && (
                  <div>
                    <h4 className="font-display text-lg font-bold mb-3">
                      Company Details
                    </h4>
                    <ul className="space-y-3">
                      {profile.founded && (
                        <li className="flex items-center">
                          <BuildingIcon className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                          <span className="font-body text-gray-600 text-sm sm:text-base">
                            Founded: {profile.founded}
                          </span>
                        </li>
                      )}
                      {profile.employees && (
                        <li className="flex items-center">
                          <TagIcon className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                          <span className="font-body text-gray-600 text-sm sm:text-base">
                            Employees: {profile.employees}
                          </span>
                        </li>
                      )}
                      {profile.revenue && (
                        <li className="flex items-center">
                          <BarChart3Icon className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                          <span className="font-body text-gray-600 text-sm sm:text-base">
                            Revenue: {profile.revenue}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Close button at the bottom */}
            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default ProfileModal;
