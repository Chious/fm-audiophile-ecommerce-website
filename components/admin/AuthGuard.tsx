"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import { AdminLayout as AdminLayoutComponent } from "@/components/admin/AdminLayout";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      startTransition(() => {
        setIsChecking(false);
      });
      return;
    }

    // Check authentication
    if (!isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    startTransition(() => {
      setIsChecking(false);
    });
  }, [pathname, router]);

  // Show loading state while checking
  if (isChecking && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't wrap login page with AdminLayout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Wrap authenticated pages with AdminLayout
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
