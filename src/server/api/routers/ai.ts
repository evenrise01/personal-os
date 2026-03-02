/**
 * PersonalOS AI Agent — tRPC Router
 *
 * Bridges the AI orchestrator to the frontend via tRPC mutations.
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { chat } from "@/server/ai/orchestrator";

export const aiRouter = createTRPCRouter({
  /**
   * Send a message to the AI agent and get a response.
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        sessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's DB profile
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.userId },
        include: {
          memberships: {
            include: { workspace: true },
            take: 1,
          },
        },
      });

      if (!user) {
        throw new Error("User not found. Please sign in again.");
      }

      const workspaceId = user.memberships[0]?.workspaceId;

      const response = await chat(
        input.message,
        {
          db: ctx.db,
          userId: user.id,
          workspaceId,
        },
        input.sessionId,
      );

      return response;
    }),
});
