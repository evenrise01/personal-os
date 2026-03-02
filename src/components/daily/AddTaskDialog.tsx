"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";

interface AddTaskDialogProps {
  scheduledDate: string; // YYYY-MM-DD
}

export function AddTaskDialog({ scheduledDate }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("PERSONAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [estimatedMins, setEstimatedMins] = useState("");
  const [isDeepWork, setIsDeepWork] = useState(false);

  const utils = api.useUtils();

  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      void utils.task.list.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("PERSONAL");
    setPriority("MEDIUM");
    setEstimatedMins("");
    setIsDeepWork(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category as any,
      priority: priority as any,
      estimatedMins: estimatedMins ? parseInt(estimatedMins) : undefined,
      isDeepWork,
      scheduledDate: new Date(scheduledDate + "T00:00:00.000Z").toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-400">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-400">
              Description <span className="text-zinc-600">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              rows={2}
            />
          </div>

          {/* Category + Priority Row */}
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
              <Label className="text-zinc-400">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated time + Deep work */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estimatedMins" className="text-zinc-400">
                Est. Minutes
              </Label>
              <Input
                id="estimatedMins"
                type="number"
                value={estimatedMins}
                onChange={(e) => setEstimatedMins(e.target.value)}
                placeholder="30"
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDeepWork}
                  onChange={(e) => setIsDeepWork(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-sm text-zinc-300">Deep Work</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createTask.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
