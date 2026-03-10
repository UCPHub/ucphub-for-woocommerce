import type { OrganizationResponseDto } from "@repo/ucp-client";

import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import { useSettings } from "./use-settings";

export type Organization = OrganizationResponseDto;

export function useOrganization() {
  const { data: settings } = useSettings();
  const isConnected = settings?.connection_status === "connected";

  return useQuery<Organization>({
    queryKey: ["organization"],
    queryFn: () => api.request<Organization>("organization"),
    enabled: isConnected,
  });
}
