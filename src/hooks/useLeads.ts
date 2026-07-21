"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";
import type { ClientLead, AnalyticsSummary } from "@/types/client";

export function useLeads(params: { q?: string; stage?: string; priority?: string; type?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.stage) qs.set("stage", params.stage);
  if (params.priority) qs.set("priority", params.priority);
  if (params.type) qs.set("type", params.type);
  const query = qs.toString();
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => api<ClientLead[]>(`/api/leads${query ? `?${query}` : ""}`),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => api<AnalyticsSummary>("/api/analytics/summary"),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<ClientLead>("/api/leads", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api<ClientLead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
