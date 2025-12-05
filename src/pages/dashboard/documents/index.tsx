import React, { useState } from "react";

import { BellIcon, UploadIcon } from "lucide-react";
import { DocumentNotification } from "../../../components/DocumentWallet/DocumentNotification";
import { DocumentUpload } from "../../../components/DocumentWallet/DocumentUpload";
import { DocumentWallet } from "../../../components/DocumentWallet/DocumentWallet";
import { mockDocumentData } from "../../../components/DocumentWallet/mockDocumentData";
import { BurgerMenuButton } from "../../../components/Sidebar";

export function DocumentsPage({
  isOpen,
  setIsOpen,
  isLoggedIn,
  setIsLoggedIn,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get expiring documents (within 30 days)
  const getExpiringDocuments = () => {
    if (!mockDocumentData) return [];
    const today = new Date();
    return mockDocumentData.filter((doc) => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(doc.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
    });
  };

  const expiringDocuments = getExpiringDocuments();

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="sticky top-0 z-20 py-3 px-4 lg:px-6">
        <div className="flex flex-row items-center justify-between">
          <div className='flex gap-4'>
            <div className='lg:hidden mt-2'>
              <BurgerMenuButton
                onClick={() => setIsOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 pt-1.5 pb-2">
              Document Wallet
            </h1>
          </div>

          {/* Notification + Upload buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 relative"
              >

                <BellIcon size={20} />
                {expiringDocuments.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {expiringDocuments.length}
                  </span>
                )}
              </button>
              {showNotifications && expiringDocuments.length > 0 && (
                <DocumentNotification
                  documents={expiringDocuments}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* Upload buttons (desktop + mobile) */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="md:flex hidden items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              <UploadIcon size={16} className="mr-1" />
              Upload Document
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex md:hidden items-center justify-center p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50"
            >
              <UploadIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Document Wallet */}
      <DocumentWallet />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <DocumentUpload
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={(newDoc) => {
            // Handle document upload logic here
            setIsUploadModalOpen(false);
          }}
          categories={[
            "Licensing",
            "Legal",
            "Certifications",
            "Compliance",
            "Insurance",
            "Facilities",
            "Tax",
            "HR",
          ]}
        />
      )}
    </div>
  );
}
