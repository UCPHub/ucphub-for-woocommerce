import { Alert, AlertDescription, AlertTitle } from "@repo/react-ui/components/ui/alert";
import { Button } from "@repo/react-ui/components/ui/button";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { Info } from "lucide-react";
import { useMemo } from "react";

import type { LinkEntry } from "../forms/links-form";

import { toastMessage } from "../../hooks/toast-message";
import { useCompleteSetup } from "../../hooks/use-connection-store";
import { usePolicyPages } from "../../hooks/use-policy-pages";
import LinksForm from "../forms/links-form";

interface LinksStepProps {
  selectedCapabilities: string[];
  selectedPaymentHandlers: string[];
  links: LinkEntry[];
  onUpdateLinks: (links: LinkEntry[]) => void;
  onComplete: (apiKey: string, storeId: string) => void;
  onNeedsAuth: (authUrl: string) => void;
  onBack: () => void;
}

export default function LinksStep({
  selectedCapabilities,
  selectedPaymentHandlers,
  links,
  onUpdateLinks,
  onComplete,
  onNeedsAuth,
  onBack,
}: LinksStepProps) {
  const { data: policyPages, isLoading: loadingPages } = usePolicyPages();
  const completeSetup = useCompleteSetup();
  const toast = toastMessage();

  const initialLinks = useMemo(() => {
    if (!policyPages)
      return links;
    return links.map((link) => {
      const policyUrl = policyPages[link.type as keyof typeof policyPages];
      if (policyUrl && !link.url) {
        return { ...link, url: policyUrl as string };
      }
      return link;
    });
  }, [policyPages, links]);

  const handleValidSubmit = async (validatedLinks: LinkEntry[]) => {
    onUpdateLinks(validatedLinks);

    const ucpLinks = validatedLinks
      .filter(link => link.url.trim())
      .map(link => ({
        type: link.type,
        url: link.url.trim(),
        ...(link.title.trim() ? { title: link.title.trim() } : {}),
      }));

    try {
      const result = await completeSetup.mutateAsync({
        ucp_capabilities: selectedCapabilities,
        ucp_payment_handlers: selectedPaymentHandlers,
        ucp_links: ucpLinks.length > 0 ? ucpLinks : undefined,
      });

      if (result.needs_authorization && result.auth_url) {
        onNeedsAuth(result.auth_url);
        return;
      }

      onComplete(result.api_key, result.store_id);

      if (result.store_reused) {
        toast.success("Connected to your existing store configuration!");
      }
      else {
        toast.success("Store connected successfully!");
      }
    }
    catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Connection failed",
      );
    }
  };

  if (loadingPages) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Add policy links to your UCP profile. AI agents can share these
        with customers. All fields are optional.
      </p>

      <Alert variant="info">
        <Info className="size-4" />
        <AlertTitle>Where to find your policy pages</AlertTitle>
        <AlertDescription>
          Policy pages are typically set up in WooCommerce under
          {" "}
          <strong>Settings &rarr; Advanced &rarr; Page setup</strong>
          {" "}
          If your store already has published policy pages, they will be
          auto-filled below. You can also use any public URL.
        </AlertDescription>
      </Alert>

      <LinksForm
        defaultValues={initialLinks}
        onValidSubmit={handleValidSubmit}
        onChange={updatedLinks => onUpdateLinks(updatedLinks)}
      >
        {() => (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={completeSetup.isPending}>
              {completeSetup.isPending && <Spinner className="size-4" />}
              {completeSetup.isPending ? "Connecting..." : "Connect Store"}
            </Button>
          </div>
        )}
      </LinksForm>
    </div>
  );
}
