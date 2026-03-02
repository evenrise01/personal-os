"use client";

import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Building,
  FolderKanban,
  FileText,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

const PROJECT_STATUS_BADGES: Record<string, string> = {
  LEAD: "bg-zinc-500/10 text-zinc-400",
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  ON_HOLD: "bg-amber-500/10 text-amber-400",
  COMPLETED: "bg-blue-500/10 text-blue-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

const INVOICE_STATUS_BADGES: Record<string, string> = {
  DRAFT: "bg-zinc-500/10 text-zinc-400",
  SENT: "bg-blue-500/10 text-blue-400",
  PAID: "bg-emerald-500/10 text-emerald-400",
  OVERDUE: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-zinc-500/10 text-zinc-500",
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { isLoading: userLoading } = useSyncUser();

  const { data: client, isLoading } = api.crmClient.getById.useQuery(
    { id: params.id },
    { enabled: !userLoading && !!params.id },
  );

  if (userLoading || isLoading || !client) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  const healthBadge = HEALTH_BADGES[client.health] ?? HEALTH_BADGES.GOOD!;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {client.name}
            </h1>
            <Badge variant="outline" className={healthBadge.className}>
              {healthBadge.label}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500">
            {client.company && (
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {client.company}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            )}
            {client.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {client.website}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-4">
            <FolderKanban className="h-5 w-5 text-zinc-600" />
            <div>
              <p className="text-xs text-zinc-500">Projects</p>
              <p className="text-xl font-bold text-zinc-100">
                {client._count.projects}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-zinc-600" />
            <div>
              <p className="text-xs text-zinc-500">Invoices</p>
              <p className="text-xl font-bold text-zinc-100">
                {client._count.invoices}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare className="h-5 w-5 text-zinc-600" />
            <div>
              <p className="text-xs text-zinc-500">Communications</p>
              <p className="text-xl font-bold text-zinc-100">
                {client.communications.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contacts */}
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300">
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.contacts.length > 0 ? (
              client.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {contact.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {contact.role ?? contact.email}
                    </p>
                  </div>
                  {contact.isPrimary && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-[10px] text-emerald-400"
                    >
                      Primary
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-zinc-600">
                No contacts added
              </p>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300">
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.projects.length > 0 ? (
              client.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {project.name}
                    </p>
                    {project.budgetCents !== null && (
                      <p className="text-xs text-zinc-500">
                        Budget: ${(project.budgetCents / 100).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      PROJECT_STATUS_BADGES[project.status] ?? "text-zinc-400"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-zinc-600">
                No projects yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="border-zinc-800/50 bg-zinc-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-300">
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.invoices.length > 0 ? (
            <div className="space-y-2">
              {client.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-zinc-200">
                      ${(invoice.amountCents / 100).toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        INVOICE_STATUS_BADGES[invoice.status] ?? "text-zinc-400"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-zinc-600">
              No invoices yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {client.notes && (
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-zinc-400">
              {client.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
