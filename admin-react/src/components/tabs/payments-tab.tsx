import { Card, CardContent } from "@repo/react-ui/components/ui/card";
import { SaveButton } from "@repo/react-ui/components/ui/save-button";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { useEffect, useMemo, useState } from "react";

import { toastMessage } from "../../hooks/toast-message";
import { usePaymentGateways } from "../../hooks/use-payment-gateways";
import { useSettings } from "../../hooks/use-settings";
import { useStore } from "../../hooks/use-store";
import { useUpdatePaymentHandlers } from "../../hooks/use-store-config";
import PaymentHandlersForm from "../forms/payment-handlers-form";

export default function PaymentsTab() {
  const { data: settings } = useSettings();
  const { data: store, refetch: refetchStore } = useStore();
  const { data: paymentGatewaysData, isLoading: loadingGateways }
    = usePaymentGateways();
  const updatePaymentHandlers = useUpdatePaymentHandlers();
  const toast = toastMessage();

  const serverEnabledGateways = useMemo(() => {
    const handlers = store?.ucpPaymentHandlers;
    if (handlers && Array.isArray(handlers)) {
      return handlers.map((handler: any) => handler.id).filter(Boolean) as string[];
    }
    return [];
  }, [store]);

  const [localEdits, setLocalEdits] = useState<string[] | null>(null);
  const enabledGateways = localEdits ?? serverEnabledGateways;

  useEffect(() => {
    if (settings?.api_key && settings?.store_id && !store) {
      refetchStore();
    }
  }, [settings?.api_key, settings?.store_id, store, refetchStore]);

  const handleToggleGateway = (gatewayId: string, enabled: boolean) => {
    const current = enabledGateways;
    if (enabled) {
      setLocalEdits([...current, gatewayId]);
    }
    else {
      setLocalEdits(current.filter(id => id !== gatewayId));
    }
  };

  const handleSave = async () => {
    try {
      if (!paymentGatewaysData?.gateways) {
        toast.error("Payment gateways data not available");
        return;
      }

      await updatePaymentHandlers.mutateAsync(enabledGateways);
      toast.success("Payment handlers updated successfully!");
      setLocalEdits(null);
      refetchStore();
    }
    catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payment handlers",
      );
    }
  };

  if (!settings?.api_key || !settings?.store_id) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">
            Please connect your store to manage payment handlers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingGateways) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner className="size-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">Payment Handlers</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Enable payment handlers that AI agents can use to process payments
            for orders. Only enabled WooCommerce payment gateways are available.
          </p>
        </div>

        <PaymentHandlersForm
          gateways={paymentGatewaysData?.gateways ?? []}
          selected={enabledGateways}
          onToggle={handleToggleGateway}
        />

        <SaveButton
          onSave={handleSave}
          isPending={updatePaymentHandlers.isPending}
          isDirty={localEdits !== null}
          label="Save Payment Handlers"
        />
      </CardContent>
    </Card>
  );
}
