"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features", scroll: true },
  { label: "How It Works", href: "/#how-it-works", scroll: true },
  { label: "Pricing", href: "/#pricing", scroll: true },
  { label: "Partnerships", href: "/#partnerships", scroll: true },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-xl tracking-tight"
        >
          <span className="text-primary">UZIMA</span>
          <span className="text-foreground">CARE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(item.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground",
              )}
              onClick={() => {
                if (item.scroll) {
                  setTimeout(() => {
                    document
                      .getElementById(item.href.replace("#", ""))
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }, 100);
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth / CTA Buttons – Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()} // ← fixed: no {redirectTo}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-medium py-2 transition-colors hover:text-primary",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                onClick={() => {
                  setMobileOpen(false);
                  if (item.scroll) {
                    setTimeout(() => {
                      document
                        .getElementById(item.href.replace("#", ""))
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }, 150);
                  }
                }}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-4 pt-4 border-t">
              {isLoading ? (
                <span className="text-center text-muted-foreground">
                  Loading...
                </span>
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button className="bg-primary hover:bg-primary/90 w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => signOut()} // ← fixed here too
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
