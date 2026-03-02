/**
 * PersonalOS AI Agent — Orchestrator
 *
 * Routes user queries to the appropriate agent, manages tool calls,
 * and returns structured responses. Uses Gemini as the LLM backbone.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AGENT_PROMPTS, type AgentRole } from "./systemPrompts";
import { AI_TOOLS } from "./tools";
import {
  createSession,
  getSession,
  addMessage,
  getHistory,
  type ChatMessage,
} from "./memory";
import type { PrismaClient } from "@/generated/prisma";
import { buildDailyContext, buildClientContext } from "./contextBuilder";

// Initialize Gemini client (API key from environment)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface OrchestratorConfig {
  db: PrismaClient;
  userId: string; // Internal DB user ID
  workspaceId?: string;
}

export interface AgentResponse {
  text: string;
  toolCalls?: {
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }[];
  sessionId: string;
}

/**
 * Determine which agent to route to based on the user's message.
 */
function routeToAgent(message: string): AgentRole {
  const lower = message.toLowerCase();

  if (
    lower.includes("client") ||
    lower.includes("invoice") ||
    lower.includes("revenue") ||
    lower.includes("proposal")
  ) {
    return "clientInsight";
  }

  if (
    lower.includes("week") ||
    lower.includes("review") ||
    lower.includes("last 7") ||
    lower.includes("weekly")
  ) {
    return "weeklyReviewer";
  }

  if (
    lower.includes("trend") ||
    lower.includes("growth") ||
    lower.includes("performance score") ||
    lower.includes("analytics")
  ) {
    return "performanceAnalyst";
  }

  // Default to daily planner
  return "dailyPlanner";
}

/**
 * Execute a tool call from the AI agent.
 */
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  config: OrchestratorConfig,
): Promise<unknown> {
  switch (toolName) {
    case "create_task":
      return config.db.task.create({
        data: {
          title: args.title as string,
          category: (args.category as string) ?? "PERSONAL",
          priority: (args.priority as string) ?? "MEDIUM",
          estimatedMins: args.estimatedMins as number | undefined,
          isDeepWork: (args.isDeepWork as boolean) ?? false,
          userId: config.userId,
          scheduledDate: new Date(),
        },
      });

    case "complete_task":
      return config.db.task.update({
        where: { id: args.taskId as string },
        data: { status: "DONE", completedAt: new Date() },
      });

    case "log_energy": {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      const field =
        args.period === "morning" ? "morningEnergy" : "eveningEnergy";
      return config.db.dailyLog.upsert({
        where: {
          userId_date: { userId: config.userId, date },
        },
        create: { userId: config.userId, date, [field]: args.level },
        update: { [field]: args.level },
      });
    }

    case "get_daily_summary":
      return buildDailyContext(
        config.db,
        config.userId,
        (args.date as string) ?? new Date().toISOString().split("T")[0]!,
      );

    case "get_client_overview":
      if (!config.workspaceId) return { error: "No workspace configured" };
      return buildClientContext(config.db, config.workspaceId);

    case "update_goal":
      return config.db.goal.update({
        where: { id: args.goalId as string },
        data: {
          ...(args.status && { status: args.status as string }),
          ...(args.currentValue !== undefined && {
            currentValue: args.currentValue as number,
          }),
        },
      });

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

/**
 * Main orchestrator — send a message to the AI agent and get a response.
 */
export async function chat(
  message: string,
  config: OrchestratorConfig,
  sessionId?: string,
): Promise<AgentResponse> {
  // Resolve or create session
  const agentRole = routeToAgent(message);
  const session =
    (sessionId && getSession(sessionId)) ??
    createSession(config.userId, agentRole, AGENT_PROMPTS[agentRole]);

  // Add user message
  addMessage(session.id, { role: "user", content: message });

  // Build context
  const today = new Date().toISOString().split("T")[0]!;
  const dailyContext = await buildDailyContext(config.db, config.userId, today);

  // Prepare Gemini chat
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ functionDeclarations: AI_TOOLS }],
  });

  const history = getHistory(session.id);
  const contextMessage = `Current context:\n${JSON.stringify(dailyContext, null, 2)}`;

  // Send to Gemini
  const result = await model.generateContent([
    AGENT_PROMPTS[agentRole],
    contextMessage,
    ...history
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role}: ${m.content}`),
    `user: ${message}`,
  ]);

  const response = result.response;
  const text = response.text();
  const toolCalls: AgentResponse["toolCalls"] = [];

  // Handle function calls
  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    for (const call of functionCalls) {
      const toolResult = await executeTool(
        call.name,
        call.args as Record<string, unknown>,
        config,
      );
      toolCalls.push({
        name: call.name,
        args: call.args as Record<string, unknown>,
        result: toolResult,
      });

      addMessage(session.id, {
        role: "tool",
        content: JSON.stringify(toolResult),
        toolName: call.name,
        toolResult,
      });
    }
  }

  // Store assistant response
  addMessage(session.id, { role: "assistant", content: text });

  return {
    text,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    sessionId: session.id,
  };
}
