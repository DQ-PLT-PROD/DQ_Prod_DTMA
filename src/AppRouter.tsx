import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/Header";
import { App } from "./App";
import { CourseCatalogPage } from "./pages/courses/CourseCatalogPage";
import CourseDetailsPage from "./pages/courses/CourseDetailsPage";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import LearningScreen from "./pages/LearningScreen";
import { ComingSoon } from "./pages/ComingSoon";
import { AuthCallback } from "./components/AuthCallback";
import { AuthDebugPanel } from "./components/AuthDebugPanel";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />

          {/* Course routes */}
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:itemId" element={<CourseDetailsPage />} />

          {/* Legacy marketplace routes - redirect to new course routes */}
          <Route path="/marketplace/courses" element={<Navigate to="/courses" replace />} />
          <Route path="/marketplace/courses/:itemId" element={<Navigate to="/courses/:itemId" replace />} />

          {/* Dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Learning */}
          <Route path="/learning" element={<LearningScreen />} />
          
          {/* Auth Debug Panel - for testing authentication and user sync */}
          <Route path="/auth-debug" element={
            <div className="min-h-screen bg-gray-100 py-8">
              <AuthDebugPanel />
            </div>
          } />

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
          <Route path="/marketplace/*" element={<Navigate to="/courses" replace />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
