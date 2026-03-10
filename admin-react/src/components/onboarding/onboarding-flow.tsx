import { Card, CardContent, CardHeader, CardTitle } from "@repo/react-ui/components/ui/card";

import { useOnboarding } from "../../hooks/use-onboarding";
import CapabilitiesStep from "./capabilities-step";
import CredentialsStep from "./credentials-step";
import LinksStep from "./links-step";
import OAuthStep from "./oauth-step";
import PaymentHandlersStep from "./payment-handlers-step";
import StepIndicator from "./step-indicator";

interface OnboardingFlowProps {
  onComplete: (apiKey: string, storeId: string) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    currentStep,
    selectedCapabilities,
    selectedPaymentHandlers,
    links,
    authUrl,
    goToCredentials,
    goToCapabilities,
    goToPaymentHandlers,
    goToLinks,
    goToOAuth,
    toggleCapability,
    togglePaymentHandler,
    updateLinks,
  } = useOnboarding();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold mb-4">Connect Store to UCP Backend</CardTitle>
        <StepIndicator currentStep={currentStep} />
      </CardHeader>
      <CardContent>
        {currentStep === "credentials" && (
          <CredentialsStep
            onSuccess={goToCapabilities}
          />
        )}
        {currentStep === "capabilities" && (
          <CapabilitiesStep
            selectedCapabilities={selectedCapabilities}
            onToggle={toggleCapability}
            onNext={goToPaymentHandlers}
            onBack={goToCredentials}
          />
        )}
        {currentStep === "payment-handlers" && (
          <PaymentHandlersStep
            selectedPaymentHandlers={selectedPaymentHandlers}
            onToggle={togglePaymentHandler}
            onNext={goToLinks}
            onBack={goToCapabilities}
          />
        )}
        {currentStep === "links" && (
          <LinksStep
            selectedCapabilities={selectedCapabilities}
            selectedPaymentHandlers={selectedPaymentHandlers}
            links={links}
            onUpdateLinks={updateLinks}
            onComplete={onComplete}
            onNeedsAuth={goToOAuth}
            onBack={goToPaymentHandlers}
          />
        )}
        {currentStep === "oauth" && (
          <OAuthStep
            authUrl={authUrl}
            onComplete={onComplete}
            onBack={goToPaymentHandlers}
          />
        )}
      </CardContent>
    </Card>
  );
}
