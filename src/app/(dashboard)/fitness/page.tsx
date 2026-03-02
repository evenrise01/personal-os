"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnergySelector } from "@/components/daily/EnergySelector";
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  Loader2,
  Flame,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  unit?: "kg" | "lbs";
}

const WORKOUT_TYPES = [
  "Push",
  "Pull",
  "Legs",
  "Upper",
  "Lower",
  "Full Body",
  "Cardio",
  "HIIT",
  "Yoga",
  "Stretching",
  "Other",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

export default function FitnessPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [energyBefore, setEnergyBefore] = useState<string | undefined>();
  const [energyAfter, setEnergyAfter] = useState<string | undefined>();
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: undefined, reps: undefined, weight: undefined },
  ]);

  const { data: weeklyStats, isLoading: statsLoading } =
    api.fitness.getWeeklyStats.useQuery(undefined, { enabled: !userLoading });

  const { data: existingLog } = api.fitness.getByDate.useQuery(
    { date: selectedDate },
    { enabled: !userLoading },
  );

  const utils = api.useUtils();
  const logWorkout = api.fitness.logWorkout.useMutation({
    onSuccess: () => {
      void utils.fitness.getWeeklyStats.invalidate();
      void utils.fitness.getByDate.invalidate();
    },
  });

  function addExercise() {
    setExercises((prev) => [
      ...prev,
      { name: "", sets: undefined, reps: undefined, weight: undefined },
    ]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExercise(index: number, field: keyof Exercise, value: any) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  }

  function handleSave() {
    const validExercises = exercises.filter((e) => e.name.trim());
    logWorkout.mutate({
      date: selectedDate,
      workoutType: workoutType || undefined,
      durationMins: duration ? parseInt(duration) : undefined,
      exercises: validExercises.length > 0 ? validExercises : undefined,
      notes: notes.trim() || undefined,
      energyBefore: energyBefore as any,
      energyAfter: energyAfter as any,
    });
  }

  if (userLoading || statsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  // Weekly calendar
  const today = new Date();
  const weekStart = new Date(today);
  const dayOfWeek = weekStart.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setDate(weekStart.getDate() - diff);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return formatDate(d);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Fitness Tracker
        </h1>
        <p className="text-sm text-zinc-500">
          Log workouts, track consistency, compound gains.
        </p>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Dumbbell className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-zinc-500">Sessions</p>
              <p className="text-xl font-bold text-zinc-100">
                {weeklyStats?.totalSessions ?? 0}
                <span className="text-sm font-normal text-zinc-500">/wk</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-zinc-500">Duration</p>
              <p className="text-xl font-bold text-zinc-100">
                {weeklyStats?.totalDuration ?? 0}
                <span className="text-sm font-normal text-zinc-500">m</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-zinc-500">Top Type</p>
              <p className="text-xl font-bold text-zinc-100">
                {weeklyStats?.typeBreakdown
                  ? (Object.entries(weeklyStats.typeBreakdown).sort(
                      (a, b) => b[1] - a[1],
                    )[0]?.[0] ?? "—")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Calendar */}
      <Card className="border-zinc-800/50 bg-zinc-900/30">
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            This Week
          </p>
          <div className="flex gap-2">
            {weekDays.map((day, i) => {
              const hasWorkout = weeklyStats?.workoutDays?.includes(day);
              const isToday = day === formatDate(today);
              const isSelected = day === selectedDate;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition-all",
                    isSelected
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700",
                    isToday && !isSelected && "border-zinc-600",
                  )}
                >
                  <span className="text-[10px] text-zinc-500">
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-emerald-400" : "text-zinc-300",
                    )}
                  >
                    {new Date(day + "T00:00:00").getDate()}
                  </span>
                  {hasWorkout && (
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Log Workout */}
      <Card className="border-zinc-800/50 bg-zinc-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Calendar className="h-4 w-4 text-zinc-500" />
            Log Workout —{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {existingLog && (
              <Badge
                variant="outline"
                className="ml-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              >
                Logged
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-400">Workout Type</Label>
              <Select value={workoutType} onValueChange={setWorkoutType}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  {WORKOUT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Duration (min)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </div>

          {/* Energy */}
          <div className="flex gap-6">
            <EnergySelector
              label="Energy Before"
              value={energyBefore}
              onChange={setEnergyBefore}
            />
            <EnergySelector
              label="Energy After"
              value={energyAfter}
              onChange={setEnergyAfter}
            />
          </div>

          {/* Exercises */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400">Exercises</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addExercise}
                className="h-7 gap-1 text-xs text-zinc-500 hover:text-zinc-200"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            {exercises.map((ex, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_60px_60px_80px_auto] items-center gap-2"
              >
                <Input
                  placeholder="Exercise name"
                  value={ex.name}
                  onChange={(e) => updateExercise(i, "name", e.target.value)}
                  className="h-9 border-zinc-800 bg-zinc-900 text-sm text-zinc-100"
                />
                <Input
                  type="number"
                  placeholder="Sets"
                  value={ex.sets ?? ""}
                  onChange={(e) =>
                    updateExercise(
                      i,
                      "sets",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  className="h-9 border-zinc-800 bg-zinc-900 text-sm text-zinc-100"
                />
                <Input
                  type="number"
                  placeholder="Reps"
                  value={ex.reps ?? ""}
                  onChange={(e) =>
                    updateExercise(
                      i,
                      "reps",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  className="h-9 border-zinc-800 bg-zinc-900 text-sm text-zinc-100"
                />
                <Input
                  type="number"
                  placeholder="Weight"
                  value={ex.weight ?? ""}
                  onChange={(e) =>
                    updateExercise(
                      i,
                      "weight",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  className="h-9 border-zinc-800 bg-zinc-900 text-sm text-zinc-100"
                />
                <button
                  onClick={() => removeExercise(i)}
                  className="text-zinc-700 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-zinc-400">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session feel? Any PRs?"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              rows={2}
            />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={logWorkout.isPending}
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <Save className="h-4 w-4" />
              {logWorkout.isPending ? "Saving..." : "Log Workout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
