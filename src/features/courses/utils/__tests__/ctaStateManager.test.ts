/**
 * Tests for CTA State Manager (Dev D - Feature D2)
 */

import { describe, it, expect } from "vitest";
import { getCtaState, getCtaLabel, isCtaDisabled } from "../ctaStateManager";
import { AccessContract } from "../../services/enrollmentService";

describe("ctaStateManager", () => {
  describe("getCtaState", () => {
    it("should return coming-soon state for coming soon courses", () => {
      const result = getCtaState(true, null);

      expect(result.state).toBe("coming-soon");
      expect(result.label).toBe("Coming Soon");
      expect(result.disabled).toBe(true);
      expect(result.action).toBe("none");
    });

    it("should return coming-soon even if user is enrolled", () => {
      const accessContract: AccessContract = {
        isEnrolled: true,
        enrollmentStatus: "active",
        subscriptionStatus: null,
      };

      const result = getCtaState(true, accessContract);

      expect(result.state).toBe("coming-soon");
      expect(result.disabled).toBe(true);
    });

    it("should return view-certificate for completed courses", () => {
      const accessContract: AccessContract = {
        isEnrolled: true,
        enrollmentStatus: "active",
        subscriptionStatus: null,
      };

      const result = getCtaState(false, accessContract, 100);

      expect(result.state).toBe("view-certificate");
      expect(result.label).toBe("View Certificate");
      expect(result.disabled).toBe(false);
      expect(result.action).toBe("show-certificate");
    });

    it("should return continue for enrolled but incomplete courses", () => {
      const accessContract: AccessContract = {
        isEnrolled: true,
        enrollmentStatus: "active",
        subscriptionStatus: null,
      };

      const result = getCtaState(false, accessContract, 50);

      expect(result.state).toBe("continue");
      expect(result.label).toBe("Continue Learning");
      expect(result.disabled).toBe(false);
      expect(result.action).toBe("navigate-to-player");
    });

    it("should return re-enroll for cancelled enrollment", () => {
      const accessContract: AccessContract = {
        isEnrolled: false,
        enrollmentStatus: "cancelled",
        subscriptionStatus: null,
      };

      const result = getCtaState(false, accessContract);

      expect(result.state).toBe("re-enroll");
      expect(result.label).toBe("Re-enroll");
      expect(result.disabled).toBe(false);
      expect(result.action).toBe("navigate-to-enroll");
    });

    it("should return re-enroll for expired enrollment", () => {
      const accessContract: AccessContract = {
        isEnrolled: false,
        enrollmentStatus: "expired",
        subscriptionStatus: null,
      };

      const result = getCtaState(false, accessContract);

      expect(result.state).toBe("re-enroll");
    });

    it("should return enroll for not enrolled users", () => {
      const accessContract: AccessContract = {
        isEnrolled: false,
        enrollmentStatus: null,
        subscriptionStatus: null,
      };

      const result = getCtaState(false, accessContract);

      expect(result.state).toBe("enroll");
      expect(result.label).toBe("Enroll Now");
      expect(result.disabled).toBe(false);
      expect(result.action).toBe("navigate-to-enroll");
    });

    it("should return enroll for null access contract", () => {
      const result = getCtaState(false, null);

      expect(result.state).toBe("enroll");
      expect(result.label).toBe("Enroll Now");
    });
  });

  describe("getCtaLabel", () => {
    it("should return correct labels for different states", () => {
      expect(getCtaLabel(true, false)).toBe("Coming Soon");
      expect(getCtaLabel(false, true, 100)).toBe("View Certificate");
      expect(getCtaLabel(false, true, 50)).toBe("Continue Learning");
      expect(getCtaLabel(false, false)).toBe("Enroll Now");
    });
  });

  describe("isCtaDisabled", () => {
    it("should return true only for coming soon courses", () => {
      expect(isCtaDisabled(true)).toBe(true);
      expect(isCtaDisabled(false)).toBe(false);
    });
  });
});
