import { UCP_CAPABILITY_NAME } from "@repo/ucp-capabilities";
import { useState } from "react";

import type { LinkEntry } from "../components/forms/links-form";

import { WELL_KNOWN_LINK_TYPES } from "./use-links";
import { useSettings } from "./use-settings";

const DEFAULT_SELECTED_CAPABILITIES = [
  UCP_CAPABILITY_NAME.checkout,
  UCP_CAPABILITY_NAME.order,
  UCP_CAPABILITY_NAME.fulfillment,
  UCP_CAPABILITY_NAME.discount,
];

type OnboardingStep = "credentials" | "capabilities" | "payment-handlers" | "links" | "oauth";

function buildInitialLinks(): LinkEntry[] {
  return WELL_KNOWN_LINK_TYPES.map(wk => ({
    type: wk.type,
    url: "",
    title: "",
    isCustom: false,
  }));
}

export function useOnboarding() {
  const { data: settings } = useSettings();
  const [stepOverride, setStepOverride] = useState<OnboardingStep | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([...DEFAULT_SELECTED_CAPABILITIES]);
  const [selectedPaymentHandlers, setSelectedPaymentHandlers] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkEntry[]>(buildInitialLinks());
  const [authUrl, setAuthUrl] = useState("");

  const defaultStep: OnboardingStep
    = settings?.api_key && settings?.store_id ? "capabilities" : "credentials";
  const currentStep = stepOverride ?? defaultStep;

  const goToCredentials = () => setStepOverride("credentials");
  const goToCapabilities = () => setStepOverride("capabilities");
  const goToPaymentHandlers = () => setStepOverride("payment-handlers");
  const goToLinks = () => setStepOverride("links");
  const goToOAuth = (url: string) => {
    setAuthUrl(url);
    setStepOverride("oauth");
  };

  const reset = () => {
    setStepOverride(null);
    setSelectedCapabilities([...DEFAULT_SELECTED_CAPABILITIES]);
    setSelectedPaymentHandlers([]);
    setLinks(buildInitialLinks());
    setAuthUrl("");
  };

  const toggleCapability = (value: string, checked: boolean) => {
    setSelectedCapabilities(prev =>
      checked ? [...prev, value] : prev.filter(v => v !== value),
    );
  };

  const togglePaymentHandler = (value: string, checked: boolean) => {
    setSelectedPaymentHandlers(prev =>
      checked ? [...prev, value] : prev.filter(v => v !== value),
    );
  };

  const updateLinks = (newLinks: LinkEntry[]) => {
    setLinks(newLinks);
  };

  const updateLinkUrl = (type: string, url: string) => {
    setLinks(prev => prev.map(link =>
      link.type === type ? { ...link, url } : link,
    ));
  };

  return {
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
    reset,
    toggleCapability,
    togglePaymentHandler,
    updateLinks,
    updateLinkUrl,
  };
}
