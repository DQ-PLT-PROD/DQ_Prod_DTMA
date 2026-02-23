import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/lib/auth";
import { RoleSwitcherProvider } from "@/features/instructor-portal";
import { App } from "./App";

// Lazy load page components for code splitting
const CourseCatalogPage = lazy(() => import("./features/courses/pages/CourseCatalogPage").then(m => ({ default: m.CourseCatalogPage })));
const CourseDetailsPage = lazy(() => import("./features/courses/pages/CourseDetailsPage"));
const DashboardRouter = lazy(() => import("./features/dashboard/pages/DashboardRouter"));
const ProtectedRoute = lazy(() => import("@/components/auth/ProtectedRoute"));
const NotFound = lazy(() => import("./features/app/pages/NotFound"));
const PortalLayout = lazy(() => import("./features/portal/layout/PortalLayout").then(m => ({ default: m.PortalLayout })));
const InProgressPage = lazy(() => import("./features/portal/pages/InProgressPage"));
const CoursePlayerPage = lazy(() => import("./features/portal/pages/CoursePlayerPage"));
const LearnerOnboarding = lazy(() => import("./features/dashboard/pages/onboarding"));
const ProfilePage = lazy(() => import("./features/portal/pages/ProfilePage"));
const QuizAuditPage = lazy(() => import("./features/portal/pages/QuizAuditPage").then(m => ({ default: m.QuizAuditPage })));
const ComingSoon = lazy(() => import("./features/app/pages/ComingSoon").then(m => ({ default: m.ComingSoon })));
const AuthDebugPanel = lazy(() => import("@/components/auth/AuthDebugPanel").then(m => ({ default: m.AuthDebugPanel })));
const EnrollmentGuard = lazy(() => import("./features/courses/components/guards/EnrollmentGuard").then(m => ({ default: m.EnrollmentGuard })));
const PaymentSuccessHandler = lazy(() => import("./features/courses/components/payment/PaymentSuccessHandler").then(m => ({ default: m.PaymentSuccessHandler })));

// Instructor Portal lazy imports
const InstructorLayout = lazy(() => import("./features/instructor-portal/layout/InstructorLayout").then(m => ({ default: m.InstructorLayout })));
const InstructorDashboard = lazy(() => import("./features/instructor-portal/pages/InstructorDashboard").then(m => ({ default: m.InstructorDashboard })));
const CourseManagementPage = lazy(() => import("./features/instructor-portal/pages/CourseManagementPage").then(m => ({ default: m.CourseManagementPage })));
const CourseForm = lazy(() => import("./features/instructor-portal/components/course-management/CourseForm").then(m => ({ default: m.CourseForm })));
const ModuleForm = lazy(() => import("./features/instructor-portal/components/course-management/ModuleForm").then(m => ({ default: m.ModuleForm })));
const LessonForm = lazy(() => import("./features/instructor-portal/components/course-management/LessonForm").then(m => ({ default: m.LessonForm })));
const MediaLibraryPage = lazy(() => import("./features/instructor-portal/pages/MediaLibraryPage").then(m => ({ default: m.MediaLibraryPage })));


// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

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
