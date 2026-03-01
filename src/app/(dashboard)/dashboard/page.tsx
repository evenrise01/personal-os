import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileEdit,
  TrendingUp,
  Zap,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STATS = [
  {
    label: "Tasks Today",
    value: "0",
    subtext: "0 completed",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    label: "Deep Work",
    value: "0h",
    subtext: "0 min logged",
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    label: "Revenue (Week)",
    value: "$0",
    subtext: "0 invoices",
    icon: DollarSign,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    label: "Content Published",
    value: "0",
    subtext: "this week",
    icon: FileEdit,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
  },
];

export default function DashboardPage() {
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
        </p>
      </div>

      {/* Performance Score */}
      <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-600/20 bg-emerald-600/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">--</p>
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
              Complete your first daily log to initialize your performance
              metrics. Track tasks, deep work, revenue, and habits to build your
              score.
            </p>
          </div>
          <div className="hidden items-center gap-1 text-sm text-zinc-500 md:flex">
            <TrendingUp className="h-4 w-4" />
            <span>No data yet</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card
            key={stat.label}
            className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-zinc-700/50"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                  {stat.label}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-100">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="bg-zinc-800/50" />

      {/* Today's Agenda */}
      <div>
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base font-semibold text-zinc-300">
            Today&apos;s Agenda
          </CardTitle>
        </CardHeader>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
              <Calendar className="h-6 w-6 text-zinc-600" />
            </div>
            <h3 className="text-sm font-medium text-zinc-400">
              No tasks scheduled for today
            </h3>
            <p className="mt-1 text-xs text-zinc-600">
              Start your daily planning to populate your agenda.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            title: "Start Daily Plan",
            description: "Plan your tasks and deep work blocks",
            icon: Calendar,
          },
          {
            title: "Log Fitness",
            description: "Record today's workout",
            icon: TrendingUp,
          },
          {
            title: "New Content Idea",
            description: "Capture a content idea",
            icon: FileEdit,
          },
        ].map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700/50 hover:bg-zinc-900/60"
          >
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
        ))}
      </div>
    </div>
  );
}
