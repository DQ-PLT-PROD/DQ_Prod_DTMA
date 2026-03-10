import { msalInstance } from "../auth/msal";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: string;
}

class LearnerProfileApiClient {
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
      console.error("Failed to acquire access token for learner profile API:", error);
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
      console.error("Learner profile API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async getProfile() {
    const result = await this.makeRequest("GET", "/learner/profile");
    return {
      success: result.success || false,
      profile: result.data?.profile ?? null,
      error: result.error,
    };
  }

  async updateProfile(input: Record<string, any>) {
    const result = await this.makeRequest("PUT", "/learner/profile", input);
    return {
      success: result.success || false,
      profile: result.data?.profile ?? null,
      error: result.error,
    };
  }
}

export const learnerProfileApiClient = new LearnerProfileApiClient();
export default learnerProfileApiClient;
