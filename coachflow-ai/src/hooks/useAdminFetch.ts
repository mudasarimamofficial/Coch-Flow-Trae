"use client";

import { useCallback } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browserClient";

export function useAdminFetch() {
  return useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers = new Headers(init?.headers || undefined);
    if (token) headers.set("authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }, []);
}

