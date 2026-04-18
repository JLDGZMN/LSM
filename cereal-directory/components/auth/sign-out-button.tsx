"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      className={cn(className)}
      onClick={async () => {
        if (!window.confirm("Are you sure you want to sign out?")) {
          return;
        }

        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign Out
    </Button>
  );
}
