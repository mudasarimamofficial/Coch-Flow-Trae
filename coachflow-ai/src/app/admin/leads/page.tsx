"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Filter, Mail, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/hooks/useAdminFetch";

type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  revenue: string | null;
  status: string;
};

export default function LeadsPage() {
  const adminFetch = useAdminFetch();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    adminFetch(`/api/admin/leads?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setItems(j?.items ?? []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch, q]);

  const statusBadge = (status: string) => {
    if (status === "new") return <Badge variant="warning">New</Badge>;
    if (status === "contacted") return <Badge variant="default">Contacted</Badge>;
    if (status === "meeting_booked") return <Badge variant="success">Meeting</Badge>;
    if (status === "closed") return <Badge variant="success">Closed</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const total = useMemo(() => items.length, [items.length]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Leads Pipeline</h1>
          <p className="text-surface-400 text-sm">Manage incoming applications captured on the live site.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-surface-800 bg-surface-900/50 gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-surface-500" />
                <Input
                  placeholder="Search leads by name or email..."
                  className="pl-9 h-8 bg-surface-950 border-surface-800 text-sm"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-2 border-surface-700 text-surface-300" disabled>
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-400">
              Showing <span className="text-surface-100 font-medium">{loading ? "—" : total}</span> leads
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-400 uppercase bg-surface-900/40 border-b border-surface-800">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Received
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {items.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-surface-50">{lead.name}</span>
                        <span className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(lead.status)}</td>
                    <td className="px-6 py-4 text-surface-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-surface-500" />
                        {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-400 hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/admin/leads/${lead.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

