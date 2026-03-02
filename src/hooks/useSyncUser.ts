"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { useEffect } from "react";

/**
 * Syncs the current Clerk user to our database.
 * Call this in the dashboard layout to ensure user exists in DB.
 * Returns the DB user + workspace info.
 */
export function useSyncUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const utils = api.useUtils();

  const { data: profile, isLoading: profileLoading } =
    api.user.getProfile.useQuery(undefined, {
      enabled: isLoaded && !!clerkUser,
      retry: false,
    });

  const syncMutation = api.user.syncUser.useMutation({
    onSuccess: () => {
      void utils.user.getProfile.invalidate();
    },
  });

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;
    if (profileLoading) return;

    // If user doesn't exist in DB yet, sync them
    if (!profile) {
      syncMutation.mutate({
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        name: clerkUser.fullName ?? clerkUser.firstName ?? undefined,
        avatarUrl: clerkUser.imageUrl ?? undefined,
      });
    }
  }, [isLoaded, clerkUser, profile, profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultWorkspaceId = profile?.memberships?.[0]?.workspaceId ?? null;

  return {
    user: profile,
    workspaceId: defaultWorkspaceId,
    isLoading: !isLoaded || profileLoading || syncMutation.isPending,
    isSyncing: syncMutation.isPending,
  };
}
