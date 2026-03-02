import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Users,
  FolderKanban,
  FileText,
  Settings,
  Zap,
  Brain,
  Target,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "LifeOS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Daily", href: "/daily", icon: CalendarDays },
      { label: "Goals", href: "/goals", icon: Target },
      { label: "Fitness", href: "/fitness", icon: Dumbbell },
      { label: "Content", href: "/knowledge", icon: Brain },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "ClientOS",
    items: [
      { label: "Clients", href: "/clients", icon: Users },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Invoices", href: "/invoices", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { label: "AI Assistant", href: "/ai", icon: Zap },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  REVENUE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  HEALTH: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  GROWTH: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  SOCIAL: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  ADMIN: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  PERSONAL: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: "text-zinc-400 bg-zinc-400/10",
  IN_PROGRESS: "text-blue-400 bg-blue-400/10",
  DONE: "text-emerald-400 bg-emerald-400/10",
  CANCELLED: "text-red-400 bg-red-400/10",
};

export const ENERGY_LABELS: Record<string, string> = {
  VERY_LOW: "⚡ Very Low",
  LOW: "⚡⚡ Low",
  MEDIUM: "⚡⚡⚡ Medium",
  HIGH: "⚡⚡⚡⚡ High",
  VERY_HIGH: "⚡⚡⚡⚡⚡ Very High",
};
