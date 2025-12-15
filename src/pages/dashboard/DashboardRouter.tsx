import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { Overview } from "./overview";

// Main Dashboard Router Component
const DashboardRouter = () => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 1024; // lg and up open by default
      }
    } catch { }
    return true;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Keep sidebar hidden on tablet/mobile by default; open on desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <DashboardLayout
      onboardingComplete={true}
      setOnboardingComplete={() => { }}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
    >
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />

        {/* Legacy routes redirect to 404 */}
        <Route path="requests" element={<Navigate to="/404" replace />} />
        <Route path="reporting*" element={<Navigate to="/404" replace />} />
        <Route path="documents" element={<Navigate to="/404" replace />} />
        <Route path="onboarding" element={<Navigate to="/404" replace />} />
        <Route path="forms/*" element={<Navigate to="/404" replace />} />

        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRouter;
