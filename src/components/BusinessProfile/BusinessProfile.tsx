import React, { useEffect, useState } from "react";
import { TabSection } from "./TabSection";
import { TableSection } from "./TableSection";
import { DocumentSection } from "./DocumentSection";
import { mockMultiEntryData, mockDocuments } from "../../utils/mockData";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
  MenuIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  profileConfig,
  getCompanyStageById,
  checkMandatoryFieldsCompletion,
} from "../../utils/config";
import {
  fetchBusinessProfileData,
  calculateSectionCompletion,
  calculateMandatoryCompletion,
} from "../../services/DataverseService";
import { BurgerMenuButton } from '../Sidebar';

export function BusinessProfile({
  activeSection = "profile",
  setIsOpen,
  isLoggedIn,
}: {
  activeSection?: string;
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
}) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showTabsMenu, setShowTabsMenu] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionCompletions, setSectionCompletions] = useState({});
  const [mandatoryCompletions, setMandatoryCompletions] = useState({});
  const [missingMandatoryFields, setMissingMandatoryFields] = useState([]);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const data = await fetchBusinessProfileData();
        setProfileData(data);

        const completions = {};
        const mandatoryStats = {};

        profileConfig.tabs.forEach((tab) => {
          const sectionData = data.sections[tab.id] || { fields: {} };
          completions[tab.id] = calculateSectionCompletion(sectionData);
          mandatoryStats[tab.id] = calculateMandatoryCompletion(
            sectionData,
            tab.id,
            data.companyStage,
            profileConfig
          );
        });

        setSectionCompletions(completions);
        setMandatoryCompletions(mandatoryStats);

        const mandatoryFieldsCheck = checkMandatoryFieldsCompletion(
          data,
          data.companyStage
        );
        setMissingMandatoryFields(mandatoryFieldsCheck.missing);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          setLogoUrl(e.target.result);
          setIsUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getAllSections = () => {
    return profileConfig.tabs.map((tab) => ({
      id: tab.id,
      title: tab.title,
      completion: sectionCompletions[tab.id] || 0,
      mandatoryCompletion: mandatoryCompletions[tab.id] || { percentage: 0 },
    }));
  };

  const getSectionsToDisplay = () => {
    const allSections = getAllSections();
    if (activeSection === "overview") {
      return allSections.slice(0, 3);
    } else if (activeSection === "profile") {
      return allSections;
    } else {
      return [
        {
          id: activeSection,
          title:
            profileConfig.tabs.find((tab) => tab.id === activeSection)?.title ||
            "Vision & Strategy",
          completion: sectionCompletions[activeSection] || 0,
          mandatoryCompletion: mandatoryCompletions[activeSection] || {
            percentage: 0,
          },
        },
      ];
    }
  };

  const sectionsToDisplay = getSectionsToDisplay();

  const overallMandatoryCompletion =
    profileData && (profileData as any).companyStage
      ? Math.round(
        (checkMandatoryFieldsCompletion(
          profileData,
          (profileData as any).companyStage
        ).completed /
          checkMandatoryFieldsCompletion(
            profileData,
            (profileData as any).companyStage
          ).total) *
        100
      )
      : 0;

  const getCurrentSectionTitle = () => {
    return sectionsToDisplay[activeTabIndex]?.title || "";
  };

  const getCurrentSectionConfig = () => {
    const currentSectionId = sectionsToDisplay[activeTabIndex]?.id;
    return profileConfig.tabs.find((tab) => tab.id === currentSectionId);
  };

  const getCurrentSectionData = () => {
    if (!profileData || !sectionsToDisplay[activeTabIndex]) return null;
    const currentSectionId = sectionsToDisplay[activeTabIndex].id;
    return (
      (profileData as any).sections[currentSectionId] || {
        fields: {},
        status: {},
      }
    );
  };

  const companyStage =
    profileData && (profileData as any).companyStage
      ? getCompanyStageById((profileData as any).companyStage)
      : null;

  return (
    <div className="flex-1 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20  py-3 px-3 sm:px-4 lg:px-6">
        <div className="lg:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className='sm:flex gap-2'>
            <div className='lg:hidden'>
              <BurgerMenuButton
                onClick={() => setIsOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            </div>
            <div className="flex items-center min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {activeSection === "overview"
                  ? "Business Overview"
                  : activeSection === "profile"
                    ? "Company Profile"
                    : activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {missingMandatoryFields.length > 0 && (
              <div className="flex items-center text-amber-600 min-w-0">
                <span className="flex items-center text-xs sm:text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 flex-shrink-0"></span>
                  <span className="hidden sm:inline truncate">
                    {missingMandatoryFields.length} missing mandatory fields
                  </span>
                  <span className="sm:hidden">
                    {missingMandatoryFields.length} missing
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full min-w-0">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline mr-2">
                Completion:
              </span>
              <div className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${overallMandatoryCompletion === 100
                    ? "bg-green-500"
                    : overallMandatoryCompletion >= 70
                      ? "bg-blue-500"
                      : overallMandatoryCompletion >= 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  style={{ width: `${overallMandatoryCompletion}%` }}
                ></div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 ml-2">
                {overallMandatoryCompletion}%
              </span>
            </div>
            {activeSection === "profile" && (
              <button
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 whitespace-nowrap"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show tabs" : "Show all"}
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mx-3 sm:mx-4 lg:mx-6">
          {/* Company Logo Section */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="relative flex-shrink-0">
                {logoUrl ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 group">
                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        className="p-1 bg-white rounded-full text-gray-700 hover:text-red-500"
                        onClick={() => setLogoUrl("")}
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${isUploadingLogo
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                      }`}
                    onClick={() => setIsUploadingLogo(true)}
                  >
                    {isUploadingLogo ? (
                      <div className="flex flex-col items-center">
                        <UploadIcon size={16} className="text-blue-500 mb-1" />
                        <span className="text-xs text-blue-500">Upload</span>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                    <h2 className="text-lg sm:text-xl font-medium text-gray-800 truncate">
                      {(profileData as any)?.name || "Company Name"}
                    </h2>
                    {companyStage && (
                      <span
                        className={`text-xs font-medium text-white px-2 py-1 rounded-full ${companyStage.color} self-start`}
                      >
                        {companyStage.label}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 break-words">
                  {(profileData as any)?.companyType || "Industry"} •{" "}
                  {(profileData as any)?.companySize || "Company Size"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Mandatory fields:
                  </span>
                  <div className="w-16 sm:w-20 h-1 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${overallMandatoryCompletion === 100
                        ? "bg-green-500"
                        : overallMandatoryCompletion >= 70
                          ? "bg-blue-500"
                          : overallMandatoryCompletion >= 30
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      style={{ width: `${overallMandatoryCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {overallMandatoryCompletion}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Section Selector */}
          {activeSection === "profile" && !showAll && (
            <div className="md:hidden border-b border-gray-200 bg-gray-50 p-3 sticky top-[73px] z-10">
              <div className="relative">
                <button
                  className="w-full px-3 py-2 text-left text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm flex justify-between items-center min-w-0"
                  onClick={() => setShowTabsMenu(!showTabsMenu)}
                >
                  <span className="truncate">{getCurrentSectionTitle()}</span>
                  <ChevronDownIcon size={16} className="flex-shrink-0 ml-2" />
                </button>
                {showTabsMenu && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                    {sectionsToDisplay.map((section, index) => (
                      <button
                        key={section.id}
                        className={`w-full text-left px-3 py-3 text-sm flex items-center justify-between min-w-0 ${activeTabIndex === index
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          setActiveTabIndex(index);
                          setShowTabsMenu(false);
                        }}
                      >
                        <span className="truncate flex-1">{section.title}</span>
                        <div className="flex items-center ml-2 flex-shrink-0">
                          {section.mandatoryCompletion.percentage === 100 ? (
                            <span className="flex items-center text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                              <CheckCircleIcon size={12} className="mr-1" />
                              {section.completion}%
                            </span>
                          ) : section.mandatoryCompletion.percentage > 0 ? (
                            <span className="flex items-center text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
                              {section.completion}%
                            </span>
                          ) : (
                            <span className="flex items-center text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1"></span>
                              {section.completion}%
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Tabs */}
          {activeSection === "profile" && !showAll && (
            <div className="hidden md:block border-b border-gray-200 bg-gray-50 sticky top-[73px] z-10">
              <div className="px-3 sm:px-4 lg:px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Current Section Display */}
                  <div className="flex items-center">
                    <span className="text-sm text-blue-600 font-medium">
                      {getCurrentSectionTitle()}
                    </span>
                    <div className="flex items-center ml-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {sectionsToDisplay[activeTabIndex]?.completion}% complete
                      </span>
                    </div>
                  </div>

                  {/* Section Selector Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => setShowTabsMenu(!showTabsMenu)}
                      style={{
                        width: 'auto',
                        minWidth: '250px',
                      }}
                    >
                      <span className="flex justify-center w-full">View More Sections(13)</span>
                      <ChevronDownIcon size={16} className="ml-2" />
                    </button>
                    {showTabsMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowTabsMenu(false)}
                        ></div>
                        {/* Dropdown */}
                        <div
                          className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-[9999] border border-gray-200"
                          style={{ zIndex: 9999 }}
                        >
                          <div className="py-1 max-h-64 overflow-y-auto">
                            {sectionsToDisplay.map((section, index) => (
                              <button
                                key={section.id}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 ${activeTabIndex === index
                                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                                  : "text-gray-700"
                                  }`}
                                onClick={() => {
                                  setActiveTabIndex(index);
                                  setShowTabsMenu(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{section.title}</span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {section.completion}% complete
                                  </span>
                                </div>
                                {activeTabIndex === index && (
                                  <CheckCircleIcon
                                    size={16}
                                    className="text-blue-600"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Content Area */}
          <div className="p-3 sm:p-4 md:p-6 min-w-0">
            {sectionsToDisplay.map((section, index) => (
              <div
                key={section.id}
                className={
                  activeSection === "profile" &&
                    !showAll &&
                    activeTabIndex !== index
                    ? "hidden"
                    : "block min-w-0"
                }
                role="tabpanel"
                id={`panel-${section.id}`}
                aria-labelledby={`tab-${section.id}`}
              >
                {profileConfig.tabs.find((tab) => tab.id === section.id) && (
                  <TabSection
                    config={
                      profileConfig.tabs.find((tab) => tab.id === section.id)!
                        .groups
                    }
                    data={
                      (profileData as any)?.sections[section.id] || {
                        fields: {},
                        status: {},
                      }
                    }
                    completion={section.completion}
                    companyStage={(profileData as any)?.companyStage}
                    mandatoryCompletion={section.mandatoryCompletion}
                  />
                )}

                {mockMultiEntryData[section.id] &&
                  mockMultiEntryData[section.id].map(
                    (tableData: any, idx: any) => (
                      <div key={idx} className="mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                        <TableSection
                          title={tableData.title}
                          columns={tableData.columns}
                          data={tableData.data}
                        />
                      </div>
                    )
                  )}

                {mockDocuments[section.id] && (
                  <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                    <DocumentSection
                      title="Section Documents"
                      documents={mockDocuments[section.id]}
                    />
                  </div>
                )}

                {!mockMultiEntryData[section.id] &&
                  !mockDocuments[section.id] &&
                  (!(profileData as any)?.sections[section.id]?.fields ||
                    Object.keys(
                      (profileData as any)?.sections[section.id]?.fields
                    ).length === 0) && (
                    <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-center py-6 sm:py-8 md:py-10 lg:py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <div className="flex flex-col items-center px-4">
                        <div className="p-3 bg-gray-100 rounded-full mb-4">
                          <AlertTriangleIcon
                            size={24}
                            className="text-gray-400"
                          />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                          No {section.title} Data
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md break-words text-center">
                          This section doesn't have any data yet. Use the Edit
                          Section button in each group to add information.
                        </p>
                        {(profileData as any)?.companyStage && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md max-w-md w-full">
                            <p className="text-sm text-amber-700 break-words">
                              <span className="font-medium">Note:</span> Some
                              fields in this section are mandatory for your
                              company's {companyStage?.label} stage.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
