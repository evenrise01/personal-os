"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, FolderKanban, Loader2 } from "lucide-react";

const STATUS_BADGES: Record<string, string> = {
  LEAD: "bg-zinc-500/10 text-zinc-400 border-zinc-600/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [budget, setBudget] = useState("");

  const utils = api.useUtils();
  const { data: clients } = api.crmClient.list.useQuery();

  const createProject = api.crmProject.create.useMutation({
    onSuccess: () => {
      void utils.crmProject.list.invalidate();
      setOpen(false);
      setName("");
      setClientId("");
      setStatus("ACTIVE");
      setBudget("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !clientId) return;
    createProject.mutate({
      name: name.trim(),
      clientId,
      status: status as any,
      budgetCents: budget ? Math.round(parseFloat(budget) * 100) : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website Redesign"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-950">
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-400">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Budget ($)</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="5000"
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
              disabled={!name.trim() || !clientId || createProject.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: projects, isLoading } = api.crmProject.list.useQuery(
    { status: statusFilter as any },
    { enabled: !userLoading },
  );

  if (userLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Projects
          </h1>
          <p className="text-sm text-zinc-500">
            {projects?.length ?? 0} projects across all clients
          </p>
        </div>
        <AddProjectDialog />
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40 border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700/50"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50">
                    <FolderKanban className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">{project.name}</p>
                    <p className="text-xs text-zinc-500">
                      {project.client.name}
                      {project.client.company
                        ? ` · ${project.client.company}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {project.budgetCents !== null && (
                    <p className="text-sm font-semibold text-zinc-300">
                      ${(project.budgetCents / 100).toLocaleString()}
                    </p>
                  )}
                  <div className="text-right text-xs text-zinc-500">
                    <p>{project._count.deliverables} deliverables</p>
                    <p>{project._count.invoices} invoices</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={STATUS_BADGES[project.status] ?? "text-zinc-400"}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <FolderKanban className="mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="text-sm font-medium text-zinc-400">
              No projects yet
            </h3>
            <p className="mt-1 text-xs text-zinc-600">
              Create a project to start tracking deliverables and budgets.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
