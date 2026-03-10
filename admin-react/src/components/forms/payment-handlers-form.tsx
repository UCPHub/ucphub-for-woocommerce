import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { Switch } from "@repo/react-ui/components/ui/switch";

import type { PaymentGateway } from "../../hooks/use-payment-gateways";

interface PaymentHandlersFormProps {
  gateways: PaymentGateway[];
  selected: string[];
  onToggle: (id: string, checked: boolean) => void;
  isLoading?: boolean;
}

export default function PaymentHandlersForm({
  gateways,
  selected,
  onToggle,
  isLoading,
}: PaymentHandlersFormProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <p className="text-muted-foreground">
        No payment gateways available. Please configure payment gateways in
        WooCommerce settings.
      </p>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {gateways.map(gateway => (
        <div
          key={gateway.id}
          className="flex items-start gap-4 p-4"
        >
          <Switch
            className="mt-0.5"
            checked={selected.includes(gateway.id)}
            onCheckedChange={checked =>
              onToggle(gateway.id, checked)}
            disabled={!gateway.enabled}
          />
          <div className="space-y-1">
            <div className="font-medium">{gateway.title}</div>
            {gateway.description && (
              <p className="text-muted-foreground text-sm">
                {gateway.description}
              </p>
            )}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {gateway.id}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
}
