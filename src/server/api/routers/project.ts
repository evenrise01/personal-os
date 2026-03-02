import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

async function getUserWorkspace(
  db: any,
  clerkId: string,
  workspaceId?: string,
) {
  const user = await db.user.findUniqueOrThrow({
    where: { clerkId },
    include: { memberships: true },
  });

  const wsId = workspaceId ?? user.memberships[0]?.workspaceId;
  if (!wsId)
    throw new TRPCError({ code: "NOT_FOUND", message: "No workspace found" });

  const isMember = user.memberships.some((m: any) => m.workspaceId === wsId);
  if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

  return { user, workspaceId: wsId };
}

const projectCreateSchema = z.object({
  clientId: z.string(),
  name: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  status: z
    .enum(["LEAD", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .default("LEAD"),
  budgetCents: z.number().int().nonnegative().optional(),
  currency: z.string().default("USD"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isRetainer: z.boolean().default(false),
  retainerAmountCents: z.number().int().nonnegative().optional(),
  workspaceId: z.string().optional(),
});

export const projectRouter = createTRPCRouter({
  /** List projects — filterable by client, status */
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.string().optional(),
          status: z
            .enum(["LEAD", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
            .optional(),
          workspaceId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input?.workspaceId,
      );

      return ctx.db.project.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          ...(input?.clientId && { clientId: input.clientId }),
          ...(input?.status && { status: input.status }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, name: true, company: true } },
          _count: { select: { deliverables: true, invoices: true } },
        },
      });
    }),

  /** Get project with deliverables */
  getById: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      return ctx.db.project.findFirstOrThrow({
        where: { id: input.id, workspaceId, deletedAt: null },
        include: {
          client: { select: { id: true, name: true, company: true } },
          deliverables: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
          },
          invoices: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    }),

  /** Create a project */
  create: protectedProcedure
    .input(projectCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const { workspaceId: _, ...data } = input;
      return ctx.db.project.create({
        data: {
          ...data,
          workspaceId,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
      });
    }),

  /** Update a project */
  update: protectedProcedure
    .input(projectCreateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const { id, workspaceId: _, ...data } = input;
      await ctx.db.project.findFirstOrThrow({
        where: { id, workspaceId, deletedAt: null },
      });

      return ctx.db.project.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
      });
    }),

  /** Soft-delete a project */
  delete: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      await ctx.db.project.findFirstOrThrow({
        where: { id: input.id, workspaceId, deletedAt: null },
      });

      return ctx.db.project.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),
});
