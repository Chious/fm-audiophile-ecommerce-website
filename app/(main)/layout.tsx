import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/providers/transition-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Frontend Mentor | Audiophile e-commerce website",
  description:
    "This is a solution to the [Audiophile e-commerce website challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/audiophile-ecommerce-website-C8cuSd_wx). Frontend Mentor challenges help you improve your coding skills by building realistic projects.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <Toaster />
      <Navbar />
      <main className="min-h-screen container mx-auto">{children}</main>
      <Footer />
    </Providers>
  );
}
