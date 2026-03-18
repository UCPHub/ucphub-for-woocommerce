import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@repo/react-ui/components/ui/alert";
import { Button } from "@repo/react-ui/components/ui/button";
import { Input } from "@repo/react-ui/components/ui/input";
import { Label } from "@repo/react-ui/components/ui/label";
import { Spinner } from "@repo/react-ui/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { CredentialsFormData } from "../../lib/schemas";

import { toastMessage } from "../../hooks/toast-message";
import { useSettings } from "../../hooks/use-settings";
import { api } from "../../lib/api";
import { credentialsSchema } from "../../lib/schemas";

export interface CredentialsStepProps {
  onSuccess: () => void;
}

export default function CredentialsStep({ onSuccess }: CredentialsStepProps) {
  const [savingCredentials, setSavingCredentials] = useState(false);
  const toast = toastMessage();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  const form = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      api_key: "",
      store_id: "",
    },
  });

  useEffect(() => {
    if (settings?.api_key || settings?.store_id) {
      form.reset({
        api_key: settings.api_key ?? "",
        store_id: settings.store_id ?? "",
      });
    }
  }, [settings, form]);

  const handleSubmit = async (data: CredentialsFormData) => {
    setSavingCredentials(true);
    try {
      const response = await fetch(`${api.getRestUrl()}save-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": api.getNonce(),
        },
        body: JSON.stringify({
          api_key: data.api_key,
          store_id: data.store_id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid credentials");
      }

      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Credentials validated successfully!");
      onSuccess();
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to validate credentials";
      toast.error(message);
    }
    finally {
      setSavingCredentials(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        First, create your store at the UCPhub dashboard and copy your
        credentials below.
      </p>

      <Alert variant="info">
        <Info className="size-4" />
        <AlertTitle>How to get your credentials</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>
              Visit
              {" "}
              <a
                href="https://app.ucphub.ai/dashboard/stores/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                app.ucphub.ai/dashboard/stores/new
              </a>
            </li>
            <li>Create a new store with your WooCommerce site URL</li>
            <li>Copy the API Key and Store ID from the setup page</li>
            <li>Paste them below</li>
          </ol>
        </AlertDescription>
      </Alert>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="api_key">
            API Key
            {" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="api_key"
            type="password"
            placeholder="ucp_hub..."
            aria-invalid={!!form.formState.errors.api_key}
            {...form.register("api_key")}
          />
          {form.formState.errors.api_key && (
            <p className="text-sm text-destructive">
              {form.formState.errors.api_key.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="store_id">
            Store ID
            {" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="store_id"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            aria-invalid={!!form.formState.errors.store_id}
            {...form.register("store_id")}
          />
          {form.formState.errors.store_id && (
            <p className="text-sm text-destructive">
              {form.formState.errors.store_id.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={savingCredentials}>
          {savingCredentials && <Spinner className="size-4" />}
          {savingCredentials ? "Validating..." : "Validate & Continue"}
        </Button>
      </form>
    </div>
  );
}
