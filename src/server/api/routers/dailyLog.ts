import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const dailyLogUpdateSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  morningEnergy: z
    .enum(["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"])
    .optional()
    .nullable(),
  eveningEnergy: z
    .enum(["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"])
    .optional()
    .nullable(),
  deepWorkMins: z.number().int().nonnegative().optional(),
  tasksCompleted: z.number().int().nonnegative().optional(),
  tasksPlanned: z.number().int().nonnegative().optional(),
  topWin: z.string().max(1000).optional().nullable(),
  topChallenge: z.string().max(1000).optional().nullable(),
  reflection: z.string().max(5000).optional().nullable(),
  gratitude: z.string().max(1000).optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
  metadata: z.any().optional(),
});

export const dailyLogRouter = createTRPCRouter({
  /**
   * Get or create a daily log for a specific date.
   * This is the primary entry point — always returns a log.
   */
  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const dateObj = new Date(input.date + "T00:00:00.000Z");

      const existing = await ctx.db.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: dateObj,
          },
        },
      });

      if (existing) return existing;

      // Auto-create empty log for the date
      return ctx.db.dailyLog.create({
        data: {
          userId: user.id,
          date: dateObj,
        },
      });
    }),

  /** Update a daily log */
  update: protectedProcedure
    .input(dailyLogUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const dateObj = new Date(input.date + "T00:00:00.000Z");
      const { date: _, ...data } = input;

      return ctx.db.dailyLog.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: dateObj,
          },
        },
        create: {
          userId: user.id,
          date: dateObj,
          ...data,
        },
        update: data,
      });
    }),

  /** Get daily logs for a date range (for analytics) */
  getRange: protectedProcedure
    .input(
      z.object({
        fromDate: z.string(),
        toDate: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.dailyLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: new Date(input.fromDate + "T00:00:00.000Z"),
            lte: new Date(input.toDate + "T23:59:59.999Z"),
          },
        },
        orderBy: { date: "desc" },
      });
    }),
});
