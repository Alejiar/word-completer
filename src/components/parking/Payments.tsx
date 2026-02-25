/* ──────────────────────────────────────────────
   Payments Management
   ────────────────────────────────────────────── */

import { useState } from "react";
import { CreditCard, Banknote, Search, Filter } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS, RATE_LABELS } from "@/lib/parking-types";
import type { PaymentMethod, VehicleType } from "@/lib/parking-types";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/parking-utils";

const Payments = () => {
  const { payments } = useParkingContext();
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "all">("all");
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");

  const filtered = payments.filter((p) => {
    if (search && !p.plate.includes(search.toUpperCase())) return false;
    if (filterMethod !== "all" && p.method !== filterMethod) return false;
    if (filterType !== "all" && p.vehicleType !== filterType) return false;
    return true;
  });

  const totalFiltered = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Gestión de Pagos</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Efectivo</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(payments.filter(p => p.method === "cash").reduce((s, p) => s + p.amount, 0))}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tarjeta</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(payments.filter(p => p.method === "card").reduce((s, p) => s + p.amount, 0))}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-parking-accent/10 flex items-center justify-center">
            <Filter className="w-6 h-6 text-parking-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Filtrado</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalFiltered)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
          />
        </div>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | "all")}
          className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground"
        >
          <option value="all">Todos los métodos</option>
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as VehicleType | "all")}
          className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground"
        >
          <option value="all">Todos los tipos</option>
          <option value="car">Carro</option>
          <option value="motorcycle">Moto</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fecha</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Placa</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cobro</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Duración</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Método</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">{formatDateTime(p.date)}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">{p.plate}</td>
                  <td className="py-3 px-4 text-muted-foreground">{VEHICLE_LABELS[p.vehicleType]}</td>
                  <td className="py-3 px-4 text-muted-foreground">{RATE_LABELS[p.rateType]}</td>
                  <td className="py-3 px-4 text-muted-foreground">{formatDuration(p.duration)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.method === "cash" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {p.method === "cash" ? "Efectivo" : "Tarjeta"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      {p.convenio && p.discount > 0 && (
                        <span className="text-[10px] text-muted-foreground line-through block">{formatCurrency(p.subtotal)}</span>
                      )}
                      <span className="font-semibold text-parking-accent">{formatCurrency(p.amount)}</span>
                      {p.convenio && <span className="text-[10px] text-emerald-600 block">Convenio</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No se encontraron pagos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
