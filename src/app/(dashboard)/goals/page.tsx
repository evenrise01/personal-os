"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_BADGES: Record<
  string,
  { label: string; icon: typeof Target; className: string }
> = {
  ACTIVE: {
    label: "Active",
    icon: Target,
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  PAUSED: {
    label: "Paused",
    icon: PauseCircle,
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  ABANDONED: {
    label: "Abandoned",
    icon: XCircle,
    className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  REVENUE: "text-amber-400 bg-amber-400/10",
  HEALTH: "text-rose-400 bg-rose-400/10",
  GROWTH: "text-violet-400 bg-violet-400/10",
  SOCIAL: "text-blue-400 bg-blue-400/10",
  ADMIN: "text-zinc-400 bg-zinc-400/10",
  PERSONAL: "text-emerald-400 bg-emerald-400/10",
};

function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GROWTH");
  const [timeframe, setTimeframe] = useState("QUARTERLY");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");

  const utils = api.useUtils();
  const createGoal = api.goal.create.useMutation({
    onSuccess: () => {
      void utils.goal.list.invalidate();
      setOpen(false);
      setTitle("");
      setDescription("");
      setCategory("GROWTH");
      setTimeframe("QUARTERLY");
      setTargetValue("");
      setUnit("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Set New Goal</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createGoal.mutate({
              title: title.trim(),
              description: description.trim() || undefined,
              category: category as any,
              timeframe: timeframe as any,
              targetValue: targetValue ? parseFloat(targetValue) : undefined,
              unit: unit.trim() || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label className="text-zinc-400">Goal Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this matters, success criteria..."
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-400">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="REVENUE">Revenue</SelectItem>
                  <SelectItem value="HEALTH">Health</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="LIFETIME">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-400">Target Value</Label>
              <Input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="100"
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Unit</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="hours, reps, posts..."
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createGoal.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createGoal.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GoalsPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const { data: goals, isLoading } = api.goal.list.useQuery(
    {
      status: statusFilter as any,
      category: categoryFilter as any,
    },
    { enabled: !userLoading },
  );

  const utils = api.useUtils();
  const updateGoal = api.goal.update.useMutation({
    onSuccess: () => void utils.goal.list.invalidate(),
  });
  const deleteGoal = api.goal.delete.useMutation({
    onSuccess: () => void utils.goal.list.invalidate(),
  });

  if (userLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Goals & Identity
          </h1>
          <p className="text-sm text-zinc-500">
            Set direction. Track compounding growth. {goals?.length ?? 0} goals
          </p>
        </div>
        <AddGoalDialog />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36 border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ABANDONED">Abandoned</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter ?? "all"}
          onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36 border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="REVENUE">Revenue</SelectItem>
            <SelectItem value="HEALTH">Health</SelectItem>
            <SelectItem value="GROWTH">Growth</SelectItem>
            <SelectItem value="SOCIAL">Social</SelectItem>
            <SelectItem value="PERSONAL">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals */}
      {goals && goals.length > 0 ? (
        <div className="grid gap-3">
          {goals.map((goal) => {
            const statusBadge =
              STATUS_BADGES[goal.status] ?? STATUS_BADGES.ACTIVE!;
            const progress =
              goal.targetValue && goal.currentValue
                ? Math.min(
                    Math.round((goal.currentValue / goal.targetValue) * 100),
                    100,
                  )
                : null;

            return (
              <Card
                key={goal.id}
                className="group border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-200">
                          {goal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 px-1.5 text-[10px]",
                            statusBadge.className,
                          )}
                        >
                          {statusBadge.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 px-1.5 text-[10px]",
                            CATEGORY_COLORS[goal.category] ??
                              "bg-zinc-400/10 text-zinc-400",
                          )}
                        >
                          {goal.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px] text-zinc-500"
                        >
                          {goal.timeframe}
                        </Badge>
                      </div>

                      {goal.description && (
                        <p className="line-clamp-1 text-xs text-zinc-500">
                          {goal.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      {progress !== null && (
                        <div className="flex items-center gap-3">
                          <Progress
                            value={progress}
                            className="h-1.5 flex-1 bg-zinc-800"
                          />
                          <span className="text-xs font-medium text-zinc-400">
                            {goal.currentValue}/{goal.targetValue}
                            {goal.unit ? ` ${goal.unit}` : ""}
                            <span className="ml-1 text-zinc-600">
                              ({progress}%)
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Linked counts */}
                      <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                        <span>{goal._count.tasks} tasks</span>
                        <span>{goal._count.habits} habits</span>
                        {goal.targetDate && (
                          <span>
                            Target:{" "}
                            {new Date(goal.targetDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {goal.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-zinc-500 hover:text-emerald-400"
                          onClick={() =>
                            updateGoal.mutate({
                              id: goal.id,
                              status: "COMPLETED",
                            })
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-zinc-500 hover:text-red-400"
                        onClick={() => deleteGoal.mutate({ id: goal.id })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <Target className="mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="text-sm font-medium text-zinc-400">No goals yet</h3>
            <p className="mt-1 text-xs text-zinc-600">
              Define your first goal to start tracking compounding growth.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
