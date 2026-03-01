import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AIPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          AI Assistant
        </h1>
        <p className="text-sm text-zinc-500">
          Your performance strategist. Data-driven insights.
        </p>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/30">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
          <Zap className="mb-4 h-12 w-12 text-zinc-700" />
          <h3 className="text-sm font-medium text-zinc-400">
            AI agent layer coming soon
          </h3>
          <p className="mt-1 text-xs text-zinc-600">
            Daily planner assistant, weekly review, performance analysis, and
            client insights — all powered by structured AI with memory.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
