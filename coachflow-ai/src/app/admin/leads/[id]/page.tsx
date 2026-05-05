"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function LeadDetailPage() {
  const adminFetch = useAdminFetch();
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const [lead, setLead] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    adminFetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setLead(j?.lead ?? null);
        setStatus(j?.lead?.status ?? "");
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch, id]);

  async function saveStatus() {
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        setLead((p: any) => ({ ...p, status }));
      }
    } finally {
      setSaving(false);
    }
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-surface-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Lead Details</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/leads">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{lead.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-surface-500">Email</div>
              <div className="text-sm text-surface-100">{lead.email}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500">Created</div>
              <div className="text-sm text-surface-100">{new Date(lead.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500">Revenue</div>
              <div className="text-sm text-surface-100">{lead.revenue || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500">Phone</div>
              <div className="text-sm text-surface-100">{lead.phone || "—"}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-surface-500">Message</div>
            <div className="text-sm text-surface-100 whitespace-pre-wrap">{lead.message || "—"}</div>
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-2">
              <div className="text-xs text-surface-500">Status</div>
              <Input value={status} onChange={(e) => setStatus(e.target.value)} className="w-56" />
            </div>
            <Button variant="primary" disabled={saving} onClick={saveStatus}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

