"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskCard } from "@/components/daily/TaskCard";
import { AddTaskDialog } from "@/components/daily/AddTaskDialog";
import { EnergySelector } from "@/components/daily/EnergySelector";
import { ReflectionForm } from "@/components/daily/ReflectionForm";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Flame,
  Target,
  Loader2,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function formatDisplay(date: Date): string {
  const today = new Date();
  const todayStr = formatDate(today);
  const dateStr = formatDate(date);

  if (dateStr === todayStr) return "Today";

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatDate(yesterday)) return "Yesterday";

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === formatDate(tomorrow)) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function DailyPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = formatDate(currentDate);

  // Queries
  const { data: tasksData, isLoading: tasksLoading } = api.task.list.useQuery(
    {
      scheduledDate: new Date(dateStr + "T00:00:00.000Z").toISOString(),
    },
    { enabled: !userLoading },
  );

  const { data: dailyLog, isLoading: logLoading } =
    api.dailyLog.getByDate.useQuery(
      { date: dateStr },
      { enabled: !userLoading },
    );

  const utils = api.useUtils();

  // Mutations
  const completeMutation = api.task.complete.useMutation({
    onSuccess: () => void utils.task.list.invalidate(),
  });

  const deleteMutation = api.task.delete.useMutation({
    onSuccess: () => void utils.task.list.invalidate(),
  });

  const updateLog = api.dailyLog.update.useMutation({
    onSuccess: () => void utils.dailyLog.getByDate.invalidate(),
  });

  // Navigation
  function goDay(offset: number) {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset);
    setCurrentDate(next);
  }

  // Derived data
  const tasks = tasksData?.tasks ?? [];
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const deepWorkMins = tasks
    .filter((t) => t.isDeepWork && t.status === "DONE")
    .reduce((sum, t) => sum + (t.estimatedMins ?? 0), 0);
  const totalEstimated = tasks.reduce(
    (sum, t) => sum + (t.estimatedMins ?? 0),
    0,
  );

  const isLoading = userLoading || tasksLoading || logLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goDay(-1)}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goDay(1)}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
              <CalendarDays className="h-6 w-6 text-emerald-400" />
              {formatDisplay(currentDate)}
            </h1>
            <p className="text-xs text-zinc-500">
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <AddTaskDialog scheduledDate={dateStr} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-3">
            <Target className="h-5 w-5 text-zinc-600" />
            <div>
              <p className="text-xs text-zinc-500">Tasks</p>
              <p className="text-lg font-bold text-zinc-100">
                {doneTasks.length}
                <span className="text-sm font-normal text-zinc-500">
                  /{tasks.length}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-3">
            <Flame className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-zinc-500">Deep Work</p>
              <p className="text-lg font-bold text-zinc-100">
                {deepWorkMins}
                <span className="text-sm font-normal text-zinc-500">m</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-3">
            <Clock className="h-5 w-5 text-zinc-600" />
            <div>
              <p className="text-xs text-zinc-500">Est. Total</p>
              <p className="text-lg font-bold text-zinc-100">
                {totalEstimated}
                <span className="text-sm font-normal text-zinc-500">m</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/20 text-xs font-bold text-emerald-400">
              {tasks.length > 0
                ? Math.round((doneTasks.length / tasks.length) * 100)
                : 0}
            </div>
            <div>
              <p className="text-xs text-zinc-500">Completion</p>
              <p className="text-lg font-bold text-zinc-100">
                {tasks.length > 0
                  ? Math.round((doneTasks.length / tasks.length) * 100)
                  : 0}
                <span className="text-sm font-normal text-zinc-500">%</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Tracking */}
      <Card className="border-zinc-800/50 bg-zinc-900/30">
        <CardContent className="flex gap-8 p-4">
          <EnergySelector
            label="Morning Energy"
            value={dailyLog?.morningEnergy}
            onChange={(val) =>
              updateLog.mutate({ date: dateStr, morningEnergy: val as any })
            }
          />
          <Separator orientation="vertical" className="h-auto bg-zinc-800" />
          <EnergySelector
            label="Evening Energy"
            value={dailyLog?.eveningEnergy}
            onChange={(val) =>
              updateLog.mutate({ date: dateStr, eveningEnergy: val as any })
            }
          />
        </CardContent>
      </Card>

      {/* Task Board */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* TODO */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              To Do
            </h3>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] text-zinc-500"
            >
              {todoTasks.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={(id) => completeMutation.mutate({ id })}
                onDelete={(id) => deleteMutation.mutate({ id })}
              />
            ))}
            {todoTasks.length === 0 && (
              <p className="py-4 text-center text-xs text-zinc-600">
                No tasks to do
              </p>
            )}
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              In Progress
            </h3>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] text-amber-400"
            >
              {inProgressTasks.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={(id) => completeMutation.mutate({ id })}
                onDelete={(id) => deleteMutation.mutate({ id })}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="py-4 text-center text-xs text-zinc-600">
                Nothing in progress
              </p>
            )}
          </div>
        </div>

        {/* DONE */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Done
            </h3>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] text-emerald-400"
            >
              {doneTasks.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={(id) => completeMutation.mutate({ id })}
                onDelete={(id) => deleteMutation.mutate({ id })}
              />
            ))}
            {doneTasks.length === 0 && (
              <p className="py-4 text-center text-xs text-zinc-600">
                Nothing completed yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reflection */}
      <ReflectionForm
        topWin={dailyLog?.topWin ?? null}
        topChallenge={dailyLog?.topChallenge ?? null}
        reflection={dailyLog?.reflection ?? null}
        gratitude={dailyLog?.gratitude ?? null}
        onSave={(data) => updateLog.mutate({ date: dateStr, ...data })}
        isSaving={updateLog.isPending}
      />
    </div>
  );
}
