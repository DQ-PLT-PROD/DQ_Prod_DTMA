import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "lucide-react";
import {
  BuildingIcon,
  CreditCardIcon,
  UsersIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  LucideProps,
} from "lucide-react";

interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
}

const courseCategories: CourseCategory[] = [
  {
    id: "d1",
    name: "D1 - Digital Economy 4.0 (E4.0)",
    description: "Why should organisations change?",
    icon: BuildingIcon,
    href: "/marketplace/courses?category=d1",
  },
  {
    id: "d2",
    name: "D2 - Digital Cognitive Organisation (DCO)",
    description: "Where are organisations headed?",
    icon: UsersIcon,
    href: "/marketplace/courses?category=d2",
  },
  {
    id: "d3",
    name: "D3 - Digital Business Platform (DBP)",
    description: "What legacy value or orchestration engine?",
    icon: CreditCardIcon,
    href: "/marketplace/courses?category=d3",
  },
  {
    id: "d4",
    name: "D4 - Digital Transformation 2.0 (DT2.0)",
    description: "How to design and deploy the target.",
    icon: TrendingUpIcon,
    href: "/marketplace/courses?category=d4",
  },
  {
    id: "d5",
    name: "D5 - Digital Worker & Digital Workspace",
    description: "Who are the orchestrators?",
    icon: GraduationCapIcon,
    href: "/marketplace/courses?category=d5",
  },
  {
    id: "d6",
    name: "D6 - Digital Accelerators (Tools)",
    description: "When will we get there?",
    icon: TrendingUpIcon,
    href: "/marketplace/courses?category=d6",
  },
];

// TODO: Add more categories or fetch dynamically
interface ExploreDropdownProps {
  isCompact?: boolean;
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function ExploreDropdown({ isCompact = false }: ExploreDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % courseCategories.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? courseCategories.length - 1 : prev - 1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
          itemRefs.current[focusedIndex]?.click();
        }
        break;
      case "Tab":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleInternalNav = (href: string) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    navigate(href);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className="flex items-center text-white hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Explore courses menu"
      >
        <span>Explore Courses</span>
        <ChevronDownIcon
          size={16}
          className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-[24rem] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 py-4 px-3"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="explore-menu"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              D6 Course Categories
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              The Digital Qatalyst 6XD curriculum tracks
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {courseCategories.map((category, index) => {
              const Icon = category.icon;
              const external = isExternal(category.href);

              return (
                <a
                  key={category.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  href={category.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={`flex items-start px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                    focusedIndex === index ? "bg-gray-50" : ""
                  }`}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={(e) => {
                    if (!external) {
                      e.preventDefault();
                      handleInternalNav(category.href);
                    }
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onFocus={() => setFocusedIndex(index)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={20} className="text-[#1839AD]" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {category.name}
                    </p>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <span className="text-base text-gray-300">❯</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
