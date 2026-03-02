/**
 * PersonalOS Fitness Module — tRPC Router
 *
 * Workout logging with exercise tracking and weekly stats.
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number().int().min(1).optional(),
  reps: z.number().int().min(1).optional(),
  weight: z.number().optional(),
  unit: z.enum(["kg", "lbs"]).optional(),
  notes: z.string().optional(),
});

export const fitnessRouter = createTRPCRouter({
  /**
   * List fitness logs for a date range.
   */
  list: protectedProcedure
    .input(
      z
        .object({
          from: z.string().optional(), // YYYY-MM-DD
          to: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const now = new Date();
      const defaultFrom = new Date(now);
      defaultFrom.setDate(defaultFrom.getDate() - 30);

      return ctx.db.fitnessLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: input?.from
              ? new Date(input.from + "T00:00:00.000Z")
              : defaultFrom,
            lte: input?.to ? new Date(input.to + "T23:59:59.999Z") : now,
          },
        },
        orderBy: { date: "desc" },
      });
    }),

  /**
   * Get fitness log for a specific date.
   */
  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const dateObj = new Date(input.date + "T00:00:00.000Z");

      return ctx.db.fitnessLog.findFirst({
        where: { userId: user.id, date: dateObj },
      });
    }),

  /**
   * Log a workout — create or update for the given date.
   */
  logWorkout: protectedProcedure
    .input(
      z.object({
        date: z.string(), // YYYY-MM-DD
        workoutType: z.string().max(50).optional(),
        durationMins: z.number().int().min(1).optional(),
        exercises: z.array(exerciseSchema).optional(),
        notes: z.string().max(2000).optional(),
        energyBefore: z
          .enum(["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"])
          .optional(),
        energyAfter: z
          .enum(["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const dateObj = new Date(input.date + "T00:00:00.000Z");

      // Check for existing log on this date
      const existing = await ctx.db.fitnessLog.findFirst({
        where: { userId: user.id, date: dateObj },
      });

      const data = {
        workoutType: input.workoutType,
        durationMins: input.durationMins,
        exercises: input.exercises as any,
        notes: input.notes,
        energyBefore: input.energyBefore,
        energyAfter: input.energyAfter,
      };

      if (existing) {
        return ctx.db.fitnessLog.update({
          where: { id: existing.id },
          data,
        });
      }

      return ctx.db.fitnessLog.create({
        data: {
          ...data,
          userId: user.id,
          date: dateObj,
        },
      });
    }),

  /**
   * Get weekly fitness stats.
   */
  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUniqueOrThrow({
      where: { clerkId: ctx.userId },
    });

    const now = new Date();
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    const logs = await ctx.db.fitnessLog.findMany({
      where: {
        userId: user.id,
        date: { gte: weekStart },
      },
      orderBy: { date: "asc" },
    });

    const totalSessions = logs.length;
    const totalDuration = logs.reduce(
      (sum, l) => sum + (l.durationMins ?? 0),
      0,
    );
    const typeBreakdown: Record<string, number> = {};
    for (const log of logs) {
      const type = log.workoutType ?? "Other";
      typeBreakdown[type] = (typeBreakdown[type] ?? 0) + 1;
    }

    // Workout days this week (for calendar display)
    const workoutDays = logs.map((l) => l.date.toISOString().split("T")[0]!);

    return {
      totalSessions,
      totalDuration,
      typeBreakdown,
      workoutDays,
      logs,
    };
  }),
});
