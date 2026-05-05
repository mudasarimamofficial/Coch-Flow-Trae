"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Braces,
  Building2,
  Code2,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Paintbrush,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Builder", href: "/admin/builder", icon: Paintbrush },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
];

const systemItems = [
  { name: "Theme", href: "/admin/theme", icon: Paintbrush },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const advancedItems = [
  { name: "JSON Config", href: "/admin/advanced/json", icon: Braces },
  { name: "Custom Code", href: "/admin/advanced/code", icon: Code2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-full shrink-0 flex-col border-b border-surface-800 bg-surface-950 md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-surface-800 px-4 md:px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-500">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-surface-50 tracking-tight">CoachFlow AI</span>
      </div>

      <div className="flex gap-3 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:gap-8 md:overflow-y-auto md:px-0 md:py-6 md:scrollbar-hide">
        <div className="shrink-0 md:px-4">
          <h4 className="mb-2 hidden px-2 text-xs font-semibold uppercase tracking-wider text-surface-500 md:block">Navigation</h4>
          <nav className="flex gap-1 md:flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors md:gap-3",
                    isActive
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-surface-400 hover:bg-surface-900 hover:text-surface-50",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 md:px-4">
          <h4 className="mb-2 hidden px-2 text-xs font-semibold uppercase tracking-wider text-surface-500 md:block">System</h4>
          <nav className="flex gap-1 md:flex-col">
            {systemItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors md:gap-3",
                    isActive
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-surface-400 hover:bg-surface-900 hover:text-surface-50",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 md:mt-auto md:px-4">
          <h4 className="mb-2 hidden px-2 text-xs font-semibold uppercase tracking-wider text-surface-500 md:block">Advanced</h4>
          <nav className="flex gap-1 md:flex-col">
            {advancedItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors md:gap-3",
                    isActive
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-surface-400 hover:bg-surface-900 hover:text-surface-50",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
