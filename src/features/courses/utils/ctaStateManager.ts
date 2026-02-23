/**
 * CTA State Manager (Dev D - Feature D2)
 *
 * Centralized logic for determining course CTA states based on:
 * - Coming Soon flag
 * - Enrollment status
 * - Progress percentage
 *
 * @see docs/DTMA_DevD_Technical_Audit.md
 */

import { AccessContract } from "../services/enrollmentService";

export type CtaState =
  | "coming-soon"
  | "enroll"
  | "continue"
  | "view-certificate"
  | "re-enroll";

export interface CtaConfig {
  state: CtaState;
  label: string;
  disabled: boolean;
  variant: "primary" | "secondary" | "disabled";
  action:
    | "navigate-to-player"
    | "navigate-to-enroll"
    | "show-certificate"
    | "none";
}

/**
 * Determines the CTA state for a course based on its properties and user enrollment
 *
 * State Machine:
 * 1. If isComingSoon → "Coming Soon" (disabled)
 * 2. If enrolled && progress === 100 → "View Certificate"
 * 3. If enrolled → "Continue Learning"
 * 4. If cancelled/expired → "Re-enroll"
 * 5. Otherwise → "Enroll Now"
 */
export function getCtaState(
  isComingSoon: boolean,
  accessContract: AccessContract | null,
  progressPct?: number
): CtaConfig {
  // Priority 1: Coming Soon courses (always disabled)
  if (isComingSoon) {
    return {
      state: "coming-soon",
      label: "Coming Soon",
      disabled: true,
      variant: "disabled",
      action: "none",
    };
  }

  // Priority 2: Check enrollment status
  if (accessContract?.isEnrolled) {
    // Check if course is completed (workaround for missing isCompleted flag)
    if (progressPct !== undefined && progressPct >= 100) {
      return {
        state: "view-certificate",
        label: "View Certificate",
        disabled: false,
        variant: "secondary",
        action: "show-certificate",
      };
    }

    // User is enrolled but not completed
    return {
      state: "continue",
      label: "Continue Learning",
      disabled: false,
      variant: "primary",
      action: "navigate-to-player",
    };
  }

  // Priority 3: Check for cancelled/expired enrollment
  if (
    accessContract?.enrollmentStatus === "cancelled" ||
    accessContract?.enrollmentStatus === "expired"
  ) {
    return {
      state: "re-enroll",
      label: "Re-enroll",
      disabled: false,
      variant: "primary",
      action: "navigate-to-enroll",
    };
  }

  // Priority 4: Default - not enrolled
  return {
    state: "enroll",
    label: "Enroll Now",
    disabled: false,
    variant: "primary",
    action: "navigate-to-enroll",
  };
}

/**
 * Helper to get a simple CTA label for display
 */
export function getCtaLabel(
  isComingSoon: boolean,
  isEnrolled: boolean,
  progressPct?: number
): string {
  if (isComingSoon) return "Coming Soon";
  if (isEnrolled) {
    if (progressPct !== undefined && progressPct >= 100) {
      return "View Certificate";
    }
    return "Continue Learning";
  }
  return "Enroll Now";
}

/**
 * Helper to check if a CTA should be disabled
 */
export function isCtaDisabled(isComingSoon: boolean): boolean {
  return isComingSoon;
}

/**
 * Helper to get CTA action handler
 */
export function getCtaAction(
  ctaState: CtaState,
  courseSlug: string,
  onEnroll?: () => void,
  onContinue?: () => void,
  onViewCertificate?: () => void
): () => void {
  switch (ctaState) {
    case "enroll":
    case "re-enroll":
      return () => onEnroll?.();

    case "continue":
      return () => onContinue?.();

    case "view-certificate":
      return () => onViewCertificate?.();

    case "coming-soon":
    default:
      return () => {}; // No action
  }
}
