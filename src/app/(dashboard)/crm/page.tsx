"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { PriorityBadge, STAGE_LABELS } from "@/components/ui/badge";
import { useLeads, useUpdateLead } from "@/hooks/useLeads";
import { formatCurrency } from "@/lib/utils";
import { PIPELINE_STAGES, type PipelineStage } from "@/types";
import type { ClientLead } from "@/types/client";

export default function CrmPage() {
  const { data } = useLeads();
  const update = useUpdateLead();
  const [board, setBoard] = useState<Record<string, ClientLead[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!data) return;
    const next: Record<string, ClientLead[]> = {};
    for (const s of PIPELINE_STAGES) next[s] = [];
    for (const l of data) (next[l.stage] ??= []).push(l);
    setBoard(next);
  }, [data]);

  const activeLead = activeId
    ? Object.values(board).flat().find((l) => l._id === activeId) ?? null
    : null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const leadId = String(e.active.id);
    const overStage = e.over?.id as PipelineStage | undefined;
    if (!overStage) return;

    const current = Object.entries(board).find(([, ls]) => ls.some((l) => l._id === leadId));
    if (!current) return;
    const [fromStage] = current;
    if (fromStage === overStage) return;

    // Optimistic move
    setBoard((prev) => {
      const lead = prev[fromStage].find((l) => l._id === leadId)!;
      return {
        ...prev,
        [fromStage]: prev[fromStage].filter((l) => l._id !== leadId),
        [overStage]: [{ ...lead, stage: overStage }, ...prev[overStage]],
      };
    });
    update.mutate({ id: leadId, body: { stage: overStage } });
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CRM Pipeline</h1>
        <p className="text-sm text-[var(--muted)]">Drag leads across stages to update their status.</p>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {PIPELINE_STAGES.map((stage) => (
            <Column key={stage} stage={stage} leads={board[stage] ?? []} />
          ))}
        </div>
        <DragOverlay>{activeLead ? <LeadCard lead={activeLead} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ stage, leads }: { stage: PipelineStage; leads: ClientLead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = leads.reduce((s, l) => s + (l.estimatedValue ?? 0), 0);
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{STAGE_LABELS[stage]}</span>
          <span className="rounded-full bg-[var(--surface-2)] px-2 text-xs text-[var(--muted)]">{leads.length}</span>
        </div>
        <span className="text-[10px] text-[var(--muted)]">{formatCurrency(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[60vh] flex-col gap-2 rounded-2xl border border-dashed p-2 transition-colors ${
          isOver ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-[var(--surface-2)]/40"
        }`}
      >
        {leads.map((l) => <DraggableCard key={l._id} lead={l} />)}
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: ClientLead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead._id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? "opacity-40" : ""}>
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, dragging }: { lead: ClientLead; dragging?: boolean }) {
  return (
    <Card className={`cursor-grab p-3 active:cursor-grabbing ${dragging ? "rotate-2 shadow-2xl" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{lead.businessName}</p>
        <PriorityBadge priority={lead.priority} />
      </div>
      <p className="mt-1 text-xs capitalize text-[var(--muted)]">{lead.businessType} · {lead.city || "—"}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{formatCurrency(lead.estimatedValue ?? 0)}</span>
        <span>{lead.closingProbability ?? 0}%</span>
      </div>
    </Card>
  );
}
