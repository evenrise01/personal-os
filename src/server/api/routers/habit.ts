import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const habitCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z
    .enum(["REVENUE", "HEALTH", "GROWTH", "SOCIAL", "ADMIN", "PERSONAL"])
    .default("GROWTH"),
  frequency: z.string().default("daily"),
  targetCount: z.number().int().positive().default(1),
  goalId: z.string().optional(),
});

export const habitRouter = createTRPCRouter({
  /** List habits (active by default) */
  list: protectedProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.habit.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          ...(input?.activeOnly !== false && { isActive: true }),
        },
        orderBy: { createdAt: "desc" },
        include: { goal: { select: { id: true, title: true } } },
      });
    }),

  /** Create a new habit */
  create: protectedProcedure
    .input(habitCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.habit.create({
        data: { ...input, userId: user.id },
      });
    }),

  /** Update a habit */
  update: protectedProcedure
    .input(habitCreateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const { id, ...data } = input;
      await ctx.db.habit.findFirstOrThrow({
        where: { id, userId: user.id, deletedAt: null },
      });

      return ctx.db.habit.update({ where: { id }, data });
    }),

  /** Toggle habit active/inactive */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const habit = await ctx.db.habit.findFirstOrThrow({
        where: { id: input.id, userId: user.id, deletedAt: null },
      });

      return ctx.db.habit.update({
        where: { id: input.id },
        data: { isActive: !habit.isActive },
      });
    }),
});
