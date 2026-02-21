/* ──────────────────────────────────────────────
   Reports & Export
   ────────────────────────────────────────────── */

import { useState } from "react";
import { Download, FileSpreadsheet, FileJson, CalendarDays } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS } from "@/lib/parking-types";
import { formatCurrency, formatDateTime, formatDuration, exportToCSV, exportToJSON } from "@/lib/parking-utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type Period = "daily" | "weekly" | "monthly";

const Reports = () => {
  const { vehicles, payments } = useParkingContext();
  const [period, setPeriod] = useState<Period>("daily");

  // Income chart data
  const getChartData = () => {
    const now = new Date();
    if (period === "daily") {
      return Array.from({ length: 24 }, (_, i) => {
        const hourPayments = payments.filter((p) => {
          const d = new Date(p.date);
          return d.toDateString() === now.toDateString() && d.getHours() === i;
        });
        return { label: `${i}:00`, total: hourPayments.reduce((s, p) => s + p.amount, 0) };
      });
    } else if (period === "weekly") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toDateString();
        const dayP = payments.filter((p) => new Date(p.date).toDateString() === key);
        return { label: d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" }), total: dayP.reduce((s, p) => s + p.amount, 0) };
      });
    } else {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = d.toDateString();
        const dayP = payments.filter((p) => new Date(p.date).toDateString() === key);
        return { label: d.getDate().toString(), total: dayP.reduce((s, p) => s + p.amount, 0) };
      });
    }
  };

  const chartData = getChartData();
  const totalInPeriod = chartData.reduce((s, d) => s + d.total, 0);

  // Vehicle history
  const exitedVehicles = vehicles.filter((v) => v.status === "exited").slice(0, 50);

  const handleExportCSV = () => {
    exportToCSV(
      payments.map((p) => ({
        fecha: formatDateTime(p.date),
        placa: p.plate,
        tipo: VEHICLE_LABELS[p.vehicleType],
        duracion: formatDuration(p.duration),
        metodo: p.method === "cash" ? "Efectivo" : "Tarjeta",
        monto: p.amount,
      })),
      "reporte_pagos"
    );
  };

  const handleExportJSON = () => {
    exportToJSON({ payments, vehicles: exitedVehicles }, "reporte_completo");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">Reportes</h2>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </button>
          <button onClick={handleExportJSON} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileJson className="w-4 h-4" /> JSON
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {([["daily", "Hoy"], ["weekly", "Semanal"], ["monthly", "Mensual"]] as [Period, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p
                ? "bg-parking-accent text-white shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Income Chart */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-parking-accent" />
            <h3 className="font-semibold text-foreground">Ingresos</h3>
          </div>
          <p className="text-lg font-bold text-parking-accent">{formatCurrency(totalInPeriod)}</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          {period === "daily" ? (
            <LineChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--parking-accent))" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="hsl(var(--parking-accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Vehicle History */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-parking-accent" />
          Historial de Vehículos
        </h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Placa</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Entrada</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Salida</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {exitedVehicles.map((v) => (
                <tr key={v.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">{v.plate}</td>
                  <td className="py-3 px-4 text-muted-foreground">{VEHICLE_LABELS[v.type]}</td>
                  <td className="py-3 px-4 text-muted-foreground">{formatDateTime(v.entryTime)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{v.exitTime ? formatDateTime(v.exitTime) : "-"}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{v.ticketCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
