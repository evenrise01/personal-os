"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trophy, AlertTriangle, Heart } from "lucide-react";

interface ReflectionFormProps {
  topWin: string | null;
  topChallenge: string | null;
  reflection: string | null;
  gratitude: string | null;
  onSave: (data: {
    topWin: string | null;
    topChallenge: string | null;
    reflection: string | null;
    gratitude: string | null;
  }) => void;
  isSaving: boolean;
}

export function ReflectionForm({
  topWin,
  topChallenge,
  reflection,
  gratitude,
  onSave,
  isSaving,
}: ReflectionFormProps) {
  const [win, setWin] = useState(topWin ?? "");
  const [challenge, setChallenge] = useState(topChallenge ?? "");
  const [reflect, setReflect] = useState(reflection ?? "");
  const [grat, setGrat] = useState(gratitude ?? "");

  useEffect(() => {
    setWin(topWin ?? "");
    setChallenge(topChallenge ?? "");
    setReflect(reflection ?? "");
    setGrat(gratitude ?? "");
  }, [topWin, topChallenge, reflection, gratitude]);

  function handleSave() {
    onSave({
      topWin: win.trim() || null,
      topChallenge: challenge.trim() || null,
      reflection: reflect.trim() || null,
      gratitude: grat.trim() || null,
    });
  }

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-zinc-300">
          End-of-Day Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-zinc-400">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              Top Win
            </Label>
            <Textarea
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="What went well today?"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-zinc-400">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
              Top Challenge
            </Label>
            <Textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="What was hardest?"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">Reflection Notes</Label>
          <Textarea
            value={reflect}
            onChange={(e) => setReflect(e.target.value)}
            placeholder="What did you learn? What would you do differently?"
            className="border-zinc-800 bg-zinc-900 text-zinc-100"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-zinc-400">
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            Gratitude
          </Label>
          <Textarea
            value={grat}
            onChange={(e) => setGrat(e.target.value)}
            placeholder="What are you grateful for today?"
            className="border-zinc-800 bg-zinc-900 text-zinc-100"
            rows={2}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Reflection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
