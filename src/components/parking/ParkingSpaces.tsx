/* ──────────────────────────────────────────────
   Parking Spaces Visualization
   ────────────────────────────────────────────── */

import { useState } from "react";
import { CarFront, Bike, Truck, Lock, Unlock, CalendarCheck, X } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS, SPACE_LABELS } from "@/lib/parking-types";
import type { VehicleType, SpaceStatus } from "@/lib/parking-types";

const typeIcons: Record<VehicleType, React.ReactNode> = {
  car: <CarFront className="w-4 h-4" />,
  motorcycle: <Bike className="w-4 h-4" />,
  truck: <Truck className="w-4 h-4" />,
};

const statusColors: Record<SpaceStatus, string> = {
  free: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700",
  occupied: "bg-red-500/15 border-red-500/40 text-red-700",
  blocked: "bg-slate-400/20 border-slate-400/50 text-slate-500",
  reserved: "bg-amber-500/15 border-amber-500/40 text-amber-700",
};

const ParkingSpaces = () => {
  const { spaces, vehicles, role, toggleSpaceBlock, reserveSpace, unreserveSpace } = useParkingContext();
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<SpaceStatus | "all">("all");

  const filtered = spaces.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const grouped = (["car", "motorcycle", "truck"] as VehicleType[]).map((type) => ({
    type,
    spaces: filtered.filter((s) => s.type === type),
  })).filter(g => g.spaces.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Gestión de Espacios</h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["free", "occupied", "blocked", "reserved"] as SpaceStatus[]).map((status) => (
          <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${statusColors[status]}`}>
            <div className="w-2.5 h-2.5 rounded-full" style={{
              backgroundColor: status === "free" ? "#22c55e" : status === "occupied" ? "#ef4444" : status === "blocked" ? "#94a3b8" : "#eab308"
            }} />
            {SPACE_LABELS[status]}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as VehicleType | "all")}
          className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground"
        >
          <option value="all">Todos los tipos</option>
          <option value="car">Carros</option>
          <option value="motorcycle">Motos</option>
          <option value="truck">Camionetas</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SpaceStatus | "all")}
          className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground"
        >
          <option value="all">Todos los estados</option>
          <option value="free">Libres</option>
          <option value="occupied">Ocupados</option>
          <option value="blocked">Bloqueados</option>
          <option value="reserved">Reservados</option>
        </select>
      </div>

      {/* Spaces Grid */}
      {grouped.map((group) => (
        <div key={group.type} className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
              {typeIcons[group.type]}
            </div>
            <h3 className="font-semibold text-foreground">{VEHICLE_LABELS[group.type]}s</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {group.spaces.filter(s => s.status === "free").length} libres de {group.spaces.length}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {group.spaces.map((space) => {
              const vehicle = space.vehicleId ? vehicles.find(v => v.id === space.vehicleId) : null;
              return (
                <div
                  key={space.id}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 min-h-[70px] transition-all duration-200 hover:scale-105 cursor-pointer group ${statusColors[space.status]}`}
                  title={vehicle ? `${vehicle.plate} - ${VEHICLE_LABELS[vehicle.type]}` : SPACE_LABELS[space.status]}
                >
                  <span className="text-xs font-bold">{space.label}</span>
                  {vehicle && (
                    <span className="text-[10px] font-mono mt-0.5">{vehicle.plate}</span>
                  )}

                  {/* Actions overlay */}
                  {role === "admin" && space.status !== "occupied" && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {space.status === "blocked" ? (
                        <button onClick={() => toggleSpaceBlock(space.id)} className="p-1.5 bg-white rounded-lg" title="Desbloquear">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      ) : space.status === "reserved" ? (
                        <button onClick={() => unreserveSpace(space.id)} className="p-1.5 bg-white rounded-lg" title="Cancelar reserva">
                          <X className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => toggleSpaceBlock(space.id)} className="p-1.5 bg-white rounded-lg" title="Bloquear">
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <button onClick={() => reserveSpace(space.id)} className="p-1.5 bg-white rounded-lg" title="Reservar">
                            <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParkingSpaces;
