import { Button } from "@repo/react-ui/components/ui/button";
import { useEffect, useRef } from "react";

import { usePaymentGateways } from "../../hooks/use-payment-gateways";
import PaymentHandlersForm from "../forms/payment-handlers-form";

export interface PaymentHandlersStepProps {
  selectedPaymentHandlers: string[];
  onToggle: (value: string, checked: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentHandlersStep({
  selectedPaymentHandlers,
  onToggle,
  onNext,
  onBack,
}: PaymentHandlersStepProps) {
  const { data: paymentGatewaysData, isLoading: loadingGateways } = usePaymentGateways();
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (paymentGatewaysData?.gateways && !hasAutoSelected.current && selectedPaymentHandlers.length === 0) {
      hasAutoSelected.current = true;
      for (const gateway of paymentGatewaysData.gateways) {
        onToggle(gateway.id, true);
      }
    }
  }, [paymentGatewaysData, selectedPaymentHandlers.length, onToggle]);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Select the payment methods you want to enable for UCP. You can
        skip this step if you don't want to configure payment handlers
        now.
      </p>

      <div className="space-y-4">
        <PaymentHandlersForm
          gateways={paymentGatewaysData?.gateways ?? []}
          selected={selectedPaymentHandlers}
          onToggle={onToggle}
          isLoading={loadingGateways}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
