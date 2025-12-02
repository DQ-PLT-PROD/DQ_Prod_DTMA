import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface TabDef {
  id: string;
  label: string;
}

export interface TabsNavProps {
  tabs: TabDef[];
  activeTab: string;
  onChange: (id: string) => void;
  // overflow behavior handled in parent for now
  showNavigation: boolean;
  showTabsMenu: boolean;
  setShowTabsMenu: (v: boolean) => void;
  tabsRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollLeft: () => void;
  scrollRight: () => void;
  onCheckOverflow?: () => void;
  rightContent?: React.ReactNode;
}

const TabsNav: React.FC<TabsNavProps> = ({
  tabs,
  activeTab,
  onChange,
  showNavigation,
  showTabsMenu,
  setShowTabsMenu,
  tabsRef,
  containerRef,
  scrollLeft,
  scrollRight,
  onCheckOverflow,
  rightContent,
}) => {
  // Check overflow on mount and window resize
  useEffect(() => {
    if (onCheckOverflow) {
      onCheckOverflow();

      const handleResize = () => {
        onCheckOverflow();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [onCheckOverflow]);
  return (
    <div className="border-b border-gray-200 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div ref={containerRef} className="flex items-center w-full relative">
          {showNavigation && (
            <button
              className="absolute left-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors bg-white z-10"
              onClick={scrollLeft}
              aria-label="Scroll tabs left"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div
            ref={tabsRef}
            className="flex overflow-x-auto scrollbar-hide w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-lg ${activeTab === tab.id
                  ? "text-blue-700 bg-blue-50 border border-blue-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>
          {showNavigation && (
            <>
              <button
                className="absolute right-8 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors bg-white z-10"
                onClick={scrollRight}
                aria-label="Scroll tabs right"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute right-0">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors bg-white z-10"
                  onClick={() => setShowTabsMenu(!showTabsMenu)}
                  aria-label="Show all tabs menu"
                  aria-expanded={showTabsMenu}
                >
                  <MoreHorizontal size={16} />
                </button>
                {showTabsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowTabsMenu(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <div className="py-1 max-h-64 overflow-y-auto">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeTab === tab.id
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                            onClick={() => {
                              onChange(tab.id);
                              setShowTabsMenu(false);
                            }}
                            role="menuitem"
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {rightContent && (
            <div className="ml-auto pl-4 flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { TabsNav };
export default TabsNav;
