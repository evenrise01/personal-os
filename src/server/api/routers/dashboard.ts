/**
 * PersonalOS Dashboard — tRPC Router
 *
 * Aggregates data across modules for the command center view.
 */

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  /**
   * Get the full dashboard overview for the authenticated user.
   */
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
      include: {
        memberships: { take: 1 },
      },
    });

    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Start of current week (Monday)
    const weekStart = new Date(today);
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    const workspaceId = user.memberships[0]?.workspaceId;

    const [
      todayTasks,
      dailyLog,
      weekInvoices,
      weekContent,
      activeGoals,
      activeHabits,
      upcomingTasks,
    ] = await Promise.all([
      // Today's tasks
      ctx.db.task.findMany({
        where: {
          userId: user.id,
          scheduledDate: today,
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
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      }),

      // Today's daily log
      ctx.db.dailyLog.findUnique({
        where: {
          userId_date: { userId: user.id, date: today },
        },
      }),

      // This week's paid invoices (revenue)
      workspaceId
        ? ctx.db.invoice.aggregate({
            where: {
              workspaceId,
              status: "PAID",
              paidAt: { gte: weekStart },
              deletedAt: null,
            },
            _sum: { amountCents: true },
            _count: { _all: true },
          })
        : null,

      // This week's published content
      ctx.db.contentPost.count({
        where: {
          userId: user.id,
          status: "PUBLISHED",
          publishedAt: { gte: weekStart },
          deletedAt: null,
        },
      }),

      // Active goals count
      ctx.db.goal.count({
        where: {
          userId: user.id,
          status: "ACTIVE",
          deletedAt: null,
        },
      }),

      // Active habits count
      ctx.db.habit.count({
        where: {
          userId: user.id,
          isActive: true,
          deletedAt: null,
        },
      }),

      // Upcoming tasks (next 3 days, excluding today)
      ctx.db.task.findMany({
        where: {
          userId: user.id,
          scheduledDate: {
            gt: today,
            lte: new Date(Date.now() + 3 * 86400000),
          },
          status: { not: "DONE" },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          scheduledDate: true,
          priority: true,
          category: true,
        },
        orderBy: { scheduledDate: "asc" },
        take: 5,
      }),
    ]);

    const completedToday = todayTasks.filter((t) => t.status === "DONE").length;
    const deepWorkMins = todayTasks
      .filter((t) => t.isDeepWork && t.status === "DONE")
      .reduce((sum, t) => sum + (t.estimatedMins ?? 0), 0);

    return {
      user: { name: user.name, avatarUrl: user.avatarUrl },
      performanceScore: dailyLog?.score ?? null,
      morningEnergy: dailyLog?.morningEnergy ?? null,

      tasksToday: todayTasks.length,
      tasksCompleted: completedToday,
      deepWorkMins,

      weekRevenueCents: weekInvoices?._sum?.amountCents ?? 0,
      weekInvoiceCount: weekInvoices?._count?._all ?? 0,
      weekContentPublished: weekContent,

      activeGoals,
      activeHabits,

      todayAgenda: todayTasks,
      upcomingTasks,
    };
  }),
});
