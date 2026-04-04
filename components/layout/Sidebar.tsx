"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

const menuItems = [
  { id: "overview", icon: "space_dashboard", label: "Overview", href: "/dashboard" },
  { id: "clients", icon: "groups", label: "Clients", href: "/dashboard/clients" },
  { id: "campaigns", icon: "campaign", label: "Campaigns", href: "/dashboard/campaigns" },
  { id: "copilot", icon: "auto_awesome", label: "Copilot", href: "/dashboard/copilot" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col p-4 bg-[#0B0F14] w-64 border-r border-white/5">
      <div className="mb-8 px-4 flex flex-col pt-2">
        <h1 className="text-xl font-bold tracking-tighter text-indigo-400 font-headline">MARKETA AI</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Intelligence Interface</p>
      </div>

      <nav className="flex flex-col gap-1 grow">
        {menuItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                active
                  ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5 px-2 space-y-2">
        <button
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          onClick={() => router.push("/dashboard")}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          Campaign Hub
        </button>
        <button
          className="w-full py-3 px-4 rounded-xl bg-white/5 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          onClick={() => {
            clearAuth();
            router.push("/login");
          }}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
