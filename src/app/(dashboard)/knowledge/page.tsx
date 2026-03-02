"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Lightbulb,
  FileText,
  Loader2,
  Sparkles,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_COLORS: Record<string, string> = {
  TWITTER: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  LINKEDIN: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  INSTAGRAM: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  YOUTUBE: "text-red-400 bg-red-500/10 border-red-500/20",
  TIKTOK: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  BLOG: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  NEWSLETTER: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  OTHER: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

const STATUS_ORDER = ["IDEA", "DRAFTING", "READY", "PUBLISHED"] as const;
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  IDEA: { label: "💡 Ideas", color: "text-amber-400" },
  DRAFTING: { label: "✍️ Drafting", color: "text-blue-400" },
  READY: { label: "🚀 Ready", color: "text-emerald-400" },
  PUBLISHED: { label: "📢 Published", color: "text-violet-400" },
};

function AddIdeaDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("TWITTER");
  const [hook, setHook] = useState("");

  const utils = api.useUtils();
  const createIdea = api.content.ideaCreate.useMutation({
    onSuccess: () => {
      void utils.content.ideaList.invalidate();
      setOpen(false);
      setTitle("");
      setDescription("");
      setPlatform("TWITTER");
      setHook("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          New Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Capture Content Idea
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createIdea.mutate({
              title: title.trim(),
              description: description.trim() || undefined,
              platform: platform as any,
              hook: hook.trim() || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label className="text-zinc-400">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content idea title..."
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-950">
                <SelectItem value="TWITTER">Twitter / X</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="YOUTUBE">YouTube</SelectItem>
                <SelectItem value="TIKTOK">TikTok</SelectItem>
                <SelectItem value="BLOG">Blog</SelectItem>
                <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">
              Hook <span className="text-zinc-600">(optional)</span>
            </Label>
            <Input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="The attention-grabbing opener..."
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">
              Description <span className="text-zinc-600">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key points, angles, references..."
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createIdea.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createIdea.isPending ? "Saving..." : "Save Idea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ContentPage() {
  const { isLoading: userLoading } = useSyncUser();
  const [tab, setTab] = useState("pipeline");

  const { data: ideas, isLoading: ideasLoading } =
    api.content.ideaList.useQuery(undefined, { enabled: !userLoading });

  const { data: posts, isLoading: postsLoading } =
    api.content.postList.useQuery(undefined, { enabled: !userLoading });

  const utils = api.useUtils();

  const updateIdea = api.content.ideaUpdate.useMutation({
    onSuccess: () => void utils.content.ideaList.invalidate(),
  });

  const deleteIdea = api.content.ideaDelete.useMutation({
    onSuccess: () => void utils.content.ideaList.invalidate(),
  });

  const createPost = api.content.postCreate.useMutation({
    onSuccess: () => {
      void utils.content.postList.invalidate();
      void utils.content.ideaList.invalidate();
    },
  });

  const publishPost = api.content.postPublish.useMutation({
    onSuccess: () => void utils.content.postList.invalidate(),
  });

  if (userLoading || ideasLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  // Group ideas by status for kanban
  const ideasByStatus: Record<string, typeof ideas> = {};
  for (const status of STATUS_ORDER) {
    ideasByStatus[status] = ideas?.filter((i) => i.status === status) ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Content Engine
          </h1>
          <p className="text-sm text-zinc-500">
            Ideate → Draft → Publish. {ideas?.length ?? 0} ideas ·{" "}
            {posts?.length ?? 0} posts
          </p>
        </div>
        <AddIdeaDialog />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="border border-zinc-800 bg-zinc-900">
          <TabsTrigger
            value="pipeline"
            className="data-[state=active]:bg-zinc-800"
          >
            Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-zinc-800"
          >
            Posts
          </TabsTrigger>
        </TabsList>

        {/* Pipeline (Kanban) */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {STATUS_ORDER.map((status) => {
              const statusInfo = STATUS_LABELS[status]!;
              const statusIdeas = ideasByStatus[status] ?? [];
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "text-xs font-semibold tracking-wider uppercase",
                        statusInfo.color,
                      )}
                    >
                      {statusInfo.label}
                    </h3>
                    <Badge
                      variant="outline"
                      className="h-5 px-1.5 text-[10px] text-zinc-500"
                    >
                      {statusIdeas.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {statusIdeas.map((idea) => (
                      <Card
                        key={idea.id}
                        className="group border-zinc-800/50 bg-zinc-900/50 transition-all hover:border-zinc-700/50"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-zinc-200">
                              {idea.title}
                            </p>
                            <button
                              onClick={() => deleteIdea.mutate({ id: idea.id })}
                              className="shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {idea.hook && (
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-500 italic">
                              &ldquo;{idea.hook}&rdquo;
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-5 px-1.5 text-[10px]",
                                PLATFORM_COLORS[idea.platform] ??
                                  PLATFORM_COLORS.OTHER,
                              )}
                            >
                              {idea.platform}
                            </Badge>
                            {status !== "PUBLISHED" && (
                              <button
                                onClick={() => {
                                  const nextIdx =
                                    STATUS_ORDER.indexOf(status) + 1;
                                  if (nextIdx < STATUS_ORDER.length) {
                                    updateIdea.mutate({
                                      id: idea.id,
                                      status: STATUS_ORDER[nextIdx],
                                    });
                                  }
                                }}
                                className="flex items-center gap-0.5 text-[10px] text-zinc-600 hover:text-zinc-300"
                              >
                                Move <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {statusIdeas.length === 0 && (
                      <p className="py-6 text-center text-xs text-zinc-700">
                        Empty
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Posts */}
        <TabsContent value="posts" className="mt-4">
          {posts && posts.length > 0 ? (
            <div className="grid gap-2">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-zinc-800/50 bg-zinc-900/30"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-zinc-600" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {post.title ?? post.idea?.title ?? "Untitled Post"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {post.platform}
                          {post.idea ? ` · From: ${post.idea.title}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          PLATFORM_COLORS[post.platform],
                        )}
                      >
                        {post.status}
                      </Badge>
                      {post.status === "READY" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publishPost.mutate({ id: post.id })}
                          className="h-7 border-emerald-600/30 text-xs text-emerald-400 hover:bg-emerald-600/10"
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-zinc-800/50 bg-zinc-900/30">
              <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                <FileText className="mb-4 h-12 w-12 text-zinc-700" />
                <h3 className="text-sm font-medium text-zinc-400">
                  No posts yet
                </h3>
                <p className="mt-1 text-xs text-zinc-600">
                  Start drafting from your ideas to create posts.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
