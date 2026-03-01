import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Performance Analytics
        </h1>
        <p className="text-sm text-zinc-500">
          Measure what matters. Optimize execution.
        </p>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/30">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
          <BarChart3 className="mb-4 h-12 w-12 text-zinc-700" />
          <h3 className="text-sm font-medium text-zinc-400">
            Analytics engine coming soon
          </h3>
          <p className="mt-1 text-xs text-zinc-600">
            Output per day, revenue per week, fitness consistency, skill hours,
            and your unified Performance Score.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
