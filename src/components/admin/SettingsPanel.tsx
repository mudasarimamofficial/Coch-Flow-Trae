import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateSenderEmailBasic } from "@/utils/resendSender";

type Props = {
  supabase: SupabaseClient;
};

export function SettingsPanel({ supabase }: Props) {
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [resendMasked, setResendMasked] = useState("");
  const [resendKeyDraft, setResendKeyDraft] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderStatus, setSenderStatus] = useState<string | null>(null);
  const [senderMessage, setSenderMessage] = useState<string | null>(null);
  const [senderEffective, setSenderEffective] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setSettingsSaved(null);
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select(
          "id, admin_email, resend_api_key_masked, resend_from_email, resend_sender_status, resend_sender_message",
        )
        .eq("id", 1)
        .single();

      if (error) {
        setSettingsError(error.message);
        return;
      }

      setAdminEmail((data as { admin_email: string }).admin_email);
      setResendMasked(String((data as any).resend_api_key_masked || ""));
      setSenderEmail(String((data as any).resend_from_email || ""));
      setSenderStatus(String((data as any).resend_sender_status || ""));
      setSenderMessage(String((data as any).resend_sender_message || ""));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (token) {
        const res = await fetch("/api/admin/resend-sender", {
          headers: { authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as any;
        if (res.ok && json?.ok) {
          setSenderEffective(String(json.effectiveFrom || "") || null);
          setSenderStatus(String(json.status || "") || null);
          setSenderMessage(String(json.message || "") || null);
        }
      }
    } finally {
      setSettingsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-10 lg:px-8 lg:py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="mt-1 text-sm text-white/60">
          Manage operations, notifications, and email integration.
        </p>
      </div>

      {settingsError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {settingsError}
        </div>
      ) : null}

      {settingsSaved ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {settingsSaved}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Admin Notifications</h2>
            <div className="space-y-4">
              <Input
                label="Admin notification email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
              />
              <p className="text-xs text-white/60">
                New lead notifications and alerts will be sent to this email address.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Resend Integration</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Resend API key"
                  value={resendKeyDraft}
                  onChange={(e) => setResendKeyDraft(e.target.value)}
                  placeholder={resendMasked ? resendMasked : "re_********"}
                  type="password"
                  autoComplete="off"
                />
                <div className="text-xs font-semibold text-white/60">
                  {resendMasked ? `Currently saved: ${resendMasked}` : "No Resend key saved yet."}
                </div>
                <Button
                  variant="secondary"
                  className="h-10"
                  disabled={settingsLoading || !resendKeyDraft.trim().length}
                  onClick={async () => {
                    setSettingsSaved(null);
                    setSettingsError(null);
                    setSettingsLoading(true);
                    try {
                      const { data: sessionData } = await supabase.auth.getSession();
                      const token = sessionData.session?.access_token || "";
                      if (!token) {
                        setSettingsError("You must be signed in as admin.");
                        return;
                      }

                      const res = await fetch("/api/admin/resend-key", {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                          authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ apiKey: resendKeyDraft.trim() }),
                      });
                      const json = (await res.json()) as { ok: boolean; message?: string; masked?: string };
                      if (!res.ok || !json.ok) {
                        setSettingsError(json.message || "Failed to update Resend key");
                        return;
                      }
                      setResendMasked(json.masked || resendMasked);
                      setResendKeyDraft("");
                      setSettingsSaved("Resend key updated successfully.");
                    } finally {
                      setSettingsLoading(false);
                    }
                  }}
                >
                  Update API Key
                </Button>
              </div>

              <div className="my-4 border-t border-white/10" />

              <div className="space-y-4">
                <div className="text-sm font-bold">Verified Sender Email</div>
                <Input
                  label="Sender email (must be a verified Resend domain)"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="notifications@yourdomain.com"
                />
                {(() => {
                  const v = validateSenderEmailBasic(senderEmail || senderEffective || "");
                  const status = String(senderStatus || "").toLowerCase();
                  if (!senderEmail.trim().length && !senderEffective) return null;
                  if (!v.ok) {
                    return (
                      <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {v.message}
                      </div>
                    );
                  }
                  if (status && status !== "verified") {
                    return (
                      <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {senderMessage || "Sender domain is not verified in Resend."}
                      </div>
                    );
                  }
                  if (status === "verified") {
                    return (
                      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        Verified sender: <span className="font-bold">{senderEffective || senderEmail}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
                <Button
                  variant="secondary"
                  className="h-10"
                  disabled={settingsLoading || !senderEmail.trim().length}
                  onClick={async () => {
                    setSettingsSaved(null);
                    setSettingsError(null);
                    setSettingsLoading(true);
                    try {
                      const { data: sessionData } = await supabase.auth.getSession();
                      const token = sessionData.session?.access_token || "";
                      if (!token) {
                        setSettingsError("You must be signed in as admin.");
                        return;
                      }
                      const res = await fetch("/api/admin/resend-sender", {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                          authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ senderEmail: senderEmail.trim() }),
                      });
                      const json = (await res.json()) as any;
                      if (!res.ok || !json?.ok) {
                        setSettingsError(json?.message || "Failed to update sender");
                        return;
                      }
                      setSenderEffective(String(json.senderEmail || "") || null);
                      setSenderStatus(String(json.status || "") || null);
                      setSenderMessage(String(json.message || "") || null);
                      setSettingsSaved("Sender saved and validated successfully.");
                    } finally {
                      setSettingsLoading(false);
                    }
                  }}
                >
                  Save & Validate Sender
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <h3 className="text-sm font-bold">Actions</h3>
            <p className="mt-1 mb-4 text-xs text-white/60">
              Save your admin notification email.
            </p>
            <Button
              className="h-11 w-full"
              disabled={settingsLoading}
              onClick={async () => {
                setSettingsSaved(null);
                setSettingsError(null);
                setSettingsLoading(true);
                try {
                  const next = adminEmail.trim();
                  if (!next || !next.includes("@")) {
                    setSettingsError("Enter a valid email");
                    return;
                  }
                  const { error } = await supabase
                    .from("settings")
                    .update({
                      admin_email: next,
                    })
                    .eq("id", 1);
                  if (error) {
                    setSettingsError(error.message);
                    return;
                  }
                  setSettingsSaved("Admin settings saved.");
                } catch (err) {
                  setSettingsError(err instanceof Error ? err.message : "Failed to save");
                } finally {
                  setSettingsLoading(false);
                }
              }}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
