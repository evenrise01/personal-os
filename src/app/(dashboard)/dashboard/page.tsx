"use client";

import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileEdit,
  TrendingUp,
  Zap,
  Calendar,
  Target,
  Activity,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  REVENUE: "text-amber-400 bg-amber-400/10",
  HEALTH: "text-rose-400 bg-rose-400/10",
  GROWTH: "text-violet-400 bg-violet-400/10",
  SOCIAL: "text-blue-400 bg-blue-400/10",
  ADMIN: "text-zinc-400 bg-zinc-400/10",
  PERSONAL: "text-emerald-400 bg-emerald-400/10",
};

const PRIORITY_DOTS: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-zinc-600",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { isLoading: userLoading } = useSyncUser();
  const { data, isLoading } = api.dashboard.getOverview.useQuery(undefined, {
    enabled: !userLoading,
  });

  if (userLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-500">Unable to load dashboard data.</p>
      </div>
    );
  }

  const completionPct =
    data.tasksToday > 0
      ? Math.round((data.tasksCompleted / data.tasksToday) * 100)
      : 0;

  const now = new Date();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Command Center
          </h1>
          <Badge
            variant="outline"
            className="border-emerald-600/20 bg-emerald-600/10 text-emerald-400"
          >
            <Zap className="mr-1 h-3 w-3" />
            Active
          </Badge>
        </div>
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(now)}
          {data.user?.name && (
            <span className="ml-2">
              · Welcome back,{" "}
              <span className="text-zinc-300">
                {data.user.name.split(" ")[0]}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Performance Score */}
      <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-600/20 bg-emerald-600/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {data.performanceScore !== null
                  ? Math.round(data.performanceScore)
                  : "--"}
              </p>
              <p className="text-[10px] tracking-wider text-emerald-400/60 uppercase">
                Score
              </p>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-zinc-100">
              Performance Score
            </h2>
            <p className="text-sm text-zinc-500">
              {data.performanceScore !== null
                ? `Based on your daily execution metrics. ${completionPct}% tasks completed today.`
                : "Complete your first daily log to initialize your performance metrics."}
            </p>
            {data.tasksToday > 0 && (
              <Progress
                value={completionPct}
                className="mt-3 h-1.5 bg-zinc-800"
              />
            )}
          </div>
          <div className="hidden items-center gap-1 text-sm text-zinc-500 md:flex">
            <TrendingUp className="h-4 w-4" />
            <span>
              {data.morningEnergy
                ? `Energy: ${data.morningEnergy.replace("_", " ")}`
                : "No energy logged"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-zinc-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Tasks Today
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {data.tasksCompleted}
              <span className="text-base font-normal text-zinc-500">
                /{data.tasksToday}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {completionPct}% completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-zinc-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Deep Work
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {data.deepWorkMins}
              <span className="text-base font-normal text-zinc-500">m</span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">focus time today</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-zinc-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Revenue (Week)
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10">
                <DollarSign className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              ${(data.weekRevenueCents / 100).toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {data.weekInvoiceCount} invoice
              {data.weekInvoiceCount !== 1 ? "s" : ""} paid
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-zinc-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Content
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10">
                <FileEdit className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {data.weekContentPublished}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">published this week</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-zinc-800/50" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Agenda — 2 columns */}
        <div className="lg:col-span-2">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-zinc-300">
                Today&apos;s Agenda
              </CardTitle>
              <Link href="/daily">
                <Badge
                  variant="outline"
                  className="cursor-pointer border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  View All
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          {data.todayAgenda.length > 0 ? (
            <div className="space-y-2">
              {data.todayAgenda.map((task) => (
                <Card
                  key={task.id}
                  className="border-zinc-800/50 bg-zinc-900/30"
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <div
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        PRIORITY_DOTS[task.priority] ?? "bg-zinc-600",
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        task.status === "DONE"
                          ? "text-zinc-500 line-through"
                          : "text-zinc-200",
                      )}
                    >
                      {task.title}
                    </span>
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
                    {task.status === "DONE" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-zinc-800/50 bg-zinc-900/30">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                  <Calendar className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400">
                  No tasks scheduled for today
                </h3>
                <p className="mt-1 text-xs text-zinc-600">
                  Go to Daily Planning to build your agenda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side panel — Goals, Habits, Upcoming */}
        <div className="space-y-4">
          {/* Active Goals */}
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    Active Goals
                  </span>
                </div>
                <Link href="/goals">
                  <span className="text-xs text-zinc-600 hover:text-zinc-400">
                    View →
                  </span>
                </Link>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-100">
                {data.activeGoals}
              </p>
            </CardContent>
          </Card>

          {/* Active Habits */}
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    Active Habits
                  </span>
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-100">
                {data.activeHabits}
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          {data.upcomingTasks.length > 0 && (
            <Card className="border-zinc-800/50 bg-zinc-900/30">
              <CardContent className="p-4">
                <p className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Coming Up
                </p>
                <div className="space-y-2">
                  {data.upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          PRIORITY_DOTS[task.priority] ?? "bg-zinc-600",
                        )}
                      />
                      <span className="flex-1 truncate text-zinc-300">
                        {task.title}
                      </span>
                      <span className="shrink-0 text-zinc-600">
                        {task.scheduledDate
                          ? new Date(task.scheduledDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            title: "Start Daily Plan",
            description: "Plan your tasks and deep work blocks",
            icon: Calendar,
            href: "/daily",
          },
          {
            title: "Log Fitness",
            description: "Record today's workout",
            icon: TrendingUp,
            href: "/fitness",
          },
          {
            title: "New Content Idea",
            description: "Capture a content idea",
            icon: FileEdit,
            href: "/knowledge",
          },
        ].map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="cursor-pointer border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700/50 hover:bg-zinc-900/60">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                  <action.icon className="h-5 w-5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {action.title}
                  </p>
                  <p className="text-xs text-zinc-500">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
