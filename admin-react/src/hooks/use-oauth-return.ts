import { useEffect, useRef } from "react";

import { toastMessage } from "./toast-message";
import { useFinalizeConnection } from "./use-connection-store";
import { useSettings } from "./use-settings";

/**
 * Handles OAuth return after WooCommerce authorization.
 * Detects wc_auth URL parameter and finalizes the connection.
 */
export function useOAuthReturn() {
  const { data: settings, refetch: refetchSettings } = useSettings();
  const finalizeConnection = useFinalizeConnection();
  const hasHandled = useRef(false);
  const toast = toastMessage();

  useEffect(() => {
    if (hasHandled.current)
      return;

    const params = new URLSearchParams(window.location.search);
    const wcAuth = params.get("wc_auth");

    if (!wcAuth)
      return;

    const cleanupUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("wc_auth");
      window.history.replaceState({}, "", url.toString());
    };

    if (wcAuth === "success" && settings?.connection_status === "pending_authorization") {
      hasHandled.current = true;

      finalizeConnection.mutateAsync()
        .then(() => {
          toast.success("WooCommerce access authorized successfully!");
          refetchSettings();
          cleanupUrl();
        })
        .catch(() => {
          toast.error("Failed to finalize connection");
          cleanupUrl();
        });
    }
    else if (wcAuth === "failed") {
      hasHandled.current = true;
      toast.error("WooCommerce authorization was denied or failed");
      cleanupUrl();
    }
  }, [settings?.connection_status, finalizeConnection, refetchSettings, toast]);
}
