import { Alert, AlertDescription, AlertTitle } from "@repo/react-ui/components/ui/alert";
import { Button } from "@repo/react-ui/components/ui/button";
import { Input } from "@repo/react-ui/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/react-ui/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import CapabilitiesTab from "./components/tabs/capabilities-tab";
import GeneralTab from "./components/tabs/general-tab";
import LinksTab from "./components/tabs/links-tab";
import PaymentsTab from "./components/tabs/payments-tab";
import ToolsTab from "./components/tabs/tools-tab";
import { useOAuthReturn } from "./hooks/use-oauth-return";
import { useConnectStore, useSettings } from "./hooks/use-settings";
import { useStore } from "./hooks/use-store";

function ReconnectAlert({ storeId }: { storeId: string }) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const connectStore = useConnectStore();

  async function handleUpdateKey() {
    if (!apiKey.trim())
      return;
    setError(null);
    try {
      await connectStore.mutateAsync({
        action: "connect",
        api_key: apiKey.trim(),
        store_id: storeId,
      });
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate API key");
    }
  }

  async function handleStartFresh() {
    await connectStore.mutateAsync({ action: "reset" });
  }

  return (
    <Alert className="mb-6 border-destructive bg-background text-foreground [&>svg]:text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>API Key Invalid</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>Your API key is no longer valid. Enter a new key from the UCPhub dashboard to reconnect.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            type="password"
            placeholder="Paste new API key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUpdateKey()}
            className="w-xl sm:max-w-lg bg-transparent"
          />
          <Button
            size="sm"
            className="w-full sm:w-auto sm:shrink-0"
            onClick={handleUpdateKey}
            disabled={connectStore.isPending || !apiKey.trim()}
          >
            {connectStore.isPending ? "Updating…" : "Update Key"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        <p className="text-sm text-muted-foreground">
          Or
          {" "}
          <button
            type="button"
            className="underline hover:cursor-pointer"
            onClick={handleStartFresh}
            disabled={connectStore.isPending}
          >
            start fresh
          </button>
          {" "}
          to re-onboard with a new store.
        </p>
      </AlertDescription>
    </Alert>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("general");
  const { data: settings } = useSettings();
  const { data: store, isLoading: storeLoading, isError: storeError } = useStore();

  useOAuthReturn();

  const hasCredentials = Boolean(settings?.api_key && settings?.store_id);
  const onboardingComplete = hasCredentials && settings?.connection_status === "connected";
  const isIntegrationDisconnected = onboardingComplete && !storeLoading && !storeError && store?.integrationStatus === "disconnected";
  const isKeyInvalid = onboardingComplete && !storeLoading && storeError;
  const isDisconnected = isKeyInvalid || isIntegrationDisconnected;
  const showTabs = onboardingComplete && !isDisconnected;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">WooCommerce UCPhub Settings</h1>

      {isKeyInvalid && settings?.store_id && (
        <ReconnectAlert storeId={settings.store_id} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {showTabs && (
            <>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        {showTabs && (
          <>
            <TabsContent value="capabilities">
              <CapabilitiesTab />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentsTab />
            </TabsContent>
            <TabsContent value="links">
              <LinksTab />
            </TabsContent>
            <TabsContent value="tools">
              <ToolsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
