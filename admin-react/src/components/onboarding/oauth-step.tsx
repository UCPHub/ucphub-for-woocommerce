import { Alert, AlertDescription, AlertTitle } from "@repo/react-ui/components/ui/alert";
import { Button } from "@repo/react-ui/components/ui/button";
import { Info, Link, LockKeyhole } from "lucide-react";

interface OAuthStepProps {
  authUrl: string;
  onComplete: (apiKey: string, storeId: string) => void;
  onBack: () => void;
}

export default function OAuthStep({ authUrl, onBack }: OAuthStepProps) {
  return (
    <div className="text-center py-6 space-y-4">
      <LockKeyhole className="size-12 mx-auto text-muted-foreground" />
      <h3 className="text-xl font-semibold">Authorize WooCommerce Access</h3>
      <p className="text-muted-foreground">
        To enable product catalog and order management, we need access to
        your WooCommerce REST API.
      </p>
      <p className="text-muted-foreground text-sm">
        Click the button below to approve access. You'll be redirected to
        WooCommerce and then back here automatically.
      </p>

      <div className="space-y-3 pt-2 max-w-md mx-auto">
        <Button
          size="lg"
          className="w-full"
          onClick={() => (window.location.href = authUrl)}
          disabled={!authUrl}
        >
          <Link className="size-4" />
          Authorize WooCommerce Access
        </Button>
        <Button variant="link" onClick={onBack}>
          Back
        </Button>
      </div>

      <Alert variant="info" className="text-left mt-6">
        <Info className="size-4" />
        <AlertTitle>Why is this needed?</AlertTitle>
        <AlertDescription>
          The WooCommerce REST API credentials allow our backend to fetch your
          products, create orders, and manage your store on behalf of AI platforms.
        </AlertDescription>
      </Alert>
    </div>
  );
}
