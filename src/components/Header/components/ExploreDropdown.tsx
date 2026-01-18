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

import { COURSE_CATEGORIES } from "../../../constants/navigation";

// Local interface REMOVED in favor of shared type if needed, or we just rely on the constant's inferred type.
// But actually, the file uses `interface CourseCategory` locally.
// I will import the values and remove the local definition.

// Note: I'm deleting the local big array and the interface.


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
        setFocusedIndex((prev) => (prev + 1) % COURSE_CATEGORIES.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? COURSE_CATEGORIES.length - 1 : prev - 1));
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
        className="flex items-center text-white hover:text-white/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-md px-2 py-1"
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
          className="absolute top-full left-0 mt-2 w-[32rem] max-w-[95vw] md-card-elevated z-50 py-5 px-4"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="explore-menu"
        >
          <div className="px-4 py-2 border-b border-[color:var(--md-outline-variant)]">
            <h3 className="text-sm font-semibold text-[color:var(--md-on-surface)]">
              Discover Course Categories
            </h3>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {COURSE_CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              const external = isExternal(category.href);

              return (
                <a
                  key={category.slug}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  href={category.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={`flex items-start px-4 py-3 text-left hover:bg-[color:var(--md-surface-variant)] focus:bg-[color:var(--md-surface-variant)] focus:outline-none transition-colors duration-150 ${focusedIndex === index ? "bg-[color:var(--md-surface-variant)]" : ""
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
                    <Icon size={20} className="text-[color:var(--md-primary)]" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--md-on-surface)]">
                      {category.title}
                    </p>
                    {category.description && (
                      <p className="text-xs text-[color:var(--md-on-surface-variant)] mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <span className="text-base text-[color:var(--md-on-surface-variant)]">❯</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
