import { useCallback, useState } from "react";

import { httpClient } from "@/infrastructure/http/client";

export type InvoiceStatus = "DRAFT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiInvoiceDTO {
  id: string;
  tenant_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateInvoiceInput {
  tenantId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  dueDate: string;
  status?: InvoiceStatus;
}

const toEntity = (dto: ApiInvoiceDTO): Invoice => ({
  id: dto.id,
  tenantId: dto.tenant_id,
  subscriptionId: dto.subscription_id,
  amount: Number(dto.amount),
  currency: dto.currency,
  status: dto.status,
  dueDate: dto.due_date,
  paidAt: dto.paid_at ?? undefined,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatformInvoices = useCallback(
    async (filters?: { tenantId?: string; status?: InvoiceStatus }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.tenantId) params.set("tenant_id", filters.tenantId);
        if (filters?.status) params.set("status_filter", filters.status);
        const suffix = params.toString() ? `?${params.toString()}` : "";
        const data = await httpClient.get<ApiInvoiceDTO[]>(
          `/api/platform/invoices${suffix}`,
        );
        setInvoices(data.map(toEntity));
      } catch (err: any) {
        setError(err?.message || "Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchHotelInvoices = useCallback(async (tenantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await httpClient.get<ApiInvoiceDTO[]>(
        `/api/hotels/${tenantId}/invoices`,
      );
      setInvoices(data.map(toEntity));
    } catch (err: any) {
      setError(err?.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (payload: CreateInvoiceInput) => {
    const body = {
      tenant_id: payload.tenantId,
      subscription_id: payload.subscriptionId,
      amount: payload.amount,
      currency: payload.currency,
      due_date: payload.dueDate,
      status: payload.status ?? "DRAFT",
    };
    const created = await httpClient.post<ApiInvoiceDTO>("/api/platform/invoices", body);
    const mapped = toEntity(created);
    setInvoices((prev) => [mapped, ...prev]);
    return mapped;
  }, []);

  const markInvoicePaid = useCallback(async (invoiceId: string) => {
    const updated = await httpClient.patch<ApiInvoiceDTO>(
      `/api/platform/invoices/${invoiceId}/mark-paid`,
      {},
    );
    const mapped = toEntity(updated);
    setInvoices((prev) =>
      prev.map((invoice) => (invoice.id === invoiceId ? mapped : invoice)),
    );
    return mapped;
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchPlatformInvoices,
    fetchHotelInvoices,
    createInvoice,
    markInvoicePaid,
  };
}
