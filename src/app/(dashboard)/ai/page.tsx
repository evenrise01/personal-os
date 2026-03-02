"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  Zap,
  Target,
  Calendar,
  BarChart3,
  MessageSquare,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  agentRole?: string;
  toolCalls?: {
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }[];
}

const SUGGESTED_PROMPTS = [
  { icon: Calendar, text: "Plan my day for maximum output" },
  { icon: BarChart3, text: "Give me a weekly performance review" },
  { icon: Target, text: "What should I focus on this week?" },
  { icon: MessageSquare, text: "How are my client relationships looking?" },
];

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  dailyPlanner: {
    label: "Daily Planner",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  weeklyReviewer: {
    label: "Weekly Reviewer",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  performanceAnalyst: {
    label: "Performance Analyst",
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  clientInsight: {
    label: "Client Intelligence",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
};

const TOOL_LABELS: Record<
  string,
  { icon: typeof CheckCircle2; label: string }
> = {
  create_task: { icon: CheckCircle2, label: "Task Created" },
  complete_task: { icon: CheckCircle2, label: "Task Completed" },
  log_energy: { icon: Zap, label: "Energy Logged" },
  get_daily_summary: { icon: Calendar, label: "Daily Summary Retrieved" },
  get_client_overview: {
    icon: MessageSquare,
    label: "Client Overview Retrieved",
  },
  update_goal: { icon: Target, label: "Goal Updated" },
};

export default function AIPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = api.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
          toolCalls: data.toolCalls,
        },
      ]);
      setSessionId(data.sessionId);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Make sure GEMINI_API_KEY is configured in your .env file.`,
        },
      ]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim() || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text.trim() }]);
    setInput("");

    chatMutation.mutate({
      message: text.trim(),
      sessionId,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  if (userLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            AI Agent
          </h1>
          <p className="text-xs text-zinc-500">
            Powered by Gemini · Routes to specialized agents automatically
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 flex-1 space-y-4 overflow-y-auto pr-2"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-emerald-600/20 to-cyan-600/20">
              <Bot className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-200">
              What can I help you with?
            </h2>
            <p className="mb-8 max-w-md text-center text-sm text-zinc-500">
              I can plan your day, review your week, analyze performance trends,
              and provide client intelligence. I can also create tasks, log
              energy, and update goals directly.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => sendMessage(prompt.text)}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left text-sm text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                >
                  <prompt.icon className="h-4 w-4 shrink-0 text-zinc-500" />
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-600/20 bg-emerald-600/10">
                  <Bot className="h-4 w-4 text-emerald-400" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] space-y-2",
                  msg.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-800 bg-zinc-900 text-zinc-200",
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Tool call results */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.toolCalls.map((tc, j) => {
                      const toolInfo = TOOL_LABELS[tc.name];
                      const ToolIcon = toolInfo?.icon ?? CheckCircle2;
                      return (
                        <div
                          key={j}
                          className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-950 px-3 py-2 text-xs"
                        >
                          <ToolIcon className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-zinc-400">
                            {toolInfo?.label ?? tc.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-auto border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400"
                          >
                            Done
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
              )}
            </div>
          ))
        )}

        {chatMutation.isPending && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-600/20 bg-emerald-600/10">
              <Bot className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span className="text-sm text-zinc-500">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI agent anything..."
          className="flex-1 bg-transparent px-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          disabled={chatMutation.isPending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || chatMutation.isPending}
          className="h-8 w-8 bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
