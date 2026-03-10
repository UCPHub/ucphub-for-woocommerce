import { z } from "zod";

export const credentialsSchema = z.object({
  api_key: z
    .string()
    .min(1, "Please input your API Key!")
    .regex(/^ucp_hub_/, "API Key should start with 'ucp_hub_'"),
  store_id: z
    .string()
    .min(1, "Please input your Store ID!")
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Store ID must be a valid UUID",
    ),
});

export type CredentialsFormData = z.infer<typeof credentialsSchema>;
