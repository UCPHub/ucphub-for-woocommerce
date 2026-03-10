import type { LinkSettingsDto } from "@repo/ucp-client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import { useSettings } from "./use-settings";

export type StoreLink = LinkSettingsDto;

export const WELL_KNOWN_LINK_TYPES = [
  {
    type: "privacy_policy",
    label: "Privacy Policy",
    description: "Your store's privacy policy page",
  },
  {
    type: "terms_of_service",
    label: "Terms of Service",
    description: "Your store's terms and conditions",
  },
  {
    type: "refund_policy",
    label: "Refund Policy",
    description: "Your store's refund and return policy",
  },
  {
    type: "shipping_policy",
    label: "Shipping Policy",
    description: "Your store's shipping information",
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Frequently asked questions page",
  },
] as const;

interface StoreResponse {
  ucpLinks?: StoreLink[];
}

export function useStoreLinks() {
  const { data: settings } = useSettings();
  const isConnected = settings?.connection_status === "connected";

  return useQuery<StoreLink[]>({
    queryKey: ["store", "links"],
    queryFn: async () => {
      const store = await api.request<StoreResponse>("store");
      return store.ucpLinks ?? [];
    },
    enabled: isConnected,
  });
}

export function useUpdateLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (links: StoreLink[]) => {
      return api.request("store-integration", {
        method: "PATCH",
        body: JSON.stringify({ links }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["store", "links"] });
      queryClient.invalidateQueries({ queryKey: ["store", "profile"] });
    },
  });
}
