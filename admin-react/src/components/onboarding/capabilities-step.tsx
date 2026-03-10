import { Button } from "@repo/react-ui/components/ui/button";
import { UCP_CAPABILITY_NAME } from "@repo/ucp-capabilities";

import CapabilitiesForm from "../forms/capabilities-form";

const AVAILABLE_CAPABILITIES = [
  {
    name: UCP_CAPABILITY_NAME.checkout,
    label: "Checkout",
    description: "Enable checkout capabilities",
  },
  {
    name: UCP_CAPABILITY_NAME.order,
    label: "Order Management",
    description: "Enable order management capabilities",
  },
  {
    name: UCP_CAPABILITY_NAME.fulfillment,
    label: "Fulfillment",
    description: "Enable fulfillment capabilities",
  },
  {
    name: UCP_CAPABILITY_NAME.discount,
    label: "Discount",
    description: "Enable discount capabilities",
  },
];

export interface CapabilitiesStepProps {
  selectedCapabilities: string[];
  onToggle: (value: string, checked: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CapabilitiesStep({
  selectedCapabilities,
  onToggle,
  onNext,
  onBack,
}: CapabilitiesStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Select the UCP capabilities you want to enable for your store.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <CapabilitiesForm
          available={AVAILABLE_CAPABILITIES}
          selected={selectedCapabilities}
          onToggle={onToggle}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  );
}
