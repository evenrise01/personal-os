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

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

const invoiceCreateSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  invoiceNumber: z.string().min(1),
  status: z
    .enum([
      "DRAFT",
      "SENT",
      "VIEWED",
      "PAID",
      "OVERDUE",
      "CANCELLED",
      "REFUNDED",
    ])
    .default("DRAFT"),
  amountCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative().default(0),
  currency: z.string().default("USD"),
  description: z.string().max(5000).optional(),
  lineItems: z.array(lineItemSchema).optional(),
  issuedAt: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  workspaceId: z.string().optional(),
});

export const invoiceRouter = createTRPCRouter({
  /** List invoices with status filter */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              "DRAFT",
              "SENT",
              "VIEWED",
              "PAID",
              "OVERDUE",
              "CANCELLED",
              "REFUNDED",
            ])
            .optional(),
          clientId: z.string().optional(),
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

      return ctx.db.invoice.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          ...(input?.status && { status: input.status }),
          ...(input?.clientId && { clientId: input.clientId }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, name: true, company: true } },
          project: { select: { id: true, name: true } },
          _count: { select: { payments: true } },
        },
      });
    }),

  /** Get single invoice with payments */
  getById: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      return ctx.db.invoice.findFirstOrThrow({
        where: { id: input.id, workspaceId, deletedAt: null },
        include: {
          client: true,
          project: { select: { id: true, name: true } },
          payments: { orderBy: { paidAt: "desc" } },
        },
      });
    }),

  /** Create an invoice */
  create: protectedProcedure
    .input(invoiceCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const { workspaceId: _, ...data } = input;
      return ctx.db.invoice.create({
        data: {
          ...data,
          workspaceId,
          issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
    }),

  /** Update invoice */
  update: protectedProcedure
    .input(invoiceCreateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const { id, workspaceId: _, ...data } = input;
      await ctx.db.invoice.findFirstOrThrow({
        where: { id, workspaceId, deletedAt: null },
      });

      return ctx.db.invoice.update({
        where: { id },
        data: {
          ...data,
          issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
    }),

  /** Record a payment against an invoice */
  markPaid: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        amountCents: z.number().int().positive(),
        currency: z.string().default("USD"),
        method: z
          .enum([
            "BANK_TRANSFER",
            "CREDIT_CARD",
            "PAYPAL",
            "STRIPE",
            "CASH",
            "CRYPTO",
            "OTHER",
          ])
          .default("BANK_TRANSFER"),
        reference: z.string().optional(),
        notes: z.string().optional(),
        workspaceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId } = await getUserWorkspace(
        ctx.db,
        ctx.userId,
        input.workspaceId,
      );

      const invoice = await ctx.db.invoice.findFirstOrThrow({
        where: { id: input.invoiceId, workspaceId, deletedAt: null },
        include: { payments: true },
      });

      // Create payment record
      const payment = await ctx.db.payment.create({
        data: {
          invoiceId: input.invoiceId,
          amountCents: input.amountCents,
          currency: input.currency,
          method: input.method,
          reference: input.reference,
          notes: input.notes,
        },
      });

      // Check if invoice is fully paid
      const totalPaid =
        invoice.payments.reduce(
          (sum: number, p: any) => sum + p.amountCents,
          0,
        ) + input.amountCents;

      if (totalPaid >= invoice.amountCents) {
        await ctx.db.invoice.update({
          where: { id: input.invoiceId },
          data: { status: "PAID", paidAt: new Date() },
        });
      }

      return payment;
    }),
});
