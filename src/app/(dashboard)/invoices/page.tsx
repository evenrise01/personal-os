"use client";

import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-600/20",
  },
  SENT: {
    label: "Sent",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  VIEWED: {
    label: "Viewed",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-600/20",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

export default function InvoicesPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: invoices, isLoading } = api.crmInvoice.list.useQuery(
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

  // Revenue stats
  const totalRevenue =
    invoices
      ?.filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.amountCents, 0) ?? 0;
  const outstanding =
    invoices
      ?.filter((i) => ["SENT", "VIEWED", "OVERDUE"].includes(i.status))
      .reduce((sum, i) => sum + i.amountCents, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Invoices
          </h1>
          <p className="text-sm text-zinc-500">
            {invoices?.length ?? 0} total invoices
          </p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${(totalRevenue / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Outstanding</p>
            <p className="text-2xl font-bold text-amber-400">
              ${(outstanding / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select
        value={statusFilter ?? "all"}
        onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-40 border-zinc-800 bg-zinc-900 text-zinc-200">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="border-zinc-800 bg-zinc-950">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="SENT">Sent</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="OVERDUE">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {/* Invoice List */}
      {invoices && invoices.length > 0 ? (
        <div className="grid gap-2">
          {invoices.map((invoice) => {
            const badge = STATUS_BADGES[invoice.status] ?? STATUS_BADGES.DRAFT!;
            return (
              <Card
                key={invoice.id}
                className="border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700/50"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50">
                      <FileText className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-200">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {invoice.client.name}
                        {invoice.project ? ` · ${invoice.project.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-200">
                        ${(invoice.amountCents / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="text-sm font-medium text-zinc-400">
              No invoices yet
            </h3>
            <p className="mt-1 text-xs text-zinc-600">
              Create an invoice from a project to start tracking revenue.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
