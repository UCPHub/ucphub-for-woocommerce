import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface PaymentGatewaysResponse {
  success: boolean;
  gateways: PaymentGateway[];
}

export function usePaymentGateways() {
  return useQuery<PaymentGatewaysResponse>({
    queryKey: ["payment-gateways"],
    queryFn: () => api.request<PaymentGatewaysResponse>("payment-gateways"),
  });
}
