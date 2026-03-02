import { userRouter } from "@/server/api/routers/user";
import { taskRouter } from "@/server/api/routers/task";
import { dailyLogRouter } from "@/server/api/routers/dailyLog";
import { goalRouter } from "@/server/api/routers/goal";
import { habitRouter } from "@/server/api/routers/habit";
import { clientRouter } from "@/server/api/routers/client";
import { projectRouter } from "@/server/api/routers/project";
import { invoiceRouter } from "@/server/api/routers/invoice";
import { aiRouter } from "@/server/api/routers/ai";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { contentRouter } from "@/server/api/routers/content";
import { fitnessRouter } from "@/server/api/routers/fitness";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * Primary tRPC router for PersonalOS.
 */
export const appRouter = createTRPCRouter({
  // LifeOS
  user: userRouter,
  task: taskRouter,
  dailyLog: dailyLogRouter,
  goal: goalRouter,
  habit: habitRouter,
  content: contentRouter,
  fitness: fitnessRouter,

  // ClientOS — using 'crm' prefix to avoid 'client' collision with tRPC internals
  crmClient: clientRouter,
  crmProject: projectRouter,
  crmInvoice: invoiceRouter,

  // System
  ai: aiRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
