/**
 * tRPC Server Configuration
 *
 * Context, initialization, and procedure definitions
 * with Clerk auth integration.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";

/**
 * 1. CONTEXT
 *
 * Creates the context available in all tRPC procedures.
 * Includes database client and Clerk user ID.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId } = await auth();

  return {
    db,
    userId,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURES
 */
export const createTRPCRouter = t.router;

/**
 * Timing middleware — logs procedure execution time.
 * Adds artificial delay in dev to catch waterfalls.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Auth enforcement middleware.
 * Throws UNAUTHORIZED if no Clerk userId in context.
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

/**
 * Public procedure — no auth required.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure — requires authenticated Clerk user.
 * ctx.userId is guaranteed to be non-null.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAuth);
