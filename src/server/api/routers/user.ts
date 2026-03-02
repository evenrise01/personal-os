import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  /**
   * Sync Clerk user to database.
   * Creates User + default Organization + Workspace on first call.
   */
  syncUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        avatarUrl: z.string().url().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({
        where: { clerkId: ctx.userId },
        include: {
          memberships: {
            include: { workspace: { include: { organization: true } } },
          },
        },
      });

      if (existing) {
        // Update if email/name changed
        const updated = await ctx.db.user.update({
          where: { clerkId: ctx.userId },
          data: {
            email: input.email,
            name: input.name ?? existing.name,
            avatarUrl: input.avatarUrl ?? existing.avatarUrl,
          },
        });
        return {
          user: updated,
          workspaceId: existing.memberships[0]?.workspaceId ?? null,
        };
      }

      // First sign-in: create User + Org + Workspace + Membership
      const user = await ctx.db.user.create({
        data: {
          clerkId: ctx.userId,
          email: input.email,
          name: input.name,
          avatarUrl: input.avatarUrl,
        },
      });

      const org = await ctx.db.organization.create({
        data: {
          name: `${input.name ?? input.email}'s Org`,
          slug: `org-${user.id}`,
        },
      });

      const workspace = await ctx.db.workspace.create({
        data: {
          name: "Personal",
          slug: "personal",
          organizationId: org.id,
        },
      });

      await ctx.db.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      return { user, workspaceId: workspace.id };
    }),

  /** Get current user profile with workspace info */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: { organization: true },
            },
          },
        },
      },
    });
  }),

  /** Update user profile fields */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        timezone: z.string().optional(),
        onboarded: z.boolean().optional(),
        metadata: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { clerkId: ctx.userId },
        data: input,
      });
    }),
});
