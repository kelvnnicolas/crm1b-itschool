"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  BookOpen,
  GraduationCap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contatos", href: "/contatos", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Tarefas", href: "/tarefas", icon: CheckSquare },
];

const domainItems = [
  { label: "Cursos", href: "/cursos", icon: BookOpen },
  { label: "Alunos", href: "/alunos", icon: GraduationCap },
];

const bottomItems = [
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">IT School</h1>
          <p className="text-xs text-muted-foreground">CRM</p>
        </div>
      </div>

      <Separator />

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          CRM
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-blue-400")} />
                  {item.label}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        <Separator className="my-4" />

        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Escola
        </p>
        {domainItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-blue-400")} />
                  {item.label}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 py-4 border-t border-border">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}