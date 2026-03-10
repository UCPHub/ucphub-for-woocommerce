import { cn } from "@repo/react-ui/lib/utils";

const STEPS = [
  { key: "credentials", label: "Credentials" },
  { key: "capabilities", label: "Capabilities" },
  { key: "payment-handlers", label: "Payment Providers" },
  { key: "links", label: "Policy Links" },
  { key: "oauth", label: "Authorization" },
] as const;

type Step = (typeof STEPS)[number]["key"];

interface StepIndicatorProps {
  currentStep: Step;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "size-6 rounded-full flex items-center justify-center text-xs font-medium",
                index < currentIndex && "bg-primary/40 text-primary-foreground",
                index === currentIndex && "bg-primary text-primary-foreground",
                index > currentIndex && "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                index < currentIndex && "text-muted-foreground",
                index === currentIndex && "text-foreground font-medium",
                index > currentIndex && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-8",
                index < currentIndex ? "bg-primary/40" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
