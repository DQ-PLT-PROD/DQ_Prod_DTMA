import { describe, expect, it } from "vitest";
import { countCountableLessons, isCountableLessonType } from "../lessonCount";

describe("lessonCount utility", () => {
  it("counts standard and quiz lessons", () => {
    const total = countCountableLessons([
      { type: "standard" },
      { type: "quiz" },
      { type: "standard" },
    ]);

    expect(total).toBe(3);
  });

  it("excludes intro and outro lessons", () => {
    const total = countCountableLessons([
      { type: "intro" },
      { type: "standard" },
      { type: "outro" },
      { type: "quiz" },
    ]);

    expect(total).toBe(2);
  });

  it("treats type matching case-insensitively", () => {
    expect(isCountableLessonType("INTRO")).toBe(false);
    expect(isCountableLessonType("outRo")).toBe(false);
    expect(isCountableLessonType("standard")).toBe(true);
  });

  it("counts unknown or missing types as lessons", () => {
    const total = countCountableLessons([
      {},
      { type: null },
      { type: "bonus-wrapper" },
      { type: "welcome" },
    ]);

    expect(total).toBe(4);
  });

  it("returns zero for empty input", () => {
    expect(countCountableLessons(undefined)).toBe(0);
    expect(countCountableLessons(null)).toBe(0);
    expect(countCountableLessons([])).toBe(0);
  });
});
