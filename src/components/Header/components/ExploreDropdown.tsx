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
    name: "Mastering Economy 4.0",
    description: "Navigating the opportunities and challenges in the new economy",
    icon: BuildingIcon,
    href: "/marketplace/courses?category=d1",
  },
  {
    id: "d2",
    name: "Building Tommorrow’s Organisations",
    description:
      "Where organizations are headed in the age of digital transformation",
    icon: UsersIcon,
    href: "/marketplace/courses?category=d2",
  },
  {
    id: "d3",
    name: "Understanding the Core/Engine of Digital Transformation",
    description:
      "What legacy value or orchestration engine powers the future?",
    icon: CreditCardIcon,
    href: "/marketplace/courses?category=d3",
  },
  {
    id: "d4",
    name: "Designing for the Future",
    description:
      "How to design and deploy next-generation transformation frameworks",
    icon: TrendingUpIcon,
    href: "/marketplace/courses?category=d4",
  },
  {
    id: "d5",
    name: "Architecting Change",
    description:
      "Who are the orchestrators of the new digital workspace?",
    icon: GraduationCapIcon,
    href: "/marketplace/courses?category=d5",
  },
  {
    id: "d6",
    name: "Empowering Change",
    description:
      "When will we get there? Exploring tools to accelerate transformation",
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
          className="absolute top-full left-0 mt-2 w-[32rem] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 py-5 px-4"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="explore-menu"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Discover Course Categories
            </h3>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {courseCategories.map((category, index) => {
              const Icon = category.icon;
              const external = isExternal(category.href);

              return (
                <a
                  key={category.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  href={category.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={`flex items-start px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${focusedIndex === index ? "bg-gray-50" : ""
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
