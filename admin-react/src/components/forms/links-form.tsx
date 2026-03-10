import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/react-ui/components/ui/button";
import { Input } from "@repo/react-ui/components/ui/input";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { WELL_KNOWN_LINK_TYPES } from "../../hooks/use-links";

const urlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val.trim())
        return true;
      try {
        const url = new URL(val.trim());
        return url.protocol === "http:" || url.protocol === "https:";
      }
      catch {
        return false;
      }
    },
    "Please enter a valid URL (e.g. https://example.com)",
  );

const linkEntrySchema = z.object({
  type: z.string(),
  url: urlSchema,
  title: z.string(),
  isCustom: z.boolean(),
});

const linksFormSchema = z.object({
  links: z.array(linkEntrySchema),
});

export type LinkEntry = z.infer<typeof linkEntrySchema>;
type LinksFormData = z.infer<typeof linksFormSchema>;

interface LinksFormProps {
  defaultValues: LinkEntry[];
  onValidSubmit: (links: LinkEntry[]) => void;
  onChange?: (links: LinkEntry[], isDirty: boolean) => void;
  children: (form: { isDirty: boolean }) => React.ReactNode;
  formRef?: React.RefObject<{ submit: () => void } | null>;
}

function getLinkLabel(link: LinkEntry) {
  if (link.isCustom)
    return "Custom Link";
  const wellKnown = WELL_KNOWN_LINK_TYPES.find(wk => wk.type === link.type);
  return wellKnown?.label ?? link.type;
}

export default function LinksForm({
  defaultValues,
  onValidSubmit,
  onChange,
  children,
  formRef,
}: LinksFormProps) {
  const form = useForm<LinksFormData>({
    resolver: zodResolver(linksFormSchema),
    defaultValues: { links: defaultValues },
    mode: "onBlur",
  });

  const { control, register, handleSubmit, formState: { errors, isDirty }, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "links" });
  const watchedLinks = useWatch({ control, name: "links" });

  useEffect(() => {
    if (!onChange) {
      reset({ links: defaultValues });
    }
  }, [defaultValues, reset, onChange]);

  useEffect(() => {
    if (onChange && watchedLinks) {
      onChange(watchedLinks as LinkEntry[], isDirty);
    }
  }, [watchedLinks, isDirty, onChange]);

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        submit: () => handleSubmit(data => onValidSubmit(data.links))(),
      };
    }
  }, [formRef, handleSubmit, onValidSubmit]);

  const onSubmit = (data: LinksFormData) => {
    onValidSubmit(data.links);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium m-0!">{getLinkLabel(field as LinkEntry)}</h3>
              {field.isCustom && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Input
                  type="url"
                  placeholder="https://"
                  aria-invalid={!!errors.links?.[index]?.url}
                  {...register(`links.${index}.url`)}
                />
                {errors.links?.[index]?.url && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.links[index].url.message}
                  </p>
                )}
              </div>
              <Input
                placeholder="Title (optional)"
                {...register(`links.${index}.title`)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ type: "custom", url: "", title: "", isCustom: true })}
        >
          <Plus className="size-4 mr-1" />
          Add custom link
        </Button>
      </div>

      {children({ isDirty })}
    </form>
  );
}
