/**
 * API client utilities for WordPress REST API
 */

function getAdminData() {
  return (window as any).ucpHubAdmin;
}

export const api = {
  /**
   * Get WordPress REST API base URL
   */
  getRestUrl: () => {
    const adminData = getAdminData();
    return adminData?.restUrl || "/wp-json/ucp/v1/";
  },

  /**
   * Get WordPress REST API nonce
   */
  getNonce: () => {
    const adminData = getAdminData();
    return adminData?.restNonce || "";
  },

  /**
   * Get backend URL
   */
  getBackendUrl: () => {
    const adminData = getAdminData();
    return adminData?.backendUrl || "http://localhost:3000";
  },

  /**
   * Make authenticated request to WordPress REST API
   */
  request: async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const restUrl = api.getRestUrl();
    const nonce = api.getNonce();

    const response = await fetch(`${restUrl}${endpoint}`, {
      ...options,
      headers: {
        "X-WP-Nonce": nonce,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      // Handle WordPress REST API error format
      const errorMessage
        = error.message || error.data?.message || "Request failed";
      const errorStatus = error.code || response.status;

      // Create error object with status for better handling
      const apiError: any = new Error(errorMessage);
      apiError.status = errorStatus;
      apiError.code = error.code;
      apiError.data = error.data;

      throw apiError;
    }

    return response.json();
  },
};
