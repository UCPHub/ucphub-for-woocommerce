import { ActionButton } from "@repo/react-ui/components/ui/action-button";
import { Badge } from "@repo/react-ui/components/ui/badge";
import { Card, CardContent } from "@repo/react-ui/components/ui/card";
import { Descriptions, DescriptionsItem } from "@repo/react-ui/components/ui/descriptions";
import { Separator } from "@repo/react-ui/components/ui/separator";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, RefreshCw, Unplug } from "lucide-react";
import { useEffect } from "react";

import { toastMessage } from "../../hooks/toast-message";
import { useCompleteSetup } from "../../hooks/use-connection-store";
import { useOrganization } from "../../hooks/use-organization";
import { useConnectStore, useSettings } from "../../hooks/use-settings";
import { useStore } from "../../hooks/use-store";
import { api } from "../../lib/api";
import OnboardingFlow from "../onboarding/onboarding-flow";

export default function GeneralTab() {
  const { data: settings, isLoading } = useSettings();
  const { data: store, isLoading: storeLoading, isError: storeError, refetch: refetchStore } = useStore();
  const { data: organization, isLoading: orgLoading, refetch: refetchOrg } = useOrganization();
  const connectStore = useConnectStore();
  const completeSetup = useCompleteSetup();
  const queryClient = useQueryClient();
  const toast = toastMessage();

  const hasCredentials = Boolean(settings?.api_key && settings?.store_id);
  const isIntegrationDisconnected = hasCredentials && !storeLoading && !storeError && store?.integrationStatus === "disconnected";
  const isDisconnected = hasCredentials && !storeLoading && (storeError || store?.integrationStatus !== "connected");

  useEffect(() => {
    if (hasCredentials) {
      if (!store)
        refetchStore();
      if (!organization)
        refetchOrg();
    }
  }, [hasCredentials, store, organization, refetchStore, refetchOrg]);

  const handleOnboardingComplete = async (apiKey: string, storeId: string) => {
    try {
      await connectStore.mutateAsync({
        action: "connect",
        api_key: apiKey,
        store_id: storeId,
      });
      toast.success("Store connected successfully!");
    }
    catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect store",
      );
    }
  };

  async function disconnectStore() {
    try {
      await api.request("connect", {
        method: "POST",
        body: JSON.stringify({ action: "disconnect" }),
      });
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      return { error: false };
    }
    catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "Failed to disconnect",
      };
    }
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

  const onboardingComplete = hasCredentials && settings?.connection_status === "connected";

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const dataLoading = storeLoading || orgLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6">
          <h3 className="text-xl font-semibold">General</h3>
          {dataLoading
            ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-8" />
                </div>
              )
            : (
                <Descriptions bordered>
                  <DescriptionsItem label="Status">
                    {isDisconnected
                      ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="capitalize">
                              <AlertTriangle className="size-3 mr-1" />
                              disconnected
                            </Badge>
                            {isIntegrationDisconnected && (
                              <ActionButton
                                variant="outline"
                                size="sm"
                                successMessage="Store reconnected successfully"
                                action={async () => {
                                  try {
                                    await completeSetup.mutateAsync({});
                                    await queryClient.invalidateQueries({ queryKey: ["store"] });
                                    return { error: false };
                                  }
                                  catch (err) {
                                    return {
                                      error: true,
                                      message: err instanceof Error ? err.message : "Failed to reconnect",
                                    };
                                  }
                                }}
                              >
                                <RefreshCw className="size-3" />
                                Reconnect
                              </ActionButton>
                            )}
                          </div>
                        )
                      : (
                          <Badge className="bg-green-600 text-white capitalize">
                            <CheckCircle className="size-3 mr-1" />
                            connected
                          </Badge>
                        )}
                  </DescriptionsItem>
                  <DescriptionsItem label="UCPhub Dashboard">
                    <a
                      href="https://app.ucphub.ai/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      app.ucphub.ai/login
                    </a>
                  </DescriptionsItem>
                  {organization && (
                    <>
                      <DescriptionsItem label="Organization">
                        {organization.name || <span className="text-muted-foreground">Not set</span>}
                      </DescriptionsItem>
                      <DescriptionsItem label="Plan">
                        <Badge variant="secondary">{organization.planId || "free"}</Badge>
                      </DescriptionsItem>
                    </>
                  )}
                  {store && (
                    <DescriptionsItem label="Store">
                      {store.name || <span className="text-muted-foreground">Not set</span>}
                    </DescriptionsItem>
                  )}
                </Descriptions>
              )}
        </CardContent>
      </Card>

      {!isDisconnected && (
        <>
          <Separator />

          <Card className="border-destructive/50">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Disconnecting your store will prevent AI agents from interacting with it. You can reconnect at any time.
              </p>
              <ActionButton
                variant="outline"
                className="text-destructive border-destructive hover:text-destructive hover:bg-destructive/10"
                requireAreYouSure
                areYouSureDescription="This will disconnect your store from the UCP backend. AI agents will no longer be able to interact with your store. You can reconnect at any time."
                areYouSureConfirmVariant="outline"
                areYouSureConfirmClassName="text-destructive border-destructive hover:text-destructive hover:bg-destructive/10"
                successMessage="Store disconnected successfully"
                action={disconnectStore}
              >
                <Unplug className="size-4" />
                Disconnect
              </ActionButton>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
