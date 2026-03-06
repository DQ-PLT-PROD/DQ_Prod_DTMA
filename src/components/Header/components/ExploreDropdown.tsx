import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, GraduationCapIcon } from "lucide-react";
import { CourseNavItem, fetchPublishedCoursesForNav } from "@/services/courseService";
interface ExploreDropdownProps {
  isCompact?: boolean;
}

export function ExploreDropdown({ isCompact = false }: ExploreDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [courses, setCourses] = useState<CourseNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const courseItems = useMemo(() => courses, [courses]);

  useEffect(() => {
    let isMounted = true;

    fetchPublishedCoursesForNav()
      .then((items) => {
        if (isMounted) {
          setCourses(items);
        }
      })
      .catch((error) => {
        console.error("Failed to load published courses for navigation:", error);
        if (isMounted) {
          setCourses([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(courseItems.length > 0 ? 0 : -1);
      }
      return;
    }
    if (courseItems.length === 0) {
      if (event.key === "Escape" || event.key === "Tab") {
        setIsOpen(false);
        setFocusedIndex(-1);
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
        setFocusedIndex((prev) => (prev + 1) % courseItems.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev <= 0 ? courseItems.length - 1 : prev - 1,
        );
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
        aria-label="Courses menu"
      >
        <span>Courses</span>
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
              Explore Courses
            </h3>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-[color:var(--md-on-surface-variant)]">
                Loading published courses...
              </div>
            ) : courseItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[color:var(--md-on-surface-variant)]">
                No published courses are available yet.
              </div>
            ) : (
              courseItems.map((course, index) => {
                const href = `/courses?course=${encodeURIComponent(course.slug)}`;

                return (
                  <a
                    key={course.slug}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    href={href}
                    className={`flex items-start px-4 py-3 text-left hover:bg-[color:var(--md-surface-variant)] focus:bg-[color:var(--md-surface-variant)] focus:outline-none transition-colors duration-150 ${
                      focusedIndex === index
                        ? "bg-[color:var(--md-surface-variant)]"
                        : ""
                    }`}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={(event) => {
                      event.preventDefault();
                      handleInternalNav(href);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <GraduationCapIcon
                        size={20}
                        className="text-[color:var(--md-primary)]"
                      />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-[color:var(--md-on-surface)]">
                        {course.title}
                      </p>
                      {course.shortDescription && (
                        <p className="mt-1 line-clamp-2 text-xs text-[color:var(--md-on-surface-variant)]">
                          {course.shortDescription}
                        </p>
                      )}
                    </div>
                    <span className="text-base text-[color:var(--md-on-surface-variant)]">
                      ❯
                    </span>
                  </a>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
