/**
 * PersonalOS Content Engine — tRPC Router
 *
 * CRUD for content ideas and posts, with pipeline status management.
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const contentRouter = createTRPCRouter({
  // ===================== IDEAS =====================

  ideaList: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["IDEA", "DRAFTING", "READY", "PUBLISHED", "ARCHIVED"])
            .optional(),
          platform: z
            .enum([
              "TWITTER",
              "LINKEDIN",
              "INSTAGRAM",
              "YOUTUBE",
              "TIKTOK",
              "BLOG",
              "NEWSLETTER",
              "OTHER",
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.contentIdea.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          ...(input?.status && { status: input.status }),
          ...(input?.platform && { platform: input.platform }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { posts: true } },
        },
      });
    }),

  ideaCreate: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        platform: z.enum([
          "TWITTER",
          "LINKEDIN",
          "INSTAGRAM",
          "YOUTUBE",
          "TIKTOK",
          "BLOG",
          "NEWSLETTER",
          "OTHER",
        ]),
        hook: z.string().max(500).optional(),
        angle: z.string().max(500).optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.contentIdea.create({
        data: {
          ...input,
          userId: user.id,
          tags: input.tags ?? [],
        },
      });
    }),

  ideaUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(2000).optional(),
        platform: z
          .enum([
            "TWITTER",
            "LINKEDIN",
            "INSTAGRAM",
            "YOUTUBE",
            "TIKTOK",
            "BLOG",
            "NEWSLETTER",
            "OTHER",
          ])
          .optional(),
        status: z
          .enum(["IDEA", "DRAFTING", "READY", "PUBLISHED", "ARCHIVED"])
          .optional(),
        hook: z.string().max(500).optional(),
        angle: z.string().max(500).optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const { id, ...data } = input;
      return ctx.db.contentIdea.update({
        where: { id, userId: user.id },
        data,
      });
    }),

  ideaDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.contentIdea.update({
        where: { id: input.id, userId: user.id },
        data: { deletedAt: new Date() },
      });
    }),

  // ===================== POSTS =====================

  postList: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["IDEA", "DRAFTING", "READY", "PUBLISHED", "ARCHIVED"])
            .optional(),
          platform: z
            .enum([
              "TWITTER",
              "LINKEDIN",
              "INSTAGRAM",
              "YOUTUBE",
              "TIKTOK",
              "BLOG",
              "NEWSLETTER",
              "OTHER",
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.contentPost.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          ...(input?.status && { status: input.status }),
          ...(input?.platform && { platform: input.platform }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          idea: { select: { id: true, title: true } },
        },
      });
    }),

  postCreate: protectedProcedure
    .input(
      z.object({
        ideaId: z.string().optional(),
        platform: z.enum([
          "TWITTER",
          "LINKEDIN",
          "INSTAGRAM",
          "YOUTUBE",
          "TIKTOK",
          "BLOG",
          "NEWSLETTER",
          "OTHER",
        ]),
        title: z.string().max(200).optional(),
        body: z.string().max(10000).optional(),
        status: z.enum(["DRAFTING", "READY"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.contentPost.create({
        data: {
          ...input,
          userId: user.id,
          status: input.status ?? "DRAFTING",
        },
      });
    }),

  postUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().max(200).optional(),
        body: z.string().max(10000).optional(),
        status: z
          .enum(["DRAFTING", "READY", "PUBLISHED", "ARCHIVED"])
          .optional(),
        publishedAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      const { id, ...data } = input;
      return ctx.db.contentPost.update({
        where: { id, userId: user.id },
        data,
      });
    }),

  postPublish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { clerkId: ctx.userId },
      });

      return ctx.db.contentPost.update({
        where: { id: input.id, userId: user.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }),
});
