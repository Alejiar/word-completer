/* ──────────────────────────────────────────────
   Mensualidades (Monthly Subscriptions)
   ────────────────────────────────────────────── */

import { useState } from "react";
import { CalendarCheck, Plus, Trash2, CreditCard, CarFront, Bike, Truck } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS } from "@/lib/parking-types";
import type { VehicleType } from "@/lib/parking-types";
import { formatCurrency, formatDateTime, validatePlate } from "@/lib/parking-utils";

const typeIcons: Record<VehicleType, React.ReactNode> = {
  car: <CarFront className="w-5 h-5" />,
  motorcycle: <Bike className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
};

const Mensualidades = () => {
  const { monthlySubs, config, addMonthlySub, payMonthlySub, deleteMonthlySub } = useParkingContext();
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState("");
  const [clientName, setClientName] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [cutDay, setCutDay] = useState(1);

  const price = config.rates[vehicleType].monthly;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = plate.toUpperCase().trim();
    const validation = validatePlate(normalized, vehicleType);
    if (!validation.valid) {
      return; // alert is shown by context
    }
    addMonthlySub({
      plate: normalized,
      clientName: clientName.trim(),
      vehicleType,
      startDate: new Date().toISOString(),
      cutDay,
      price,
    });
    setPlate("");
    setClientName("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">Mensualidades</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-parking-accent text-white text-sm font-semibold hover:brightness-110 transition-all shadow-md shadow-parking-accent/30"
        >
          <Plus className="w-4 h-4" />
          Nueva Mensualidad
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-2xl bg-card border border-border p-6 animate-scale-in">
          <h3 className="font-semibold text-foreground text-lg mb-4">Registrar Mensualidad</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Placa (6 caracteres)</label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  maxLength={6}
                  placeholder={vehicleType === "motorcycle" ? "HOQ79C" : "MTV192"}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-mono text-lg tracking-wider placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Nombre del cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Tipo de vehículo</label>
              <div className="grid grid-cols-3 gap-2">
                {(["car", "motorcycle", "truck"] as VehicleType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setVehicleType(t)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all duration-200 ${
                      vehicleType === t
                        ? "border-parking-accent bg-parking-accent/10 text-parking-accent"
                        : "border-border text-muted-foreground hover:border-parking-accent/40"
                    }`}
                  >
                    {typeIcons[t]}
                    <span className="text-xs font-medium">{VEHICLE_LABELS[t]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Día de corte</label>
                <input
                  type="number"
                  value={cutDay}
                  onChange={(e) => setCutDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                  min={1}
                  max={31}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Precio mensual</label>
                <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground font-bold text-lg">
                  {formatCurrency(price)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-parking-accent text-white font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-parking-accent/30"
              >
                Registrar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-muted transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {monthlySubs.length === 0 && (
          <div className="rounded-2xl bg-card border border-border p-12 text-center">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay mensualidades registradas</p>
          </div>
        )}
        {monthlySubs.map((sub) => (
          <div key={sub.id} className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                {typeIcons[sub.vehicleType]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-lg">{sub.plate}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    sub.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {sub.status === "active" ? "ACTIVO" : "PENDIENTE"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{sub.clientName} · {VEHICLE_LABELS[sub.vehicleType]}</p>
                <p className="text-xs text-muted-foreground">
                  Corte: día {sub.cutDay} · {formatCurrency(sub.price)}/mes
                </p>
                {sub.payments.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Último pago: {formatDateTime(sub.payments[sub.payments.length - 1].date)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {sub.status === "pending" && (
                <button
                  onClick={() => payMonthlySub(sub.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Pagar
                </button>
              )}
              <button
                onClick={() => deleteMonthlySub(sub.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mensualidades;
