"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "dropdown" | "mobile" | "default";
  className?: string;
}

export function LogoutButton({
  variant = "default",
  className,
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (variant === "dropdown") {
    return (
      <button
        onClick={handleLogout}
        className={cn(
          "flex w-full items-center gap-2 text-destructive",
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    );
  }

  if (variant === "mobile") {
    return (
      <Button
        variant="ghost"
        onClick={handleLogout}
        className={cn(
          "w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10",
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
