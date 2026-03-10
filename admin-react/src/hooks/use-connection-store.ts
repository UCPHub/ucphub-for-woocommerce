import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

interface CompleteSetupParams {
  ucp_capabilities?: string[];
  ucp_payment_handlers?: string[];
  ucp_links?: { type: string; url: string }[];
}

interface CompleteSetupResponse {
  success?: boolean;
  api_key: string;
  store_id: string;
  store_reused?: boolean;
  needs_authorization?: boolean;
  auth_url?: string;
  integration_id?: string;
}

interface FinalizeConnectionResponse {
  success: boolean;
  api_key: string;
  store_id: string;
}

export function useCompleteSetup() {
  return useMutation<CompleteSetupResponse, Error, CompleteSetupParams>({
    mutationFn: async ({ ucp_capabilities, ucp_payment_handlers, ucp_links }) => {
      const payload = {
        ucp_capabilities,
        ucp_payment_handlers,
        ucp_links,
      };
      return api.request<CompleteSetupResponse>("complete-setup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useFinalizeConnection() {
  return useMutation<FinalizeConnectionResponse, Error>({
    mutationFn: async () => {
      return api.request<FinalizeConnectionResponse>("finalize-connection", {
        method: "POST",
      });
    },
  });
}
