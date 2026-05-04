import type { ReactNode } from "react";
import { Code2, FileJson, Files, Home, Image as ImageIcon, LayoutDashboard, PaintBucket, Settings, Users } from "lucide-react";
import type { Tab } from "@/components/admin/types";

export type AdminNavItem = {
  tab: Tab;
  label: string;
  icon: ReactNode;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { tab: "overview", label: "Overview", icon: <Home size={18} /> },
  { tab: "builder", label: "Homepage", icon: <LayoutDashboard size={18} /> },
  { tab: "pages", label: "Pages", icon: <Files size={18} /> },
  { tab: "leads", label: "Leads", icon: <Users size={18} /> },
  { tab: "media", label: "Media", icon: <ImageIcon size={18} /> },
  { tab: "theme", label: "Theme", icon: <PaintBucket size={18} /> },
  { tab: "settings", label: "Settings", icon: <Settings size={18} /> },
  { tab: "json", label: "JSON", icon: <FileJson size={18} /> },
  { tab: "custom", label: "Custom Code", icon: <Code2 size={18} /> },
];

export function getAdminTabLabel(tab: Tab) {
  return ADMIN_NAV_ITEMS.find((x) => x.tab === tab)?.label || "Admin";
}

