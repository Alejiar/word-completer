/* ──────────────────────────────────────────────
   Sidebar Navigation Component
   ────────────────────────────────────────────── */

import { useState } from "react";
import {
  LayoutDashboard, CarFront, CreditCard, ParkingSquare,
  BarChart3, Settings, Menu, X, ShieldCheck, User,
} from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";

export type SectionId = "dashboard" | "vehicles" | "payments" | "spaces" | "reports" | "settings";

interface SidebarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}

const links: { id: SectionId; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "vehicles", label: "Entradas / Salidas", icon: <CarFront className="w-5 h-5" /> },
  { id: "payments", label: "Pagos", icon: <CreditCard className="w-5 h-5" /> },
  { id: "spaces", label: "Espacios", icon: <ParkingSquare className="w-5 h-5" /> },
  { id: "reports", label: "Reportes", icon: <BarChart3 className="w-5 h-5" />, adminOnly: true },
  { id: "settings", label: "Configuración", icon: <Settings className="w-5 h-5" />, adminOnly: true },
];

const Sidebar = ({ active, onNavigate }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  const { role, setRole } = useParkingContext();

  const visibleLinks = links.filter((l) => !l.adminOnly || role === "admin");

  const nav = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-parking-accent flex items-center justify-center">
          <ParkingSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">ParkSystem</h1>
          <p className="text-xs text-muted-foreground">Gestión Profesional</p>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {visibleLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => { onNavigate(link.id); setOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              active === link.id
                ? "bg-parking-accent text-white shadow-md shadow-parking-accent/30"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
      </nav>

      {/* Role Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setRole(role === "admin" ? "cashier" : "admin")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          {role === "admin" ? (
            <ShieldCheck className="w-5 h-5 text-parking-accent" />
          ) : (
            <User className="w-5 h-5 text-parking-accent" />
          )}
          <div className="text-left">
            <p className="font-semibold capitalize">{role === "admin" ? "Administrador" : "Cajero"}</p>
            <p className="text-xs text-muted-foreground">Cambiar rol</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-xl bg-parking-accent text-white flex items-center justify-center shadow-lg"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-sidebar-background border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:top-0 md:h-screen`}
      >
        {nav}
      </aside>
    </>
  );
};

export default Sidebar;
