import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/Header";
import { App } from "./App";
import { CourseCatalogPage } from "./features/courses/pages/CourseCatalogPage";
import CourseDetailsPage from "./features/courses/pages/CourseDetailsPage";
import DashboardRouter from "./features/dashboard/pages/DashboardRouter";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import NotFound from "./features/app/pages/NotFound";
import { PortalLayout } from "./features/portal/layout/PortalLayout";
import InProgressPage from "./features/portal/pages/InProgressPage";
import CoursePlayerPage from "./features/portal/pages/CoursePlayerPage";
import { QuizAuditPage } from "./features/portal/pages/QuizAuditPage";
import { ComingSoon } from "./features/app/pages/ComingSoon";
import { AuthDebugPanel } from "./features/auth/components/AuthDebugPanel";

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

          {/* Portal / Learning */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<Navigate to="my-courses/in-progress" replace />} />
            <Route path="my-courses/in-progress" element={<InProgressPage />} />
            <Route path="learning/:courseId" element={<CoursePlayerPage />} />
            {/* Backward compatibility for /learning?courseId=... */}
          </Route>

          <Route path="/portal/admin/audit-quizzes" element={<QuizAuditPage />} />

          {/* Redirect /learning to /portal for backward compatibility */}
          <Route path="/learning" element={<Navigate to="/portal" replace />} />

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
