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
  User,
  HelpCircle,
  ExternalLink,
  Plus,
  Check,
  Menu,
  MessageCircleIcon,
  BookOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// BurgerMenuButton - Mobile hamburger menu trigger
interface BurgerMenuButtonProps {
  onClick?: () => void;
  className?: string;
  isLoggedIn?: boolean;
  "data-id"?: string;
}

export const BurgerMenuButton: React.FC<BurgerMenuButtonProps> = ({
  onClick,
  className = "",
  isLoggedIn = true,
  "data-id": dataId,
}) => {
  if (!isLoggedIn) return null;
  return (
    <button
      onClick={onClick}
      className={`p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors ${className}`}
      data-id={dataId}
      aria-label="Open navigation menu"
    >
      <Menu size={24} />
    </button>
  );
};

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
        href: "/portal/onboarding",
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
      label: "Learning Portal",
      icon: <BookOpen size={20} />,
      href: "/portal",
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
      className={`fixed lg:static left-0 top-16 bottom-0 z-40 w-64 bg-surface-container-low border-r border-outline-variant transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:w-60 overflow-y-auto`}
      data-id={dataId}
    >
      {/* Header with Company Switcher */}
      <div className="p-4 border-b border-outline-variant">
        <div className="flex justify-between items-center mb-3">
          <button className="lg:hidden text-on-surface-variant hover:text-on-surface" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-surface-container-highest transition-colors group"
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-primary font-bold text-title-md leading-tight truncate group-hover:text-primary">
                {activeCompany.name}
              </h2>
              {activeCompany.badge && (
                <span className="text-label-sm text-on-surface-variant font-medium mt-0.5 block">
                  {activeCompany.badge}
                </span>
              )}
            </div>
            <ChevronDown
              size={20}
              className={`text-on-surface-variant transition-transform ml-2 flex-shrink-0 ${companyDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {companyDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant rounded-md shadow-elevation-2 z-50 overflow-hidden">
              <div className="py-1">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    className="w-full px-3 py-2 text-left text-label-lg hover:bg-surface-container-highest flex items-center justify-between transition-colors"
                    onClick={() => onCompanyChange?.(company.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-on-surface truncate">
                        {company.name}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {company.role}
                      </div>
                    </div>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      {company.badge && (
                        <span className="text-xs bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full mr-2">
                          {company.badge}
                        </span>
                      )}
                      {company.isActive && (
                        <Check size={16} className="text-primary" />
                      )}
                    </div>
                  </button>
                ))}
                <div className="border-t border-outline-variant mt-1 pt-1">
                  <button
                    className="w-full px-3 py-2 text-left text-label-lg hover:bg-surface-container-highest flex items-center text-primary"
                    onClick={onAddNewEnterprise}
                  >
                    <Plus size={18} className="mr-3 flex-shrink-0" />
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
        <div className="bg-tertiary-container p-3 m-3 rounded-md border border-tertiary/20">
          <div className="flex items-start">
            <Info
              size={18}
              className="text-on-tertiary-container mt-0.5 mr-2 flex-shrink-0"
            />
            <p className="text-body-sm text-on-tertiary-container">
              Complete the onboarding process to unlock all sections of the
              platform.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1">
        {getMenuItems().map((item) => {
          if (item.category === "category") {
            return (
              <div key={item.id} className="px-4 pt-6 pb-2">
                <div className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            );
          }

          const isDisabled = !onboardingComplete && item.id !== "onboarding";
          const isActive = activeSection === item.id;

          // M3 Active State: rounded-full (pill), secondary-container bg, on-secondary-container text
          // M3 Inactive State: text-on-surface-variant, hover:bg-surface-container-highest
          const baseClasses = `flex items-center px-4 py-3 rounded-full transition-all duration-200 font-medium text-label-lg ${isActive
            ? "bg-secondary-container text-on-secondary-container shadow-sm"
            : isDisabled
              ? "text-on-surface/38 cursor-not-allowed"
              : "text-on-surface-variant hover:bg-on-surface-variant/8 hover:text-on-surface cursor-pointer"
            }`;
          return (
            <Link
              key={item.id}
              to={item.href || "#"}
              className={baseClasses}
            >
              <span className="flex items-center justify-center w-6 h-6 mr-3">
                {item.icon}
              </span>
              <span className="text-label-lg font-medium tracking-wide">
                {item.label}
              </span>
              {item.external && <ExternalLink size={16} className="ml-auto text-on-surface-variant/50" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
