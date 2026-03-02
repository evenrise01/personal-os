/**
 * PersonalOS AI Agent — Tool Definitions
 *
 * Structured tool definitions readable by Gemini's function calling API.
 * Each tool maps to a tRPC mutation or query that the AI can invoke.
 */

import type { FunctionDeclaration } from "@google/generative-ai";

export const AI_TOOLS: FunctionDeclaration[] = [
  {
    name: "create_task",
    description: "Create a new task for the user's day.",
    parameters: {
      type: "object" as any,
      properties: {
        title: { type: "string" as any, description: "Task title" },
        category: {
          type: "string" as any,
          enum: ["REVENUE", "HEALTH", "GROWTH", "SOCIAL", "ADMIN", "PERSONAL"],
          description: "Task category",
        },
        priority: {
          type: "string" as any,
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "Task priority",
        },
        estimatedMins: {
          type: "number" as any,
          description: "Estimated duration in minutes",
        },
        isDeepWork: {
          type: "boolean" as any,
          description: "Whether this requires deep focus",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed.",
    parameters: {
      type: "object" as any,
      properties: {
        taskId: {
          type: "string" as any,
          description: "ID of the task to complete",
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "log_energy",
    description: "Log the user's current energy level.",
    parameters: {
      type: "object" as any,
      properties: {
        period: {
          type: "string" as any,
          enum: ["morning", "evening"],
          description: "Time of day",
        },
        level: {
          type: "string" as any,
          enum: ["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"],
          description: "Energy level",
        },
      },
      required: ["period", "level"],
    },
  },
  {
    name: "get_daily_summary",
    description:
      "Get a summary of the user's day including tasks, energy, and metrics.",
    parameters: {
      type: "object" as any,
      properties: {
        date: {
          type: "string" as any,
          description: "Date in YYYY-MM-DD format. Defaults to today.",
        },
      },
    },
  },
  {
    name: "get_client_overview",
    description:
      "Get an overview of all clients including health status and revenue.",
    parameters: {
      type: "object" as any,
      properties: {},
    },
  },
  {
    name: "update_goal",
    description: "Update a goal's status or progress.",
    parameters: {
      type: "object" as any,
      properties: {
        goalId: { type: "string" as any, description: "ID of the goal" },
        status: {
          type: "string" as any,
          enum: ["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"],
          description: "New status",
        },
        currentValue: {
          type: "number" as any,
          description: "Current progress value",
        },
      },
      required: ["goalId"],
    },
  },
];

export type ToolName = (typeof AI_TOOLS)[number]["name"];
