import type { Metadata } from "next";
import { AuthGuard } from "@/components/admin/AuthGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Audiophile e-commerce website",
  description: "Admin dashboard for managing Audiophile e-commerce website",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
