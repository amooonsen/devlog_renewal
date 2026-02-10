import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Mail,
  LogOut,
} from "lucide-react";
import { Button, Separator } from "@repo/ui";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

const navItems: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Posts",
    href: "/posts",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Comments",
    href: "/comments",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: <Mail className="h-4 w-4" />,
  },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="p-4">
          <h1 className="text-lg font-bold">DevLog Admin</h1>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="p-4">
          <p className="mb-2 truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-3 w-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
