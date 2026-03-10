import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";

export function usePolicyPages() {
  return useQuery<Record<string, string>>({
    queryKey: ["policy-pages"],
    queryFn: () => api.request<Record<string, string>>("policy-pages"),
  });
}
