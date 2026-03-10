import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Store } from "./use-store";

import { api } from "../lib/api";

export function useUpdateCapabilities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capabilities: string[]) => {
      return api.request<Store>("store-integration", {
        method: "PATCH",
        body: JSON.stringify({
          capabilities,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["store", "capabilities"] });
      queryClient.invalidateQueries({ queryKey: ["store", "profile"] });
    },
  });
}

export function useUpdatePaymentHandlers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentHandlerIds: string[]) => {
      return api.request<Store>("store-integration", {
        method: "PATCH",
        body: JSON.stringify({
          payment_handlers: paymentHandlerIds,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["store", "profile"] });
    },
  });
}
