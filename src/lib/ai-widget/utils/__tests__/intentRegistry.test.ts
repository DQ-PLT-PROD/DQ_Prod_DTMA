/**
 * Intent Registry Tests (Dev D - Feature D3)
 *
 * Tests for rule-based intent matching system
 */

import { describe, it, expect } from "vitest";
import {
  matchIntent,
  getFallbackResponse,
  getIntentById,
  getIntentsByCategory,
  intentRegistry,
  quickActions,
} from "../intentRegistry";

describe("intentRegistry", () => {
  describe("matchIntent", () => {
    it("should match exact patterns", () => {
      const result = matchIntent("what is dtma");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("what-is-dtma");
    });

    it("should match partial patterns", () => {
      const result = matchIntent("tell me about dtma platform");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("what-is-dtma");
    });

    it("should be case insensitive", () => {
      const result = matchIntent("WHAT IS DTMA");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("what-is-dtma");
    });

    it("should match leadership courses intent", () => {
      const result = matchIntent("show me leadership courses");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("leadership-courses");
      expect(result?.action?.target).toBe("/courses?category=leadership");
    });

    it("should match technology courses intent", () => {
      const result = matchIntent("tech courses");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("technology-courses");
      expect(result?.action?.target).toBe("/courses?category=technology");
    });

    it("should match save course intent", () => {
      const result = matchIntent("how do i save a course");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("save-course");
    });

    it("should match progress intent", () => {
      const result = matchIntent("my progress");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("my-progress");
      expect(result?.action?.target).toBe("/portal/my-courses/in-progress");
    });

    it("should match enrollment intent", () => {
      const result = matchIntent("how do i enroll");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("how-to-enroll");
    });

    it("should match browse courses intent", () => {
      const result = matchIntent("browse courses");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("browse-courses");
      expect(result?.action?.target).toBe("/courses");
    });

    it("should match help intent", () => {
      const result = matchIntent("i need help");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("need-help");
    });

    it("should match sign in intent", () => {
      const result = matchIntent("how to sign in");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("sign-in");
    });

    it("should match keyword combinations", () => {
      const result = matchIntent("leadership management courses");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("leadership-courses");
    });

    it("should return null for unmatched input", () => {
      const result = matchIntent("random gibberish xyz123");
      expect(result).toBeNull();
    });

    it("should return null for empty input", () => {
      const result = matchIntent("");
      expect(result).toBeNull();
    });

    it("should handle whitespace-only input", () => {
      const result = matchIntent("   ");
      expect(result).toBeNull();
    });
  });

  describe("getIntentById", () => {
    it("should return intent by ID", () => {
      const result = getIntentById("what-is-dtma");
      expect(result).toBeTruthy();
      expect(result?.id).toBe("what-is-dtma");
    });

    it("should return null for non-existent ID", () => {
      const result = getIntentById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getIntentsByCategory", () => {
    it("should return intents by category", () => {
      const generalIntents = getIntentsByCategory("general");
      expect(generalIntents.length).toBeGreaterThan(0);
      expect(
        generalIntents.every((intent) => intent.category === "general")
      ).toBe(true);
    });

    it("should return course intents", () => {
      const courseIntents = getIntentsByCategory("courses");
      expect(courseIntents.length).toBeGreaterThan(0);
      expect(
        courseIntents.every((intent) => intent.category === "courses")
      ).toBe(true);
    });

    it("should return empty array for non-existent category", () => {
      const result = getIntentsByCategory("non-existent");
      expect(result).toEqual([]);
    });
  });

  describe("getFallbackResponse", () => {
    it("should return a fallback response", () => {
      const response = getFallbackResponse();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe("intentRegistry structure", () => {
    it("should have at least 10 intents as per spec", () => {
      expect(intentRegistry.length).toBeGreaterThanOrEqual(10);
    });

    it("should have all required intent properties", () => {
      intentRegistry.forEach((intent) => {
        expect(intent).toHaveProperty("id");
        expect(intent).toHaveProperty("patterns");
        expect(intent).toHaveProperty("response");
        expect(intent).toHaveProperty("category");
        expect(intent).toHaveProperty("keywords");

        expect(typeof intent.id).toBe("string");
        expect(Array.isArray(intent.patterns)).toBe(true);
        expect(typeof intent.response).toBe("string");
        expect(typeof intent.category).toBe("string");
        expect(Array.isArray(intent.keywords)).toBe(true);
      });
    });

    it("should have unique intent IDs", () => {
      const ids = intentRegistry.map((intent) => intent.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have navigation actions for deep-linking intents", () => {
      const navigationIntents = intentRegistry.filter(
        (intent) => intent.action?.type === "navigate"
      );

      expect(navigationIntents.length).toBeGreaterThan(0);

      navigationIntents.forEach((intent) => {
        expect(intent.action?.target).toBeTruthy();
        expect(typeof intent.action?.target).toBe("string");
      });
    });
  });

  describe("quickActions", () => {
    it("should have quick actions defined", () => {
      expect(quickActions.length).toBeGreaterThan(0);
    });

    it("should have valid quick action structure", () => {
      quickActions.forEach((action) => {
        expect(action).toHaveProperty("id");
        expect(action).toHaveProperty("label");
        expect(action).toHaveProperty("intent");

        expect(typeof action.id).toBe("string");
        expect(typeof action.label).toBe("string");
        expect(typeof action.intent).toBe("string");
      });
    });

    it("should reference valid intent IDs", () => {
      const intentIds = intentRegistry.map((intent) => intent.id);

      quickActions.forEach((action) => {
        expect(intentIds).toContain(action.intent);
      });
    });
  });

  describe("performance requirements", () => {
    it("should match intents quickly (< 300ms as per spec)", () => {
      const start = performance.now();

      // Test multiple matches to simulate real usage
      const testInputs = [
        "what is dtma",
        "leadership courses",
        "how do i enroll",
        "my progress",
        "save course",
        "random unmatched input",
      ];

      testInputs.forEach((input) => {
        matchIntent(input);
      });

      const end = performance.now();
      const duration = end - start;

      // Should be well under 300ms for multiple matches
      expect(duration).toBeLessThan(50); // Very generous threshold
    });
  });
});
