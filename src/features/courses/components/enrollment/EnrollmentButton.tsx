/**
 * Enrollment Button Component
 * Handles enrollment state and CTA display
 * Updated for Jan 29 Spec: Plan selection and payment integration
 * Integrated with CTA State Manager (D2)
 */
import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { useAuth } from "../../../../components/Header";
import {
  isUserEnrolled,
  enrollInCourse,
  getEnrollment,
  getAccessContract,
} from "../../services/enrollmentService";
import { EnrollmentModal } from "./EnrollmentModal";
import { PlanSelectionModal } from "./PlanSelectionModal";
import { courseRequiresPayment } from "../../services/paymentService";
import { Course } from "../../../../types/dtma-lms";
import { useToast } from "../../../../components/ui/Toast";
import { getCtaState, CtaConfig } from "../../utils/ctaStateManager";

interface EnrollmentButtonProps {
  course: Course;
  onEnrollmentSuccess?: () => void;
  className?: string;
  variant?: "primary" | "secondary";
}

export const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({
  course,
  onEnrollmentSuccess,
  className = "",
  variant = "primary",
}) => {
  const { user, databaseUser, login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [ctaConfig, setCtaConfig] = useState<CtaConfig | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [requiresPayment, setRequiresPayment] = useState(false);

  // Check enrollment status on mount and when user changes
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      console.log("🔍 Checking enrollment status for:", {
        userId: databaseUser?.id,
        courseSlug: course.slug,
        courseId: course.id,
        courseTitle: course.title,
        hasUser: !!user,
        hasDatabaseUser: !!databaseUser,
        supabaseConfigured: !!(import.meta as any).env?.VITE_SUPABASE_URL,
      });

      // Check if course requires payment
      const courseIdentifier = course.slug || course.id;
      const needsPayment = courseRequiresPayment(courseIdentifier);
      setRequiresPayment(needsPayment);

      if (!databaseUser?.id) {
        console.log("❌ No database user, setting not-enrolled state");
        const config = getCtaState(course.isComingSoon || false, null);
        setCtaConfig(config);
        return;
      }

      if (!course.slug && !course.id) {
        console.error("❌ Both course slug and id are missing!", course);
        const config = getCtaState(course.isComingSoon || false, null);
        setCtaConfig(config);
        return;
      }

      try {
        console.log("🔍 Fetching access contract for:", courseIdentifier);

        // Get access contract (includes enrollment status and progress)
        const accessContract = await getAccessContract(
          databaseUser.id,
          courseIdentifier
        );
        console.log("✅ Access contract result:", accessContract);

        // Use CTA state manager to determine button state
        const config = getCtaState(
          course.isComingSoon || false,
          accessContract,
          accessContract?.progressPct
        );
        setCtaConfig(config);
      } catch (error) {
        console.error("❌ Error checking enrollment status:", error);
        const config = getCtaState(course.isComingSoon || false, null);
        setCtaConfig(config);
      }
    };

    checkEnrollmentStatus();
  }, [databaseUser?.id, course.slug, course.id, course.isComingSoon]);

  const handleEnrollClick = async () => {
    if (!ctaConfig) return;

    // If not authenticated, trigger login
    if (!user) {
      await login();
      return;
    }

    // Handle different CTA states
    switch (ctaConfig.state) {
      case "coming-soon":
        // Do nothing - button is disabled
        return;

      case "continue":
      case "view-certificate":
        // Navigate to course player
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        }
        return;

      case "re-enroll":
      case "enroll":
        // Check if payment is required
        if (requiresPayment) {
          setShowPlanModal(true);
        } else {
          setShowModal(true);
        }
        return;

      default:
        return;
    }
  };

  const handleEnrollmentConfirm = async () => {
    if (!databaseUser?.id) return;

    setIsEnrolling(true);
    try {
      console.log("🚀 Starting enrollment for user:", databaseUser.id);
      const courseIdentifier = course.slug || course.id;
      const result = await enrollInCourse(
        databaseUser.id,
        courseIdentifier,
        "explicit"
      );

      if (result.success) {
        // Update CTA state to enrolled
        const accessContract = await getAccessContract(
          databaseUser.id,
          courseIdentifier
        );
        const config = getCtaState(
          course.isComingSoon || false,
          accessContract
        );
        setCtaConfig(config);

        setShowModal(false);

        console.log("✅ Successfully enrolled in course:", course.title);

        // Show success toast
        showToast(
          `🎉 Successfully enrolled in "${course.title}"! You now have full access to all course content.`,
          "success"
        );

        if (onEnrollmentSuccess) {
          // Small delay to let user see the success message
          setTimeout(() => {
            onEnrollmentSuccess();
          }, 1500);
        }
      } else {
        console.error("❌ Enrollment failed:", result.error);
        showToast(
          `Enrollment failed: ${result.error}. Please try again or contact support.`,
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Error during enrollment:", error);
      showToast(
        `Unexpected error during enrollment. Please check your connection and try again.`,
        "error"
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const getButtonContent = () => {
    if (!ctaConfig) {
      return (
        <>
          <Loader2 size={16} className="animate-spin" />
          Loading...
        </>
      );
    }

    if (!user && ctaConfig.state === "enroll") {
      return (
        <>
          <BookOpen size={16} />
          Sign In to Enroll
        </>
      );
    }

    // Use icon based on CTA state
    const getIcon = () => {
      switch (ctaConfig.state) {
        case "continue":
        case "view-certificate":
          return <CheckCircle size={16} />;
        case "re-enroll":
          return <RotateCcw size={16} />;
        case "enroll":
        default:
          return <BookOpen size={16} />;
      }
    };

    return (
      <>
        {getIcon()}
        {ctaConfig.label}
      </>
    );
  };

  const getButtonStyles = () => {
    const baseStyles =
      "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    if (!ctaConfig) {
      return `${baseStyles} bg-gray-200 text-gray-500`;
    }

    if (variant === "secondary") {
      return `${baseStyles} bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-50 hover:text-blue-800 shadow-sm`;
    }

    // Primary variant - use CTA config variant
    if (ctaConfig.disabled) {
      return `${baseStyles} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }

    if (
      ctaConfig.state === "continue" ||
      ctaConfig.state === "view-certificate"
    ) {
      return `${baseStyles} bg-green-600 text-white hover:bg-green-700 shadow-md`;
    }

    if (ctaConfig.state === "re-enroll") {
      return `${baseStyles} bg-orange-600 text-white hover:bg-orange-700 shadow-md`;
    }

    // Default - enroll state
    return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md`;
  };

  return (
    <>
      <button
        onClick={handleEnrollClick}
        disabled={!ctaConfig || ctaConfig.disabled || isEnrolling}
        className={`${getButtonStyles()} ${className}`}
      >
        {getButtonContent()}
      </button>

      <EnrollmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleEnrollmentConfirm}
        course={course}
        isLoading={isEnrolling}
      />

      {databaseUser && (
        <PlanSelectionModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          course={course}
          userId={databaseUser.id}
          onPaymentInitiated={() => {
            setShowPlanModal(false);
            showToast("Redirecting to payment...", "info");
          }}
        />
      )}

      {/* Toast Notifications */}
      {ToastComponent}
    </>
  );
};
