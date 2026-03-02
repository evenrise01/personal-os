/**
 * PersonalOS AI Agent — Context Builder
 *
 * Pulls structured data from the database to build context windows
 * for AI agent prompts. Each method returns a serializable context
 * object ready for prompt injection.
 */

import type { PrismaClient } from "@/generated/prisma";

export interface DailyContext {
  date: string;
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    isDeepWork: boolean;
    estimatedMins: number | null;
  }[];
  log: {
    morningEnergy: string | null;
    eveningEnergy: string | null;
    deepWorkMins: number | null;
    tasksCompleted: number | null;
    topWin: string | null;
    topChallenge: string | null;
  } | null;
  habits: { name: string; category: string; currentStreak: number }[];
}

export interface WeeklyContext {
  fromDate: string;
  toDate: string;
  dailyLogs: {
    date: string;
    morningEnergy: string | null;
    deepWorkMins: number | null;
    tasksCompleted: number | null;
    score: number | null;
  }[];
  taskSummary: {
    total: number;
    completed: number;
    byCategory: Record<string, number>;
    deepWorkTotal: number;
  };
}

export interface ClientContext {
  clients: {
    id: string;
    name: string;
    health: string;
    projectCount: number;
    invoiceCount: number;
    lastCommunication: Date | null;
  }[];
  revenue: {
    totalPaidCents: number;
    outstandingCents: number;
    overdueCount: number;
  };
}

export async function buildDailyContext(
  db: PrismaClient,
  userId: string,
  date: string,
): Promise<DailyContext> {
  const dateObj = new Date(date + "T00:00:00.000Z");

  const [tasks, log, habits] = await Promise.all([
    db.task.findMany({
      where: {
        userId,
        scheduledDate: dateObj,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        isDeepWork: true,
        estimatedMins: true,
      },
      orderBy: { priority: "desc" },
    }),
    db.dailyLog.findUnique({
      where: {
        userId_date: { userId, date: dateObj },
      },
      select: {
        morningEnergy: true,
        eveningEnergy: true,
        deepWorkMins: true,
        tasksCompleted: true,
        topWin: true,
        topChallenge: true,
      },
    }),
    db.habit.findMany({
      where: { userId, isActive: true, deletedAt: null },
      select: { name: true, category: true, currentStreak: true },
    }),
  ]);

  return { date, tasks, log, habits };
}

export async function buildWeeklyContext(
  db: PrismaClient,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<WeeklyContext> {
  const from = new Date(fromDate + "T00:00:00.000Z");
  const to = new Date(toDate + "T23:59:59.999Z");

  const [dailyLogs, tasks] = await Promise.all([
    db.dailyLog.findMany({
      where: { userId, date: { gte: from, lte: to } },
      select: {
        date: true,
        morningEnergy: true,
        deepWorkMins: true,
        tasksCompleted: true,
        score: true,
      },
      orderBy: { date: "asc" },
    }),
    db.task.findMany({
      where: {
        userId,
        deletedAt: null,
        scheduledDate: { gte: from, lte: to },
      },
      select: {
        status: true,
        category: true,
        isDeepWork: true,
        estimatedMins: true,
      },
    }),
  ]);

  const completed = tasks.filter((t) => t.status === "DONE");
  const byCat: Record<string, number> = {};
  for (const t of tasks) {
    byCat[t.category] = (byCat[t.category] ?? 0) + 1;
  }
  const deepWorkTotal = completed
    .filter((t) => t.isDeepWork)
    .reduce((s, t) => s + (t.estimatedMins ?? 0), 0);

  return {
    fromDate,
    toDate,
    dailyLogs: dailyLogs.map((l) => ({
      ...l,
      date: l.date.toISOString().split("T")[0]!,
    })),
    taskSummary: {
      total: tasks.length,
      completed: completed.length,
      byCategory: byCat,
      deepWorkTotal,
    },
  };
}

export async function buildClientContext(
  db: PrismaClient,
  workspaceId: string,
): Promise<ClientContext> {
  const [clients, paidInvoices, outstandingInvoices] = await Promise.all([
    db.client.findMany({
      where: { workspaceId, deletedAt: null },
      select: {
        id: true,
        name: true,
        health: true,
        _count: { select: { projects: true, invoices: true } },
        communications: {
          orderBy: { occurredAt: "desc" },
          take: 1,
          select: { occurredAt: true },
        },
      },
    }),
    db.invoice.aggregate({
      where: { workspaceId, status: "PAID", deletedAt: null },
      _sum: { amountCents: true },
    }),
    db.invoice.aggregate({
      where: {
        workspaceId,
        status: { in: ["SENT", "VIEWED", "OVERDUE"] },
        deletedAt: null,
      },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
  ]);

  return {
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      health: c.health,
      projectCount: c._count.projects,
      invoiceCount: c._count.invoices,
      lastCommunication: c.communications[0]?.occurredAt ?? null,
    })),
    revenue: {
      totalPaidCents: paidInvoices._sum.amountCents ?? 0,
      outstandingCents: outstandingInvoices._sum.amountCents ?? 0,
      overdueCount: outstandingInvoices._count._all,
    },
  };
}
