import React, { useEffect, useState, useRef } from "react";
// import Link from 'next/link';
import {
  X,
  ChevronDown,
  Info,
  Lock,
  Home,
  Users,
  Settings,
  BarChart3,
  User,
  FolderOpen,
  Send,
  HelpCircle,
  ExternalLink,
  Plus,
  Check,
  Menu,
  MessageCircleIcon,
  BookOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  role: string;
  isActive?: boolean;
  badge?: string;
}
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category?: "category";
  external?: boolean;
  href?: string; // <--- new
}
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeSection?: string;
  onboardingComplete?: boolean;
  companyName?: string;
  companies?: Company[];
  onCompanyChange?: (companyId: string) => void;
  onAddNewEnterprise?: () => void;
  isLoggedIn?: boolean;
  "data-id"?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  onboardingComplete = true,
  companies = [
    {
      id: "1",
      name: "FutureTech LLC",
      role: "Owner",
      isActive: true,
      badge: "Primary",
    },
    {
      id: "2",
      name: "StartupCo Inc",
      role: "Admin",
      badge: "Secondary",
    },
    {
      id: "3",
      name: "Enterprise Solutions",
      role: "Member",
    },
  ],
  onCompanyChange,
  onAddNewEnterprise,
  isLoggedIn = true,
  "data-id": dataId,
}) => {
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [formsDropdownOpen, setFormsDropdownOpen] = useState(false);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formsDropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const section = location.pathname.split("/")[2] || "dashboard";
    setActiveSection(section);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCompanyDropdownOpen(false);
      }
      if (
        formsDropdownRef.current &&
        !formsDropdownRef.current.contains(event.target as Node)
      ) {
        setFormsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      const menuItems = getMenuItems().filter(
        (item) => item.category !== "category"
      );
      switch (event.key) {
        case "Escape":
          if (companyDropdownOpen) {
            setCompanyDropdownOpen(false);
            return;
          }
          if (formsDropdownOpen) {
            setFormsDropdownOpen(false);
            return;
          }
          onClose?.();
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedMenuIndex((prev) => {
            const next = prev < menuItems.length - 1 ? prev + 1 : 0;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedMenuIndex((prev) => {
            const next = prev > 0 ? prev - 1 : menuItems.length - 1;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, companyDropdownOpen, formsDropdownOpen, onClose]);

  if (!isLoggedIn) return null;

  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    if (!onboardingComplete) {
      items.push({
        id: "onboarding",
        label: "Onboarding",
        icon: <Users size={20} />,
        href: "/dashboard/onboarding",
      });
    } else {
      items.push({
        id: "overview",
        label: "Overview",
        icon: <Home size={20} />,
        href: "/dashboard/overview",
      });
    }

    items.push({
      id: "learning",
      label: "Learning Page",
      icon: <BookOpen size={20} />,
      href: "/learning",
    });

    items.push(
      {
        id: "essentials",
        label: "ESSENTIALS",
        category: "category",
      } as MenuItem,
      {
        id: "profile",
        label: "Profile",
        icon: <User size={20} />,
        href: "/dashboard/profile",
      },
      {
        id: "documents",
        label: "Documents",
        icon: <FolderOpen size={20} />,
        href: "/dashboard/documents",
      },
      {
        id: "transactions",
        label: "TRANSACTIONS",
        category: "category",
      } as MenuItem,
      {
        id: "requests",
        label: "Requests",
        icon: <Send size={20} />,
        href: "/dashboard/requests",
      },
      {
        id: "reporting-obligations",
        label: "Reporting Obligations",
        icon: <BarChart3 size={20} />,
        href: "/dashboard/reporting-obligations",
      },
      // {
      //   id: "forms",
      //   label: "Forms",
      //   icon: <FolderOpen size={20} />,
      // } as MenuItem,
      {
        id: "settings-support",
        label: "Settings & Support",
        category: "category",
      } as MenuItem,
      {
        id: "settings",
        label: "Settings",
        icon: <Settings size={20} />,
        href: "/dashboard/settings",
      },
      {
        id: "support",
        label: "Support",
        icon: <HelpCircle size={20} />,
        href: "/dashboard/support",
      },
      {
        id: "chat-support",
        label: "Chat Support",
        icon: <MessageCircleIcon size={20} />,
        href: "/dashboard/chat-support",
      },
      // {
      //   id: "help-center",
      //   label: "Help Center",
      //   icon: <ExternalLink size={16} />,
      //   external: true,
      //   href: "https://docs.example.com/help",
      // }
    );
    return items;
  };

  const activeCompany = companies.find((c) => c.isActive) || companies[0];

  return (
    <div
      className={`fixed lg:static left-0 top-16 bottom-0 z-40 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:w-60 overflow-y-auto`}
      data-id={dataId}
    >
      {/* Header with Company Switcher */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <button className="lg:hidden text-gray-500" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-full flex items-center justify-between text-left p-3 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-blue-800 font-bold text-lg leading-tight truncate">
                {activeCompany.name}
              </h2>
              {activeCompany.badge && (
                <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                  {activeCompany.badge}
                </span>
              )}
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform ml-2 flex-shrink-0 ${companyDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {companyDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => onCompanyChange?.(company.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.role}
                      </div>
                    </div>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      {company.badge && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                          {company.badge}
                        </span>
                      )}
                      {company.isActive && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-blue-600"
                    onClick={onAddNewEnterprise}
                  >
                    <Plus size={16} className="mr-2 flex-shrink-0" />
                    Add New Enterprise
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Banner */}
      {!onboardingComplete && (
        <div className="bg-amber-50 p-3 m-3 rounded-md border border-amber-200">
          <div className="flex items-start">
            <Info
              size={16}
              className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
            />
            <p className="text-xs text-amber-700">
              Complete the onboarding process to unlock all sections of the
              platform.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="py-2">
        {getMenuItems().map((item) => {
          if (item.category === "category") {
            return (
              <div key={item.id} className="px-4 pt-6 pb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
                  {item.label}
                </div>
              </div>
            );
          }

          const isDisabled = !onboardingComplete && item.id !== "onboarding";
          const isActive = activeSection === item.id;

          const baseClasses = `flex items-center px-4 py-3 relative transition-colors ${isActive
            ? "bg-blue-700 text-white"
            : isDisabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`;

          const content = (
            <>
              <span className="w-8 flex items-center justify-center flex-shrink-0">
                {isDisabled && !isActive ? (
                  <div className="relative">
                    {item.icon}
                    <Lock
                      size={10}
                      className="absolute -top-1 -right-1 text-gray-400"
                    />
                  </div>
                ) : (
                  item.icon
                )}
              </span>
              <span className="flex-1 ml-3">{item.label}</span>
              {item.external && !isDisabled && (
                <ExternalLink
                  size={14}
                  className="text-gray-400 ml-2 flex-shrink-0"
                />
              )}
            </>
          );

          // Special handling for Forms dropdown
          if (item.id === "forms" && !isDisabled) {
            return (
              <div key={item.id} className="relative" ref={formsDropdownRef}>
                <div
                  className={`${baseClasses} cursor-pointer`}
                  onClick={() => setFormsDropdownOpen(!formsDropdownOpen)}
                >
                  <span className="w-8 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="flex-1 ml-3">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ml-2 flex-shrink-0 ${formsDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${formsDropdownOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="transform transition-transform duration-300 ease-in-out max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <Link
                      to="/dashboard/forms/book-consultation-for-entrepreneurship"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Book Consultation for Entrepreneurship
                    </Link>
                    <Link
                      to="/dashboard/forms/collateral-user-guide"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Collateral User Guide
                    </Link>
                    <Link
                      to="/dashboard/forms/cancel-loan"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Cancel Loan
                    </Link>

                    <Link
                      to="/dashboard/forms/disburse-approved-loan"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Disburse an Approved Loan
                    </Link>
                    <Link
                      to="/dashboard/forms/facilitate-communication"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Facilitate Communication
                    </Link>
                    <Link
                      to="/dashboard/forms/issue-support-letter"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Issue Support Letter
                    </Link>
                    <Link
                      to="/dashboard/forms/needs-assessment-form"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Needs Assessment Form
                    </Link>
                    <Link
                      to="/dashboard/forms/reallocation-of-loan-disbursement"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Reallocation of Loan Disbursement
                    </Link>
                    <Link
                      to="/dashboard/forms/request-for-funding"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Request For Funding
                    </Link>
                    <Link
                      to="/dashboard/forms/request-for-membership"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Request for Membership
                    </Link>
                    <Link
                      to="/dashboard/forms/request-to-amend-existing-loan-details"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Request to Amend Existing Loan Details
                    </Link>
                    <Link
                      to="/dashboard/forms/training-in-entrepreneurship"
                      className="flex items-center px-4 py-3 pl-12 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setFormsDropdownOpen(false)}
                    >
                      Training in Entrepreneurship
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          if (item.href && !isDisabled) {
            return item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={baseClasses}
              >
                {content}
              </a>
            ) : (
              <Link key={item.id} to={item.href} className={baseClasses}>
                {content}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className={baseClasses}
              onMouseEnter={() => isDisabled && setTooltipItem(item.id)}
              onMouseLeave={() => setTooltipItem(null)}
            >
              {content}
              {tooltipItem === item.id && (
                <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs py-2 px-3 rounded-md w-48 z-50">
                  Complete onboarding to unlock this section
                  <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

// Burger menu stays the same
export const BurgerMenuButton: React.FC<{
  onClick: () => void;
  className?: string;
  isLoggedIn?: boolean;
  "data-id"?: string;
}> = ({ onClick, className = "", isLoggedIn = true, "data-id": dataId }) => {
  if (!isLoggedIn) return null;
  return (
    <button
      onClick={onClick}
      className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ${className}`}
      data-id={dataId}
      aria-label="Open navigation menu"
    >
      <Menu size={24} />
    </button>
  );
};
