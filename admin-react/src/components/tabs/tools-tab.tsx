import { Button } from "@repo/react-ui/components/ui/button";
import { Card, CardContent } from "@repo/react-ui/components/ui/card";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { ExternalLink, RotateCw } from "lucide-react";

import { toastMessage } from "../../hooks/toast-message";
import { useTestConnection } from "../../hooks/use-settings";

export default function ToolsTab() {
  const testConnection = useTestConnection();
  const toast = toastMessage();

  const handleTestConnection = async () => {
    try {
      const result = await testConnection.mutateAsync();
      if (result.success) {
        toast.success(result.message || "Connection test successful!");
      }
      else {
        toast.error(result.message || "Connection test failed");
      }
    }
    catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Connection test failed",
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Check UCP</h3>
          <p className="text-sm text-muted-foreground">
            Verify your UCP profile is served correctly.
          </p>
          <Button variant="outline" asChild>
            <a href={`${window.location.origin}/.well-known/ucp`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Check UCP Profile
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Test Connection</h3>
          <p className="text-sm text-muted-foreground">
            Test connectivity between your store and UCP Hub application.
          </p>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testConnection.isPending}
          >
            {testConnection.isPending
              ? <Spinner className="size-4" />
              : <RotateCw className="size-4" />}
            Test Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
