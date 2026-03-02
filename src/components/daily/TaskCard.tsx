"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Trash2,
  GripVertical,
} from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    isDeepWork: boolean;
    estimatedMins: number | null;
    completedAt: Date | null;
  };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_INDICATORS: Record<string, string> = {
  URGENT: "border-l-red-500",
  HIGH: "border-l-amber-500",
  MEDIUM: "border-l-blue-500",
  LOW: "border-l-zinc-600",
};

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const isDone = task.status === "DONE";

  return (
    <Card
      className={cn(
        "group border-l-2 border-zinc-800/50 bg-zinc-900/50 transition-all hover:border-zinc-700/50 hover:bg-zinc-900/80",
        PRIORITY_INDICATORS[task.priority] ?? "border-l-zinc-600",
        isDone && "opacity-60",
      )}
    >
      <CardContent className="flex items-center gap-3 p-3">
        {/* Drag handle */}
        <GripVertical className="h-4 w-4 shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Status toggle */}
        <button
          onClick={() => onComplete(task.id)}
          className="shrink-0 transition-colors"
          disabled={isDone}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-zinc-600 hover:text-emerald-400" />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              isDone ? "text-zinc-500 line-through" : "text-zinc-200",
            )}
          >
            {task.title}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "h-5 px-1.5 text-[10px]",
                CATEGORY_COLORS[task.category] ??
                  "bg-zinc-400/10 text-zinc-400",
              )}
            >
              {task.category}
            </Badge>
            {task.isDeepWork && (
              <span className="flex items-center gap-0.5 text-[10px] text-blue-400">
                <Flame className="h-3 w-3" />
                Deep
              </span>
            )}
            {task.estimatedMins && (
              <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                <Clock className="h-3 w-3" />
                {task.estimatedMins}m
              </span>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}
