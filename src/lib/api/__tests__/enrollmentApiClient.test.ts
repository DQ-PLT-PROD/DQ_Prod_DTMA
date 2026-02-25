import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../auth/msal", () => ({
  msalInstance: {
    getActiveAccount: vi.fn(),
    acquireTokenSilent: vi.fn(),
  },
}));

import { msalInstance } from "../../auth/msal";
import { enrollmentApiClient } from "../enrollmentApiClient";

const mockJsonResponse = (data: any, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => data,
  } as Response);

describe("enrollmentApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(msalInstance.getActiveAccount).mockReturnValue({} as any);
    vi.mocked(msalInstance.acquireTokenSilent).mockResolvedValue({
      idToken: "test-id-token",
      accessToken: "test-access-token",
    } as any);
  });

  it("does not append userId query on enrollment status requests", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ isEnrolled: true }, 200)
    );

    await enrollmentApiClient.isUserEnrolled(
      "perfecting-life-transactions",
      "db-uuid-value"
    );

    const requestUrl = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(requestUrl).toContain("/enrollment/status/perfecting-life-transactions");
    expect(requestUrl).not.toContain("userId=");
  });

  it("does not append userId query on access contract requests", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(
        { isEnrolled: true, enrollmentStatus: "active", subscriptionStatus: null },
        200
      )
    );

    await enrollmentApiClient.getAccessContract(
      "perfecting-life-transactions",
      "db-uuid-value"
    );

    const requestUrl = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(requestUrl).toContain("/enrollment/access/perfecting-life-transactions");
    expect(requestUrl).not.toContain("userId=");
  });

  it("posts enrollment payload without explicit userId", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(
        {
          success: true,
          enrollment: { id: "enroll-1", courseSlug: "perfecting-life-transactions" },
        },
        201
      )
    );

    await enrollmentApiClient.enrollInCourse(
      "perfecting-life-transactions",
      "explicit"
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.method).toBe("POST");
    expect(String(options?.body)).toContain('"courseSlug":"perfecting-life-transactions"');
    expect(String(options?.body)).toContain('"method":"explicit"');
    expect(String(options?.body)).not.toContain("userId");
  });
});
