import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/Header";
import { MarketplaceRouter } from "./pages/marketplace/MarketplaceRouter";
import { App } from "./App";
import MarketplaceDetailsPage from "./pages/marketplace/MarketplaceDetailsPage";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import LearningScreen from "./pages/LearningScreen";
import { ComingSoon } from "./pages/ComingSoon";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/courses" element={<App />} />
          <Route
            path="/courses/:itemId"
            element={<MarketplaceDetailsPage marketplaceType="courses" />}
          />
          <Route path="/marketplace/*" element={<MarketplaceRouter />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="/learning" element={<LearningScreen />} />

          {/* Coming Soon pages */}
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/coming-soon/:feature" element={<ComingSoon />} />

          {/* Legacy routes - redirect to 404 */}
          <Route path="/growth-areas-marketplace" element={<Navigate to="/404" replace />} />
          <Route path="/growth-areas" element={<Navigate to="/404" replace />} />
          <Route path="/business-directory-marketplace" element={<Navigate to="/404" replace />} />
          <Route path="/discover-abudhabi" element={<Navigate to="/404" replace />} />
          <Route path="/forms/*" element={<Navigate to="/404" replace />} />
          <Route path="/documentation" element={<Navigate to="/coming-soon/documentation" replace />} />
          <Route path="/documentation/*" element={<Navigate to="/coming-soon/documentation" replace />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
