import type { OrganizationResponseDto, StoreResponseDto, UpdateStoreDto } from "@repo/ucp-client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import { useSettings } from "./use-settings";

export interface Store extends Omit<StoreResponseDto, "name"> {
  name: string | null;
  ucpCapabilities?: string[];
  ucpPaymentHandlers?: unknown[];
  organization?: OrganizationResponseDto;
  integrationStatus?: string;
}

export type UpdateStoreData = UpdateStoreDto;

export function useStore() {
  const { data: settings } = useSettings();

  return useQuery<Store>({
    queryKey: ["store"],
    queryFn: () => api.request<Store>("store"),
    enabled: Boolean(settings?.api_key && settings?.store_id),
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStoreData) => {
      return api.request<Store>("store", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export interface StoreCapabilities {
  available: Array<{
    name: string;
    label: string;
    description: string;
  }>;
  enabled: string[];
}

export function useStoreCapabilities() {
  const { data: settings } = useSettings();

  return useQuery<StoreCapabilities>({
    queryKey: ["store", "capabilities"],
    queryFn: () => api.request<StoreCapabilities>("store/capabilities"),
    enabled: Boolean(settings?.api_key && settings?.store_id),
  });
}

export function useStoreProfile() {
  const { data: settings } = useSettings();

  return useQuery({
    queryKey: ["store", "profile"],
    queryFn: () => api.request("store/profile"),
    enabled: Boolean(settings?.api_key && settings?.store_id),
  });
}
