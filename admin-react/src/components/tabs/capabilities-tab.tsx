import { Card, CardContent } from "@repo/react-ui/components/ui/card";
import { SaveButton } from "@repo/react-ui/components/ui/save-button";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { useEffect, useMemo, useState } from "react";

import { toastMessage } from "../../hooks/toast-message";
import { useSettings } from "../../hooks/use-settings";
import { useStoreCapabilities } from "../../hooks/use-store";
import { useUpdateCapabilities } from "../../hooks/use-store-config";
import CapabilitiesForm from "../forms/capabilities-form";

export default function CapabilitiesTab() {
  const { data: settings } = useSettings();
  const { data: capabilitiesData, isLoading, refetch } = useStoreCapabilities();
  const updateCapabilities = useUpdateCapabilities();
  const toast = toastMessage();

  const serverCapabilities = useMemo(
    () => capabilitiesData?.enabled ?? [],
    [capabilitiesData?.enabled],
  );
  const [localCapabilities, setLocalCapabilities] = useState<string[] | null>(null);
  const selectedCapabilities = localCapabilities ?? serverCapabilities;

  useEffect(() => {
    if (settings?.api_key && settings?.store_id && !capabilitiesData) {
      refetch();
    }
  }, [settings?.api_key, settings?.store_id, capabilitiesData, refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCapabilities.length === 0) {
      toast.error("Please select at least one capability!");
      return;
    }

    try {
      await updateCapabilities.mutateAsync(selectedCapabilities);
      toast.success("Capabilities updated successfully!");
      setLocalCapabilities(null);
      refetch();
    }
    catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update capabilities",
      );
    }
  };

  const handleToggleCapability = (capabilityName: string, checked: boolean) => {
    const current = localCapabilities ?? serverCapabilities;
    setLocalCapabilities(
      checked
        ? [...current, capabilityName]
        : current.filter(c => c !== capabilityName),
    );
  };

  if (!settings?.api_key || !settings?.store_id) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">
            Please connect your store to manage capabilities.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner className="size-8" />
        </CardContent>
      </Card>
    );
  }

  if (!capabilitiesData) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">Capabilities information not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">UCP Capabilities</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Select the UCP capabilities you want to enable for your store. These
            capabilities define what features are available to AI agents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CapabilitiesForm
            available={capabilitiesData.available}
            selected={selectedCapabilities}
            onToggle={handleToggleCapability}
          />

          <SaveButton
            type="submit"
            isPending={updateCapabilities.isPending}
            isDirty={localCapabilities !== null}
            label="Save Capabilities"
          />
        </form>
      </CardContent>
    </Card>
  );
}
