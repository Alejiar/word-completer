/* ──────────────────────────────────────────────
   Vehicle Entry / Exit Management
   ────────────────────────────────────────────── */

import { useState } from "react";
import { CarFront, Bike, Truck, LogIn, LogOut, Ticket, Copy, Check } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS } from "@/lib/parking-types";
import type { VehicleType, PaymentMethod, Vehicle } from "@/lib/parking-types";
import { formatDateTime, formatCurrency, formatDuration, calcDuration, calcFee } from "@/lib/parking-utils";

const typeIcons: Record<VehicleType, React.ReactNode> = {
  car: <CarFront className="w-5 h-5" />,
  motorcycle: <Bike className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
};

const VehicleEntry = () => {
  const { vehicles, spaces, config, registerEntry, registerExit } = useParkingContext();
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<VehicleType>("car");
  const [lastTicket, setLastTicket] = useState<Vehicle | null>(null);
  const [exitMethod, setExitMethod] = useState<PaymentMethod>("cash");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const parked = vehicles
    .filter((v) => v.status === "parked")
    .filter((v) => !search || v.plate.includes(search.toUpperCase()));

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const v = registerEntry(plate, type);
    if (v) {
      setLastTicket(v);
      setPlate("");
    }
  };

  const handleExit = (vehicleId: string) => {
    registerExit(vehicleId, exitMethod);
  };

  const copyTicket = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Entradas / Salidas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Form */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <LogIn className="w-5 h-5 text-parking-accent" />
            <h3 className="font-semibold text-foreground text-lg">Registrar Entrada</h3>
          </div>
          <form onSubmit={handleEntry} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Placa del vehículo</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={7}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50 transition-all font-mono text-lg tracking-wider"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Tipo de vehículo</label>
              <div className="grid grid-cols-3 gap-2">
                {(["car", "motorcycle", "truck"] as VehicleType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all duration-200 ${
                      type === t
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
            <div className="text-xs text-muted-foreground">
              Espacios disponibles:{" "}
              <span className="font-semibold text-foreground">
                {spaces.filter((s) => s.type === type && s.status === "free").length}
              </span>
              /{spaces.filter((s) => s.type === type).length}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-parking-accent text-white font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-parking-accent/30 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Registrar Entrada
            </button>
          </form>

          {/* Last Ticket */}
          {lastTicket && (
            <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-parking-accent/40 bg-parking-accent/5 animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-5 h-5 text-parking-accent" />
                <span className="font-semibold text-foreground">Ticket de Entrada</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Placa: <span className="font-mono font-bold text-foreground">{lastTicket.plate}</span></p>
                <p className="text-muted-foreground">Tipo: <span className="font-semibold text-foreground">{VEHICLE_LABELS[lastTicket.type]}</span></p>
                <p className="text-muted-foreground">Espacio: <span className="font-semibold text-foreground">{spaces.find(s => s.id === lastTicket.spaceId)?.label}</span></p>
                <p className="text-muted-foreground">Hora: <span className="font-semibold text-foreground">{formatDateTime(lastTicket.entryTime)}</span></p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-center font-mono text-lg font-bold text-parking-accent tracking-widest">
                  {lastTicket.ticketCode}
                </code>
                <button
                  onClick={() => copyTicket(lastTicket.ticketCode)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Parked Vehicles / Exit */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-parking-accent" />
              <h3 className="font-semibold text-foreground text-lg">Registrar Salida</h3>
            </div>
            <select
              value={exitMethod}
              onChange={(e) => setExitMethod(e.target.value as PaymentMethod)}
              className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa..."
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50 mb-4 text-sm"
          />

          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
            {parked.map((v) => {
              const now = new Date().toISOString();
              const dur = calcDuration(v.entryTime, now);
              const fee = calcFee(dur, v.type, config);
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                      {typeIcons[v.type]}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-foreground">{v.plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(dur)} · {spaces.find(s => s.id === v.spaceId)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-parking-accent">{formatCurrency(fee)}</span>
                    <button
                      onClick={() => handleExit(v.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"
                    >
                      Salida
                    </button>
                  </div>
                </div>
              );
            })}
            {parked.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay vehículos parqueados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleEntry;
