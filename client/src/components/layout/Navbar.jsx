import { NavLink } from "react-router-dom";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/convert", label: "Convert" },
  { to: "/trends", label: "Trends" },
  { to: "/budget", label: "Budget" },
  { to: "/favorites", label: "Favorites" },
  { to: "/showcase", label: "Visuals" },
];

export function Navbar({ backendDown }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4.5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-700 tracking-tight">
            FX<span className="text-primary">Pulse</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              backendDown
                ? "border-destructive/40 text-destructive"
                : "border-success/30 text-success"
            )}
          >
            <span className={cn("size-1.5 rounded-full", backendDown ? "bg-destructive" : "bg-success animate-pulse")} />
            {backendDown ? "API offline" : "Live rates"}
          </span>
          <Button size="sm" asChild>
            <NavLink to="/convert">Launch app</NavLink>
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
