"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  FileText,
  GitCompare,
  MessageSquare,
  CheckSquare,
  Sparkles,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Scale,
  ArrowRight,
  Zap,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleTryDemo = async () => {
    setIsSeedingDemo(true);
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (data?.activeDemoDocId) {
        router.push(`/documents/${data.activeDemoDocId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Try demo error:", err);
      router.push("/dashboard");
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Scale },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/chat", label: "Ask Lexora", icon: MessageSquare },
    { href: "/checklists", label: "Checklists", icon: CheckSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1f2333] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 group-hover:border-blue-500 transition-colors">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-white text-lg">Lexora</span>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                AI Legal
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">Legal intelligence for everyone</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#181b28] text-white border border-[#262b3d]"
                    : "text-gray-400 hover:bg-[#141724] hover:text-gray-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleTryDemo}
            disabled={isSeedingDemo}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isSeedingDemo ? "Loading Demo..." : "Try Demo"}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1f2333]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs font-semibold text-blue-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-medium text-gray-200 truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-gray-400 hover:text-rose-400 rounded-md hover:bg-[#141724] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#1a1e2d] border border-[#2a3048] px-3.5 py-1.5 text-xs font-medium text-gray-100 hover:bg-[#23283c] transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleTryDemo}
            disabled={isSeedingDemo}
            className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white"
          >
            {isSeedingDemo ? "..." : "Demo"}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#1f2333] bg-[#0d0f18] px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#181b28] hover:text-white"
              >
                <Icon className="h-4 w-4 text-blue-400" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#1f2333] space-y-2">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-sm font-medium text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg border border-[#2a3048] py-2 text-center text-xs font-medium text-gray-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg bg-blue-600 py-2 text-center text-xs font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
