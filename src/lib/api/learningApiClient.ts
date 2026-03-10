import { msalInstance } from "../auth/msal";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: string;
}

class LearningApiClient {
  private async parseResponseBody(response: Response): Promise<any> {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return text ? { error: text.slice(0, 250) } : null;
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const activeAccount = msalInstance.getActiveAccount();
      if (!activeAccount) {
        return null;
      }

      const tokenRequest = {
        scopes: ["openid", "profile", "email"],
        account: activeAccount,
      };

      const response = await msalInstance.acquireTokenSilent(tokenRequest);
      return response.idToken || response.accessToken;
    } catch (error) {
      console.error("Failed to acquire access token for learning API:", error);
      return null;
    }
  }

  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAccessToken();

      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please sign in and try again.",
        };
      }

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await this.parseResponseBody(response);

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `API request failed with status ${response.status}`,
          details: data?.details,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Learning API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async getSnapshot(courseSlug: string) {
    const result = await this.makeRequest("GET", `/learning/snapshot/${courseSlug}`);
    return result.success ? result.data?.snapshot ?? null : null;
  }

  async recordQuizAttempt(courseSlug: string, scorePct: number, passed: boolean) {
    const result = await this.makeRequest("POST", `/learning/quiz-attempt/${courseSlug}`, {
      scorePct,
      passed,
    });

    return {
      success: result.success || false,
      badge: result.data?.badge ?? null,
      xp: result.data?.xp ?? null,
      error: result.error,
      message: result.data?.message,
    };
  }

  async recordCourseCompletion(courseSlug: string) {
    const result = await this.makeRequest(
      "POST",
      `/learning/course-completion/${courseSlug}`
    );

    return {
      success: result.success || false,
      badge: result.data?.badge ?? null,
      xp: result.data?.xp ?? null,
      error: result.error,
      message: result.data?.message,
    };
  }
}

export const learningApiClient = new LearningApiClient();
export default learningApiClient;
