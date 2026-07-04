"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";

// Storefront header/footer everywhere except the admin portal, which has its own chrome.
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
    </>
  );
}
