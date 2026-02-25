/* ──────────────────────────────────────────────
   Dashboard Home — Overview Cards & Stats
   ────────────────────────────────────────────── */

import { CarFront, Bike, DollarSign, Clock, Sun, Moon, Timer } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { formatCurrency, formatDuration } from "@/lib/parking-utils";
import { VEHICLE_LABELS, RATE_LABELS } from "@/lib/parking-types";
import type { VehicleType, RateType } from "@/lib/parking-types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const typeIcons: Record<VehicleType, React.ReactNode> = {
  car: <CarFront className="w-6 h-6" />,
  motorcycle: <Bike className="w-6 h-6" />,
};

const rateIcons: Record<RateType, React.ReactNode> = {
  hour: <Clock className="w-5 h-5" />,
  day: <Sun className="w-5 h-5" />,
  night: <Moon className="w-5 h-5" />,
  "24h": <Timer className="w-5 h-5" />,
};

const DashboardHome = () => {
  const { vehicles, payments, spaces } = useParkingContext();

  const parked = vehicles.filter((v) => v.status === "parked");
  const parkedCars = parked.filter((v) => v.type === "car");
  const parkedMotos = parked.filter((v) => v.type === "motorcycle");

  const todayPayments = payments.filter(
    (p) => new Date(p.date).toDateString() === new Date().toDateString()
  );
  const todayIncome = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const avgDuration =
    todayPayments.length > 0
      ? Math.round(todayPayments.reduce((sum, p) => sum + p.duration, 0) / todayPayments.length)
      : 0;

  // Group parked by rate type
  const rateTypeGroups = (["hour", "day", "night", "24h"] as RateType[]).map((rt) => ({
    rateType: rt,
    vehicles: parked.filter((v) => v.rateType === rt),
  }));

  // Occupancy by type
  const occupancyData = (["car", "motorcycle"] as VehicleType[]).map((type) => {
    const total = spaces.filter((s) => s.type === type).length;
    const occupied = spaces.filter((s) => s.type === type && s.status === "occupied").length;
    return { name: VEHICLE_LABELS[type], total, occupied, free: total - occupied, type };
  });

  // Income last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const dayPayments = payments.filter((p) => new Date(p.date).toDateString() === key);
    const total = dayPayments.reduce((s, p) => s + p.amount, 0);
    return { day: d.toLocaleDateString("es-CO", { weekday: "short" }), total };
  });

  // Pie chart for space status
  const statusCounts = [
    { name: "Libres", value: spaces.filter((s) => s.status === "free").length, color: "#22c55e" },
    { name: "Ocupados", value: spaces.filter((s) => s.status === "occupied").length, color: "#ef4444" },
    { name: "Bloqueados", value: spaces.filter((s) => s.status === "blocked").length, color: "#94a3b8" },
    { name: "Reservados", value: spaces.filter((s) => s.status === "reserved").length, color: "#eab308" },
  ].filter((s) => s.value > 0);

  const cards = [
    { label: "Carros Activos", value: parkedCars.length, icon: <CarFront className="w-6 h-6" />, color: "bg-blue-500/10 text-blue-600" },
    { label: "Motos Activas", value: parkedMotos.length, icon: <Bike className="w-6 h-6" />, color: "bg-violet-500/10 text-violet-600" },
    { label: "Ingresos Hoy", value: formatCurrency(todayIncome), icon: <DollarSign className="w-6 h-6" />, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Tiempo Promedio", value: formatDuration(avgDuration), icon: <Clock className="w-6 h-6" />, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-card border border-border p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicles by Rate Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rateTypeGroups.map((g) => (
          <div key={g.rateType} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                {rateIcons[g.rateType]}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{RATE_LABELS[g.rateType]}</p>
                <p className="text-xs text-muted-foreground">{g.vehicles.length} vehículos</p>
              </div>
            </div>
            {g.vehicles.length > 0 ? (
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {g.vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-foreground">{v.plate}</span>
                    <span className="text-muted-foreground">{VEHICLE_LABELS[v.type]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sin vehículos</p>
            )}
          </div>
        ))}
      </div>

      {/* Occupancy by type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {occupancyData.map((d) => {
          const pct = d.total > 0 ? Math.round((d.occupied / d.total) * 100) : 0;
          return (
            <div key={d.name} className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                  {typeIcons[d.type]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.occupied}/{d.total} ocupados</p>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: pct > 80 ? "#ef4444" : pct > 50 ? "#eab308" : "#22c55e" }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground mt-1">{pct}%</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Ingresos últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="hsl(var(--parking-accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Estado de Espacios</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {statusCounts.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Actividad Reciente</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Placa</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cobro</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Estado</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Espacio</th>
              </tr>
            </thead>
            <tbody>
              {parked.slice(0, 8).map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{v.plate}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{VEHICLE_LABELS[v.type]}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{RATE_LABELS[v.rateType]}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Parqueado</span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{spaces.find((s) => s.id === v.spaceId)?.label ?? v.spaceId}</td>
                </tr>
              ))}
              {parked.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No hay vehículos parqueados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
