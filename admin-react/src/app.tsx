import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/react-ui/components/ui/tabs";
import { useState } from "react";

import CapabilitiesTab from "./components/tabs/capabilities-tab";
import GeneralTab from "./components/tabs/general-tab";
import LinksTab from "./components/tabs/links-tab";
import PaymentsTab from "./components/tabs/payments-tab";
import ToolsTab from "./components/tabs/tools-tab";
import { useOAuthReturn } from "./hooks/use-oauth-return";
import { useSettings } from "./hooks/use-settings";

export default function App() {
  const [activeTab, setActiveTab] = useState("general");
  const { data: settings } = useSettings();

  useOAuthReturn();

  const isConnected = settings?.connection_status === "connected";

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">WooCommerce UCP Hub Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {isConnected && (
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

        {isConnected && (
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
