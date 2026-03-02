"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Users, Loader2 } from "lucide-react";
import Link from "next/link";

const HEALTH_BADGES: Record<string, { label: string; className: string }> = {
  EXCELLENT: {
    label: "Excellent",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  GOOD: {
    label: "Good",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  AT_RISK: {
    label: "At Risk",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  CHURNED: {
    label: "Churned",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

function AddClientDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [health, setHealth] = useState("GOOD");

  const utils = api.useUtils();

  const createClient = api.crmClient.create.useMutation({
    onSuccess: () => {
      void utils.crmClient.list.invalidate();
      setOpen(false);
      setName("");
      setEmail("");
      setCompany("");
      setHealth("GOOD");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createClient.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      health: health as any,
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
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client or business name"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-400">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Company</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Health</Label>
            <Select value={health} onValueChange={setHealth}>
              <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-950">
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="AT_RISK">At Risk</SelectItem>
                <SelectItem value="CHURNED">Churned</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={!name.trim() || createClient.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createClient.isPending ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<string | undefined>();

  const { data: clients, isLoading } = api.crmClient.list.useQuery(
    {
      search: search || undefined,
      health: healthFilter as any,
    },
    { enabled: !userLoading },
  );

  const utils = api.useUtils();
  const deleteClient = api.crmClient.delete.useMutation({
    onSuccess: () => void utils.crmClient.list.invalidate(),
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
            Clients
          </h1>
          <p className="text-sm text-zinc-500">
            {clients?.length ?? 0} clients in your workspace
          </p>
        </div>
        <AddClientDialog />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="border-zinc-800 bg-zinc-900 pl-9 text-zinc-100"
          />
        </div>
        <Select
          value={healthFilter ?? "all"}
          onValueChange={(v) => setHealthFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40 border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectValue placeholder="All Health" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Health</SelectItem>
            <SelectItem value="EXCELLENT">Excellent</SelectItem>
            <SelectItem value="GOOD">Good</SelectItem>
            <SelectItem value="AT_RISK">At Risk</SelectItem>
            <SelectItem value="CHURNED">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client List */}
      {clients && clients.length > 0 ? (
        <div className="grid gap-3">
          {clients.map((client) => {
            const badge = HEALTH_BADGES[client.health] ?? HEALTH_BADGES.GOOD!;
            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="cursor-pointer border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700/50 hover:bg-zinc-900/60">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-sm font-bold text-zinc-400">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-200">
                          {client.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {client.company ?? client.email ?? "No details"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-zinc-500">
                        <p>{client._count.projects} projects</p>
                        <p>{client._count.invoices} invoices</p>
                      </div>
                      <Badge variant="outline" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <Users className="mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="text-sm font-medium text-zinc-400">
              No clients yet
            </h3>
            <p className="mt-1 text-xs text-zinc-600">
              Add your first client to start tracking projects and revenue.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
