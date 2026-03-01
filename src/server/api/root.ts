import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * Primary tRPC router for PersonalOS.
 *
 * All domain routers are registered here.
 * Add new routers as features are built.
 */
export const appRouter = createTRPCRouter({
  // LifeOS routers will go here:
  // task: taskRouter,
  // dailyLog: dailyLogRouter,
  // goal: goalRouter,
  // ClientOS routers will go here:
  // client: clientRouter,
  // project: projectRouter,
  // invoice: invoiceRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
