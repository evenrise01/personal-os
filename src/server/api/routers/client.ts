import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

/** Helper to get user's default workspace and verify membership */
async function getUserWorkspace(
  db: any,
  clerkId: string,
  workspaceId?: string,
) {
  const user = await db.user.findUniqueOrThrow({
    where: { clerkId },
    include: {
      memberships: { include: { workspace: true } },
    },
  });

  if (workspaceId) {
    const membership = user.memberships.find(
      (m: any) => m.workspaceId === workspaceId,
    );
    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not a member of this workspace",
      });
    }
    return { user, workspaceId };
  }

  // Default to first workspace
  const defaultMembership = user.memberships[0];
  if (!defaultMembership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No workspace found. Please sync your account first.",
    });
  }

  return { user, workspaceId: defaultMembership.workspaceId };
}

const clientCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  website: z.string().url().optional().nullable(),
  health: z.enum(["EXCELLENT", "GOOD", "AT_RISK", "CHURNED"]).default("GOOD"),
  notes: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string()).default([]),
  workspaceId: z.string().optional(),
});

export const clientRouter = createTRPCRouter({
  /** List clients with optional health filter */
  list: protectedProcedure
    .input(
      z
        .object({
          health: z
            .enum(["EXCELLENT", "GOOD", "AT_RISK", "CHURNED"])
            .optional(),
          search: z.string().optional(),
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

      return ctx.db.client.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          ...(input?.health && { health: input.health }),
          ...(input?.search && {
            OR: [
              {
                name: { contains: input.search, mode: "insensitive" as const },
              },
              {
                company: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: { contains: input.search, mode: "insensitive" as const },
              },
            ],
          }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { projects: true, invoices: true } },
        },
      });
    }),

  /** Get client with full details */
  getById: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      return ctx.db.client.findFirstOrThrow({
        where: { id: input.id, workspaceId, deletedAt: null },
        include: {
          contacts: {
            where: { deletedAt: null },
            orderBy: { isPrimary: "desc" },
          },
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
          },
          invoices: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          communications: { orderBy: { occurredAt: "desc" }, take: 10 },
          _count: { select: { projects: true, invoices: true } },
        },
      });
    }),

  /** Create a new client */
  create: protectedProcedure
    .input(clientCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const { workspaceId: _, ...data } = input;
      return ctx.db.client.create({
        data: { ...data, workspaceId },
      });
    }),

  /** Update client */
  update: protectedProcedure
    .input(clientCreateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const { id, workspaceId: _, ...data } = input;
      await ctx.db.client.findFirstOrThrow({
        where: { id, workspaceId, deletedAt: null },
      });

      return ctx.db.client.update({ where: { id }, data });
    }),

  /** Soft-delete a client */
  delete: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      await ctx.db.client.findFirstOrThrow({
        where: { id: input.id, workspaceId, deletedAt: null },
      });

      return ctx.db.client.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),
});
