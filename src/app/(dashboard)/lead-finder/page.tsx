"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Radar, Search, Star, Globe, Phone, Download, CheckCircle2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api } from "@/lib/fetcher";

const TYPES = ["hotel", "restaurant", "jewellery", "hospital", "coaching", "gym", "salon", "other"];

type Candidate = {
  businessName: string;
  businessType: string;
  website: string;
  phone: string;
  city: string;
  googleRating: number;
  reviewsCount: number;
  placeId?: string;
  source: "places" | "sample";
};

type SearchResult = { candidates: Candidate[]; live: boolean; placesEnabled: boolean };

export default function LeadFinderPage() {
  const qc = useQueryClient();
  const [businessType, setBusinessType] = useState("hotel");
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  const search = useMutation({
    mutationFn: () =>
      api<SearchResult>("/api/lead-finder/search", {
        method: "POST",
        body: JSON.stringify({ businessType, city, keyword }),
      }),
    onSuccess: (data) => {
      setResults(data.candidates);
      setLive(data.live);
      setSelected(new Set(data.candidates.map((_, i) => i)));
      setImportResult(null);
    },
  });

  const importLeads = useMutation({
    mutationFn: (candidates: Candidate[]) =>
      api<{ imported: number; skipped: number }>("/api/lead-finder/import", {
        method: "POST",
        body: JSON.stringify({ candidates }),
      }),
    onSuccess: (data) => {
      setImportResult(data);
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function importSelected() {
    const chosen = results.filter((_, i) => selected.has(i));
    if (chosen.length) importLeads.mutate(chosen);
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Radar className="h-6 w-6 text-[var(--primary)]" /> Lead Finder
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Discover businesses by niche and city, then import them as auto-analyzed leads.
        </p>
      </div>

      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search.mutate();
          }}
          className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        >
          <div>
            <Label>Business type</Label>
            <Select className="w-full" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jaipur" />
          </div>
          <div>
            <Label>Keyword (optional)</Label>
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. luxury boutique" />
          </div>
          <Button type="submit" disabled={search.isPending}>
            <Search className="h-4 w-4" /> {search.isPending ? "Searching…" : "Search"}
          </Button>
        </form>
        {search.isError && <p className="mt-2 text-sm text-red-400">{(search.error as Error).message}</p>}
      </Card>

      {results.length > 0 && (
        <>
          {!live && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Showing <strong>sample</strong> results. Add a <code>GOOGLE_PLACES_API_KEY</code> to fetch real
                businesses from Google Places. You can still import these to explore the workflow.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              {results.length} results · {selected.size} selected
            </p>
            <Button onClick={importSelected} disabled={importLeads.isPending || selected.size === 0}>
              <Download className="h-4 w-4" />
              {importLeads.isPending ? "Importing…" : `Import ${selected.size} as leads`}
            </Button>
          </div>

          {importResult && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              Imported {importResult.imported} lead(s)
              {importResult.skipped > 0 && ` · skipped ${importResult.skipped} duplicate(s)`}. Open the Leads tab to
              view them.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c, i) => {
              const isSel = selected.has(i);
              return (
                <Card
                  key={`${c.businessName}-${i}`}
                  onClick={() => toggle(i)}
                  className={`cursor-pointer p-4 transition-all ${
                    isSel ? "ring-2 ring-[var(--primary)]" : "hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{c.businessName}</p>
                      <p className="text-xs capitalize text-[var(--muted)]">
                        {c.businessType} · {c.city || "—"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggle(i)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400" /> {c.googleRating || "—"} ({c.reviewsCount})
                    </span>
                    {c.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> {c.website ? "Has website" : "No website"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
