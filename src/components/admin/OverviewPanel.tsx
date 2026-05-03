import { LayoutDashboard, Files, Users, PaintBucket, ImageIcon, Settings } from "lucide-react";
import type { Tab } from "./types";

type Props = {
  onTabChange: (tab: Tab) => void;
};

export function OverviewPanel({ onTabChange }: Props) {
  const cards: { tab: Tab; title: string; desc: string; icon: any }[] = [
    {
      tab: "builder",
      title: "Homepage Builder",
      desc: "Edit your main landing page layout and content.",
      icon: LayoutDashboard,
    },
    {
      tab: "pages",
      title: "Pages",
      desc: "Manage your CMS pages and navigation.",
      icon: Files,
    },
    {
      tab: "leads",
      title: "Leads",
      desc: "View and manage incoming applications.",
      icon: Users,
    },
    {
      tab: "media",
      title: "Media Manager",
      desc: "Upload and manage images and assets.",
      icon: ImageIcon,
    },
    {
      tab: "theme",
      title: "Theme Studio",
      desc: "Manage brand colors, fonts, and global settings.",
      icon: PaintBucket,
    },
    {
      tab: "settings",
      title: "Settings",
      desc: "Configure admin emails and system operations.",
      icon: Settings,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Welcome to your CoachFlow AI operating system. Select an area below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.tab}
            type="button"
            onClick={() => onTabChange(c.tab)}
            className="group flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#0fa3a3]/50 hover:shadow-md dark:border-white/10 dark:bg-[#112121] dark:hover:bg-[#112121]/80"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-[#0fa3a3]/10 group-hover:text-[#0fa3a3] dark:bg-white/5 dark:text-slate-300 dark:group-hover:bg-[#0fa3a3]/20 dark:group-hover:text-[#0fa3a3]">
              <c.icon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
