"use client";

import { cn } from "@/lib/utils";
import { ENERGY_LABELS } from "@/lib/constants";
import { Zap } from "lucide-react";

const ENERGY_LEVELS = [
  {
    value: "VERY_LOW",
    label: "Very Low",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
  {
    value: "LOW",
    label: "Low",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  {
    value: "HIGH",
    label: "High",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    value: "VERY_HIGH",
    label: "Peak",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
] as const;

interface EnergySelectorProps {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
}

export function EnergySelector({
  label,
  value,
  onChange,
}: EnergySelectorProps) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-zinc-500 uppercase">
        <Zap className="h-3 w-3" />
        {label}
      </p>
      <div className="flex gap-1.5">
        {ENERGY_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
              value === level.value
                ? level.color
                : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
