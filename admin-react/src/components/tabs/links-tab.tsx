import { Card, CardContent } from "@repo/react-ui/components/ui/card";
import { SaveButton } from "@repo/react-ui/components/ui/save-button";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { useCallback, useMemo } from "react";

import type { StoreLink } from "../../hooks/use-links";
import type { LinkEntry } from "../forms/links-form";

import { toastMessage } from "../../hooks/toast-message";
import {
  useStoreLinks,
  useUpdateLinks,
  WELL_KNOWN_LINK_TYPES,
} from "../../hooks/use-links";
import { useSettings } from "../../hooks/use-settings";
import LinksForm from "../forms/links-form";

function serverLinksToEntries(serverLinks: StoreLink[] | undefined): LinkEntry[] {
  const entries: LinkEntry[] = WELL_KNOWN_LINK_TYPES.map((wk) => {
    const existing = serverLinks?.find(l => l.type === wk.type);
    return {
      type: wk.type,
      url: existing?.url ?? "",
      title: existing?.title ?? "",
      isCustom: false,
    };
  });

  if (serverLinks) {
    const wellKnownTypes = new Set<string>(WELL_KNOWN_LINK_TYPES.map(wk => wk.type));
    for (const link of serverLinks) {
      if (!wellKnownTypes.has(link.type)) {
        entries.push({
          type: link.type,
          url: link.url,
          title: link.title ?? "",
          isCustom: true,
        });
      }
    }
  }

  return entries;
}

export default function LinksTab() {
  const { data: settings } = useSettings();
  const { data: serverLinks, isLoading: loadingLinks, refetch: refetchLinks } = useStoreLinks();
  const updateLinks = useUpdateLinks();
  const toast = toastMessage();

  const defaultValues = useMemo(
    () => serverLinksToEntries(serverLinks),
    [serverLinks],
  );

  const handleValidSubmit = useCallback(async (validatedLinks: LinkEntry[]) => {
    try {
      const linksToSave: StoreLink[] = validatedLinks
        .filter(link => link.url.trim())
        .map((link) => {
          const storeLink: StoreLink = {
            type: link.type,
            url: link.url.trim(),
          };
          if (link.title.trim()) {
            storeLink.title = link.title.trim();
          }
          return storeLink;
        });

      await updateLinks.mutateAsync(linksToSave);
      toast.success("Links updated successfully!");
      refetchLinks();
    }
    catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update links",
      );
    }
  }, [updateLinks, toast, refetchLinks]);

  if (settings?.connection_status !== "connected") {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">
            Please connect your store to manage policy links.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingLinks) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner className="size-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">Policy Links</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Configure policy links that will be included in your UCP profile.
            AI agents can use these links to provide customers with important
            store information.
          </p>
        </div>

        <LinksForm
          defaultValues={defaultValues}
          onValidSubmit={handleValidSubmit}
        >
          {({ isDirty }) => (
            <SaveButton
              type="submit"
              isPending={updateLinks.isPending}
              isDirty={isDirty}
              label="Save Links"
            />
          )}
        </LinksForm>
      </CardContent>
    </Card>
  );
}
