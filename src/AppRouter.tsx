import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/lib/auth";
import { RoleSwitcherProvider } from "@/features/instructor-portal";
import { App } from "./App";
import { CourseCatalogPage } from "./features/courses/pages/CourseCatalogPage";
import CourseDetailsPage from "./features/courses/pages/CourseDetailsPage";
import DashboardRouter from "./features/dashboard/pages/DashboardRouter";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import NotFound from "./features/app/pages/NotFound";
import { PortalLayout } from "./features/portal/layout/PortalLayout";
import InProgressPage from "./features/portal/pages/InProgressPage";
import CoursePlayerPage from "./features/portal/pages/CoursePlayerPage";
import LearnerOnboarding from "./features/dashboard/pages/onboarding";
import ProfilePage from "./features/portal/pages/ProfilePage";
import BadgesPage from "./features/portal/pages/BadgesPage";
import { QuizAuditPage } from "./features/portal/pages/QuizAuditPage";
import { ComingSoon } from "./features/app/pages/ComingSoon";
import { AuthDebugPanel } from "./features/auth/components/AuthDebugPanel";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleSwitcherProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<App />} />

              {/* Course routes */}
              <Route path="/courses" element={<CourseCatalogPage />} />
              <Route path="/courses/:itemId" element={<CourseDetailsPage />} />

              {/* Payment success handler */}
              <Route path="/payment/success" element={<PaymentSuccessHandler />} />

              {/* Legacy marketplace routes - redirect to new course routes */}
              <Route path="/marketplace/courses" element={<Navigate to="/courses" replace />} />
              <Route path="/marketplace/courses/:itemId" element={<Navigate to="/courses/:itemId" replace />} />

          {/* Portal / Learning */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<Navigate to="my-courses/in-progress" replace />} />
            <Route path="onboarding" element={<LearnerOnboarding layout="portal" />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="my-courses/in-progress" element={<InProgressPage />} />
            <Route path="learning/:courseId" element={<CoursePlayerPage />} />
            {/* Backward compatibility for /learning?courseId=... */}
          </Route>

              {/* Portal / Learning */}
              <Route path="/portal" element={<PortalLayout />}>
                <Route index element={<Navigate to="my-courses/in-progress" replace />} />
                <Route path="onboarding" element={<LearnerOnboarding layout="portal" />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="my-courses/in-progress" element={<InProgressPage />} />
                <Route 
                  path="learning/:courseId" 
                  element={
                    <EnrollmentGuard>
                      <CoursePlayerPage />
                    </EnrollmentGuard>
                  } 
                />
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

              {/* Instructor Portal */}
              <Route
                path="/instructor"
                element={
                  <ProtectedRoute>
                    <InstructorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="course-management" element={<CourseManagementPage />} />
                <Route path="course-management/course/new" element={<CourseForm />} />
                <Route path="course-management/course/:id" element={<CourseForm />} />
                <Route path="course-management/module/new" element={<ModuleForm />} />
                <Route path="course-management/module/:id" element={<ModuleForm />} />
                <Route path="course-management/lesson/new" element={<LessonForm />} />
                <Route path="course-management/lesson/:id" element={<LessonForm />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="students" element={<ComingSoon />} />
                <Route path="learning-paths" element={<ComingSoon />} />
                <Route path="analytics" element={<ComingSoon />} />
                <Route path="settings" element={<ComingSoon />} />
              </Route>

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
          </Suspense>
        </RoleSwitcherProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
