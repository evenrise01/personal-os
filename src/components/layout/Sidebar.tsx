"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Hexagon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-zinc-800/50 bg-zinc-950 transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800/50 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20">
            <Hexagon className="h-4 w-4 text-emerald-400" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              PersonalOS
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title} className={cn(idx > 0 && "mt-6")}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                  {section.title}
                </p>
              )}
              {idx > 0 && collapsed && (
                <Separator className="mx-auto mb-3 w-8 bg-zinc-800" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-emerald-600/10 text-emerald-400"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-emerald-400" : "text-zinc-500",
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <li key={item.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.href}>{linkContent}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-zinc-800/50 p-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
