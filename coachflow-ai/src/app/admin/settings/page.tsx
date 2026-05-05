"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function SettingsPage() {
  const adminFetch = useAdminFetch();
  const [adminEmail, setAdminEmail] = useState("");
  const [resendFrom, setResendFrom] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [homeContent, setHomeContent] = useState<any>({});
  const [homeBaseline, setHomeBaseline] = useState<string | null>(null);
  const [waEnabled, setWaEnabled] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [waLabel, setWaLabel] = useState("");
  const [savingSite, setSavingSite] = useState(false);

  useEffect(() => {
    let mounted = true;
    adminFetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j?.ok) return;
        setAdminEmail(j.settings?.admin_email ?? "");
        setResendFrom(j.settings?.resend_from_email ?? "");
        setHasKey(Boolean(j.secret?.resend_api_key_present));
      });

    adminFetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j?.ok) return;
        const c = (j.draft?.content && Object.keys(j.draft.content).length ? j.draft.content : j.published?.content) ?? {};
        setHomeContent(c);
        setHomeBaseline(j.draft?.published_updated_at ?? j.published?.updated_at ?? null);
        const w = (c as any)?.whatsappWidget;
        setWaEnabled(Boolean(w?.enabled));
        setWaPhone(typeof w?.phone === "string" ? w.phone : "");
        setWaMessage(typeof w?.message === "string" ? w.message : "");
        setWaLabel(typeof w?.label === "string" ? w.label : "");
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  async function save() {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          admin_email: adminEmail.trim() || undefined,
          resend_from_email: resendFrom.trim() || null,
          resend_api_key: resendKey.trim() ? resendKey.trim() : undefined,
        }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        if (resendKey.trim()) {
          setHasKey(true);
          setResendKey("");
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveSite() {
    setSavingSite(true);
    try {
      const next = {
        ...homeContent,
        whatsappWidget: {
          enabled: waEnabled,
          phone: waPhone.trim(),
          message: waMessage.trim(),
          label: waLabel.trim(),
        },
      };
      const res = await adminFetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: next, published_updated_at: homeBaseline }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        setHomeContent(next);
        setHomeBaseline(j.published_updated_at ?? homeBaseline);
      }
    } finally {
      setSavingSite(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-surface-400 text-sm">Real settings that affect lead notifications and email sending.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Notifications</CardTitle>
          <CardDescription>Where lead alerts should be sent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-200">Admin Email</label>
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email (Resend)</CardTitle>
          <CardDescription>Stored in Supabase `settings` + `secret_settings`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-200">Resend From Email</label>
            <Input value={resendFrom} onChange={(e) => setResendFrom(e.target.value)} placeholder="from@yourdomain.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-200">Resend API Key</label>
            <Input
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder={hasKey ? "Key is set (enter to replace)" : "Enter Resend API key"}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-surface-800 bg-surface-900/20 pt-6">
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site Integrations</CardTitle>
          <CardDescription>These settings change what visitors see on the live landing page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-surface-800 bg-surface-900/20 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-surface-200">WhatsApp Floating Button</div>
              <div className="text-xs text-surface-500">Shows a WhatsApp button on the live site.</div>
            </div>
            <label className="text-sm text-surface-300 flex items-center gap-2">
              <input type="checkbox" checked={waEnabled} onChange={(e) => setWaEnabled(e.target.checked)} />
              Enabled
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-200">Phone (international)</label>
              <Input value={waPhone} onChange={(e) => setWaPhone(e.target.value)} placeholder="+447700900123" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-200">Button Label</label>
              <Input value={waLabel} onChange={(e) => setWaLabel(e.target.value)} placeholder="WhatsApp" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-surface-200">Prefill Message</label>
              <Input value={waMessage} onChange={(e) => setWaMessage(e.target.value)} placeholder="Hey Hamza, I want to apply..." />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-surface-800 bg-surface-900/20 pt-6">
          <Button variant="primary" onClick={saveSite} disabled={savingSite}>
            {savingSite ? "Saving..." : "Save Site Settings to Draft"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
