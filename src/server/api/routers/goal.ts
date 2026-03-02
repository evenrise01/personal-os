import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const goalCreateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z
    .enum(["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"])
    .default("ACTIVE"),
  timeframe: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"])
    .default("QUARTERLY"),
  category: z
    .enum(["REVENUE", "HEALTH", "GROWTH", "SOCIAL", "ADMIN", "PERSONAL"])
    .default("GROWTH"),
  targetDate: z.string().datetime().optional(),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  parentId: z.string().optional(),
});

export const goalRouter = createTRPCRouter({
  /** List goals with optional status filter */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"])
            .optional(),
          timeframe: z
            .enum([
              "DAILY",
              "WEEKLY",
              "MONTHLY",
              "QUARTERLY",
              "YEARLY",
              "LIFETIME",
            ])
            .optional(),
          category: z
            .enum([
              "REVENUE",
              "HEALTH",
              "GROWTH",
              "SOCIAL",
              "ADMIN",
              "PERSONAL",
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.goal.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          ...(input?.status && { status: input.status }),
          ...(input?.timeframe && { timeframe: input.timeframe }),
          ...(input?.category && { category: input.category }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { tasks: true, habits: true, children: true } },
        },
      });
    }),

  /** Create a new goal */
  create: protectedProcedure
    .input(goalCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.goal.create({
        data: {
          ...input,
          userId: user.id,
          targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        },
      });
    }),

  /** Update a goal */
  update: protectedProcedure
    .input(goalCreateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const { id, ...data } = input;
      await ctx.db.goal.findFirstOrThrow({
        where: { id, userId: user.id, deletedAt: null },
      });

      return ctx.db.goal.update({
        where: { id },
        data: {
          ...data,
          targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        },
      });
    }),

  /** Soft-delete a goal */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      await ctx.db.goal.findFirstOrThrow({
        where: { id: input.id, userId: user.id, deletedAt: null },
      });

      return ctx.db.goal.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),
});
