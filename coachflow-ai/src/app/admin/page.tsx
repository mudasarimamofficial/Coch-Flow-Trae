"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Layout, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/hooks/useAdminFetch";

type OverviewPayload = {
  ok: boolean;
  stats?: {
    leads30d: number;
    newLeads30d: number;
    pages: number;
    homepageDraftUpdatedAt: string | null;
  };
  recentHomepageVersions?: Array<{ id: number; created_at: string; created_by: string | null }>;
};

export default function AdminOverviewPage() {
  const adminFetch = useAdminFetch();
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    adminFetch("/api/admin/overview")
      .then((r) => r.json())
      .then((j) => {
        if (mounted) setData(j);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  const stats = data?.stats;
  const recent = data?.recentHomepageVersions ?? [];

  const draftLabel = useMemo(() => {
    if (!stats?.homepageDraftUpdatedAt) return "No draft";
    const d = new Date(stats.homepageDraftUpdatedAt);
    return `Draft updated ${d.toLocaleString()}`;
  }, [stats?.homepageDraftUpdatedAt]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Overview</h1>
          <p className="text-surface-400 text-sm">Your operating view for the live site and content system.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              View Live Site
            </a>
          </Button>
          <Button variant="primary" className="gap-2" asChild>
            <Link href="/admin/builder">
              <Layout className="h-4 w-4" />
              Open Visual Builder
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-medium text-surface-300">Total Leads (30d)</CardTitle>
            <Users className="h-4 w-4 text-surface-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "—" : String(stats?.leads30d ?? 0)}</div>
            <p className="text-xs text-surface-500 mt-1">{loading ? "" : `${stats?.newLeads30d ?? 0} new`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-medium text-surface-300">Pages</CardTitle>
            <BarChart3 className="h-4 w-4 text-surface-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "—" : String(stats?.pages ?? 0)}</div>
            <p className="text-xs text-surface-500 mt-1">Published and draft pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-medium text-surface-300">Homepage</CardTitle>
            <Layout className="h-4 w-4 text-surface-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-white">{loading ? "—" : draftLabel}</div>
            <p className="text-xs text-surface-500 mt-1">Preview and publish from Builder</p>
          </CardContent>
        </Card>

        <Card className="border-brand-500/20 bg-brand-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-transparent">
            <CardTitle className="text-sm font-medium text-brand-300">Site Status</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-brand-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">OK</div>
            <p className="text-xs text-surface-400 mt-1">Keys validated via `/api/health`</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Homepage Backups</CardTitle>
          <CardDescription>Latest published snapshots (auto-created on publish).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <div className="text-sm text-surface-500">No backups found.</div>
            ) : (
              recent.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-surface-800 bg-surface-900/30 px-4 py-3"
                >
                  <div className="text-sm text-surface-100">
                    Version #{v.id}
                    <span className="text-surface-500"> · {new Date(v.created_at).toLocaleString()}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/builder">Open Builder</Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

