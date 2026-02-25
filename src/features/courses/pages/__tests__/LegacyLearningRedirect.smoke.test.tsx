import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

vi.mock("../../../../App", () => ({
  App: () => <div>app</div>,
}));

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/instructor-portal", () => ({
  RoleSwitcherProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { LegacyLearningRedirect } from "../../../../AppRouter";

const CourseTarget = () => {
  const { courseId } = useParams();
  return <div>course:{courseId}</div>;
};

describe("LegacyLearningRedirect smoke", () => {
  it("redirects /learning?courseId=... to /portal/learning/:courseId", async () => {
    render(
      <MemoryRouter initialEntries={["/learning?courseId=perfecting-life-transactions"]}>
        <Routes>
          <Route path="/learning" element={<LegacyLearningRedirect />} />
          <Route path="/portal/learning/:courseId" element={<CourseTarget />} />
          <Route path="/portal" element={<div>portal-home</div>} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("course:perfecting-life-transactions")
    ).toBeInTheDocument();
  });

  it("redirects /learning without courseId to /portal", async () => {
    render(
      <MemoryRouter initialEntries={["/learning"]}>
        <Routes>
          <Route path="/learning" element={<LegacyLearningRedirect />} />
          <Route path="/portal" element={<div>portal-home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("portal-home")).toBeInTheDocument();
  });
});
