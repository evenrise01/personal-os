import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const taskCreateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z
    .enum(["REVENUE", "HEALTH", "GROWTH", "SOCIAL", "ADMIN", "PERSONAL"])
    .default("PERSONAL"),
  estimatedMins: z.number().int().positive().optional(),
  isDeepWork: z.boolean().default(false),
  scheduledDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  goalId: z.string().optional(),
});

const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string(),
  actualMins: z.number().int().nonnegative().optional(),
});

const taskListSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  category: z
    .enum(["REVENUE", "HEALTH", "GROWTH", "SOCIAL", "ADMIN", "PERSONAL"])
    .optional(),
  scheduledDate: z.string().datetime().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const taskRouter = createTRPCRouter({
  /** List tasks with filters and cursor pagination */
  list: protectedProcedure
    .input(taskListSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const where = {
        userId: user.id,
        deletedAt: null,
        ...(input.status && { status: input.status }),
        ...(input.category && { category: input.category }),
        ...(input.scheduledDate && {
          scheduledDate: new Date(input.scheduledDate),
        }),
        ...((input.fromDate ?? input.toDate) && {
          scheduledDate: {
            ...(input.fromDate && { gte: new Date(input.fromDate) }),
            ...(input.toDate && { lte: new Date(input.toDate) }),
          },
        }),
      };

      const tasks = await ctx.db.task.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        include: { goal: { select: { id: true, title: true } } },
      });

      let nextCursor: string | undefined;
      if (tasks.length > input.limit) {
        const next = tasks.pop();
        nextCursor = next?.id;
      }

      return { tasks, nextCursor };
    }),

  /** Get single task by ID */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.task.findFirstOrThrow({
        where: { id: input.id, userId: user.id, deletedAt: null },
        include: {
          goal: { select: { id: true, title: true } },
          deliverable: true,
        },
      });
    }),

  /** Create a new task */
  create: protectedProcedure
    .input(taskCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.task.create({
        data: {
          ...input,
          userId: user.id,
          scheduledDate: input.scheduledDate
            ? new Date(input.scheduledDate)
            : undefined,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        },
      });
    }),

  /** Update task fields */
  update: protectedProcedure
    .input(taskUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const { id, ...data } = input;

      // Verify ownership
      await ctx.db.task.findFirstOrThrow({
        where: { id, userId: user.id, deletedAt: null },
      });

      return ctx.db.task.update({
        where: { id },
        data: {
          ...data,
          scheduledDate: data.scheduledDate
            ? new Date(data.scheduledDate)
            : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
    }),

  /** Mark task as complete */
  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      await ctx.db.task.findFirstOrThrow({
        where: { id: input.id, userId: user.id, deletedAt: null },
      });

      return ctx.db.task.update({
        where: { id: input.id },
        data: {
          status: "DONE",
          completedAt: new Date(),
        },
      });
    }),

  /** Soft-delete a task */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      await ctx.db.task.findFirstOrThrow({
        where: { id: input.id, userId: user.id, deletedAt: null },
      });

      return ctx.db.task.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),
});
