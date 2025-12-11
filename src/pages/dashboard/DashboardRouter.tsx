import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../components/Header";
import { FEATURES } from "../../config/features";
import DashboardLayout from "./DashboardLayout";
import { DocumentsPage } from "./documents";
import { Overview } from "./overview";
import { ServiceRequestsPage } from "./serviceRequests";
import { isOnboardingCompleted } from "../../services/DataverseService";
import { OnboardingForm } from "./onboarding/OnboardingForm";
import { ReportsPage } from "./reportingObligations/ReportsPage";
import { AllReceivedReportsPage } from "./reportingObligations/AllReceivedReportsPage";
import { AllSubmittedReportsPage } from "./reportingObligations/AllSubmittedReportsPage";
import { AllUpcomingObligationsPage } from "./reportingObligations/AllUpcomingObligationsPage";
import StudentProfilePage from "./studentProfile";
import SupportPage from "./support";
import SettingsPage from "./settings";
import { ChatInterface } from "../../components/Chat/ChatInterface";

// Form imports
import BookConsultationForEntrepreneurship from "../forms/BookConsultationForEntrepreneurship";
import CancelLoan from "../forms/CancelLoan";
import DisburseApprovedLoan from "../forms/DisburseApprovedLoan";
import FacilitateCommunication from "../forms/FacilitateCommunication";
import IssueSupportLetter from "../forms/IssueSupportLetter";
import NeedsAssessmentForm from "../forms/NeedsAssessmentForm";
import ReallocationOfLoanDisbursement from "../forms/ReallocationOfLoanDisbursement";
import RequestForFunding from "../forms/RequestForFunding";
import RequestForMembership from "../forms/RequestForMembership";
import RequestToAmendExistingLoanDetails from "../forms/RequestToAmendExistingLoanDetails";
import TrainingInEntrepreneurship from "../forms/TrainingInEntrepreneurship";
import CollateralUserGuide from "../forms/CollateralUserGuide";

// Main Dashboard Router Component
const DashboardRouter = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 1024; // lg and up open by default
      }
    } catch { }
    return true;
  });
  
  // Get actual authentication state from AuthContext
  const { user } = useAuth();
  const isLoggedIn = !!user; // Convert user object to boolean
  const setIsLoggedIn = () => {}; // Dummy setter since auth state is managed by AuthContext
  
  const location = useLocation();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const checkOnboarding = async () => {
  //     try {
  //       const completed = await isOnboardingCompleted();
  //       setOnboardingComplete(!!completed);
  //       if (!completed) {
  //         if (!location.pathname.includes("/dashboard/onboarding")) {
  //           navigate("/dashboard/onboarding", { replace: true });
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error checking onboarding status:", error);
  //     } finally {
  //       // no-op
  //     }
  //   };
  //   checkOnboarding();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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

  // If onboarding is complete and user is on onboarding route, send to overview
  // useEffect(() => {
  //   if (
  //     onboardingComplete &&
  //     location.pathname.includes("/dashboard/onboarding")
  //   ) {
  //     navigate("/dashboard/overview", { replace: true });
  //   }
  // }, [onboardingComplete, location.pathname, navigate]);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    navigate("/dashboard/overview", { replace: true });
  };

  // useEffect(() => {
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //         setIsLoggedIn(true);
  //     } else {
  //         navigate('/', { replace: true });
  //     }
  // }, [navigate]);

  return (
    <DashboardLayout
      onboardingComplete={onboardingComplete}
      setOnboardingComplete={setOnboardingComplete}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
    >
      <Routes>
        <Route
          index
          element={
            <Navigate
              to={onboardingComplete ? "overview" : "onboarding"}
              replace
            />
          }
        />
        <Route
          path="onboarding"
          element={
            <OnboardingForm
              onComplete={handleOnboardingComplete}
              isRevisit={onboardingComplete}
            />
          }
        />
        <Route path="overview" element={<Overview setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />

        {/* Feature Flagged: Documents */}
        {FEATURES.USER_DASHBOARD_CORE && FEATURES.ADVANCED_FORMS ? (
          <Route
            path="documents"
            element={
              <DocumentsPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          />
        ) : (
          <Route path="documents" element={<Navigate to="/404" replace />} />
        )}

        {/* Feature Flagged: Service Requests */}
        {FEATURES.ADVANCED_FORMS ? (
          <Route
            path="requests"
            element={
              <ServiceRequestsPage
                setIsOpen={setIsOpen}
                isLoggedIn={isLoggedIn}
              />
            }
          />
        ) : (
          <Route path="requests" element={<Navigate to="/404" replace />} />
        )}

        {/* Feature Flagged: Reporting Obligations */}
        {FEATURES.ADVANCED_FORMS ? (
          <>
            <Route
              path="reporting"
              element={<Navigate to="reporting-obligations" replace />}
            />
            <Route path="reporting-obligations" element={<ReportsPage setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />
            <Route
              path="reporting-obligations/obligations"
              element={<AllUpcomingObligationsPage />}
            />
            <Route
              path="reporting-obligations/submitted"
              element={<AllSubmittedReportsPage />}
            />
            <Route
              path="reporting-obligations/received"
              element={<AllReceivedReportsPage />}
            />
          </>
        ) : (
          <Route path="reporting*" element={<Navigate to="/404" replace />} />
        )}

        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="settings" element={<SettingsPage setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />
        <Route path="support" element={<SupportPage setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />

        {/* Support Chat - Feature Flag with fallback if AI disabled */}
        {FEATURES.AI_CHATBOT ? (
          <Route path="chat-support" element={<ChatInterface setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />
        ) : (
          <Route path="chat-support" element={<SupportPage setIsOpen={setIsOpen} isLoggedIn={isLoggedIn} />} />
        )}

        {/* Forms Routes - Feature Flagged */}
        {FEATURES.ADVANCED_FORMS ? (
          <>
            <Route
              path="forms/book-consultation-for-entrepreneurship"
              element={<BookConsultationForEntrepreneurship />}
            />
            <Route path="forms/cancel-loan" element={<CancelLoan />} />
            <Route
              path="forms/collateral-user-guide"
              element={<CollateralUserGuide />}
            />
            <Route
              path="forms/disburse-approved-loan"
              element={<DisburseApprovedLoan />}
            />
            <Route
              path="forms/facilitate-communication"
              element={<FacilitateCommunication />}
            />
            <Route
              path="forms/issue-support-letter"
              element={<IssueSupportLetter />}
            />
            <Route
              path="forms/reallocation-of-loan-disbursement"
              element={<ReallocationOfLoanDisbursement />}
            />
            <Route
              path="forms/request-for-funding"
              element={<RequestForFunding />}
            />
            <Route
              path="forms/request-for-membership"
              element={<RequestForMembership />}
            />
            <Route
              path="forms/request-to-amend-existing-loan-details"
              element={<RequestToAmendExistingLoanDetails />}
            />
            <Route
              path="forms/training-in-entrepreneurship"
              element={<TrainingInEntrepreneurship />}
            />
          </>
        ) : null}

        {/* Allow Needs Assessment globally or per feature config */}
        <Route
          path="forms/needs-assessment-form"
          element={<NeedsAssessmentForm />}
        />

        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRouter;
