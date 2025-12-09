"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { checkAdminAuth } from "@/utils/auth";
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

    // Check authentication and admin role
    checkAdminAuth()
      .then((admin) => {
        if (!admin) {
          router.push("/admin/login");
          return;
        }
        startTransition(() => {
          setIsChecking(false);
        });
      })
      .catch((error) => {
        console.error("Auth check error:", error);
        router.push("/admin/login");
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
