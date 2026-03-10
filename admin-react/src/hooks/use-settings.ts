import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

interface Settings {
  api_key: string;
  store_id: string;
  connection_status: string;
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => api.request<Settings>("settings"),
  });
}

export function useConnectStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      action: "connect" | "disconnect";
      api_key?: string;
      store_id?: string;
    }) => {
      return api.request("connect", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: async () => {
      return api.request<{ success: boolean; message: string }>(
        "test-connection",
        {
          method: "POST",
        },
      );
    },
  });
}
