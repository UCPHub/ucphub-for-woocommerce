import { Checkbox } from "@repo/react-ui/components/ui/checkbox";
import { Label } from "@repo/react-ui/components/ui/label";
import { Spinner } from "@repo/react-ui/components/ui/spinner";

interface CapabilitiesFormProps {
  available: Array<{ name: string; label: string; description: string }>;
  selected: string[];
  onToggle: (name: string, checked: boolean) => void;
  isLoading?: boolean;
}

export default function CapabilitiesForm({
  available,
  selected,
  onToggle,
  isLoading,
}: CapabilitiesFormProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {available.map((capability) => {
        const isSelected = selected.includes(capability.name);
        return (
          <div
            key={capability.name}
            className={`rounded-lg border p-4 transition-colors ${
              isSelected ? "bg-primary/5 border-primary/20" : "bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={capability.name}
                checked={isSelected}
                onCheckedChange={checked =>
                  onToggle(capability.name, checked === true)}
              />
              <Label htmlFor={capability.name} className="cursor-pointer flex-1">
                <div className="space-y-1">
                  <span className="font-medium">{capability.label}</span>
                  <p className="text-muted-foreground text-sm">
                    {capability.description}
                  </p>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {capability.name}
                  </code>
                </div>
              </Label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
