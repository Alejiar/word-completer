/* ──────────────────────────────────────────────
   Parking Spaces Management
   ────────────────────────────────────────────── */

import { CarFront, Bike, Lock, Unlock, BookmarkPlus, BookmarkMinus } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS, SPACE_LABELS } from "@/lib/parking-types";
import type { VehicleType, SpaceStatus } from "@/lib/parking-types";

const statusColors: Record<SpaceStatus, string> = {
  free: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
  occupied: "bg-red-500/10 border-red-500/30 text-red-700",
  blocked: "bg-muted border-border text-muted-foreground",
  reserved: "bg-amber-500/10 border-amber-500/30 text-amber-700",
};

const typeIcons: Record<VehicleType, React.ReactNode> = {
  car: <CarFront className="w-4 h-4" />,
  motorcycle: <Bike className="w-4 h-4" />,
};

const ParkingSpaces = () => {
  const { spaces, vehicles, role, toggleSpaceBlock, reserveSpace, unreserveSpace } = useParkingContext();
  const types: VehicleType[] = ["car", "motorcycle"];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Gestión de Espacios</h2>

      {types.map((type) => {
        const typeSpaces = spaces.filter((s) => s.type === type);
        const free = typeSpaces.filter((s) => s.status === "free").length;
        const occupied = typeSpaces.filter((s) => s.status === "occupied").length;

        return (
          <div key={type} className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                  {typeIcons[type]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{VEHICLE_LABELS[type]}s</h3>
                  <p className="text-xs text-muted-foreground">{free} libres · {occupied} ocupados · {typeSpaces.length} total</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {typeSpaces.map((space) => {
                const vehicle = space.vehicleId ? vehicles.find((v) => v.id === space.vehicleId) : null;
                return (
                  <div
                    key={space.id}
                    className={`relative p-2 rounded-xl border-2 text-center transition-all duration-200 ${statusColors[space.status]} group cursor-default`}
                    title={`${space.label} — ${SPACE_LABELS[space.status]}${vehicle ? ` (${vehicle.plate})` : ""}`}
                  >
                    <p className="font-mono font-bold text-xs">{space.label}</p>
                    <p className="text-[9px] mt-0.5">{SPACE_LABELS[space.status]}</p>
                    {vehicle && <p className="text-[9px] font-mono mt-0.5 font-semibold">{vehicle.plate}</p>}
                    {role === "admin" && space.status !== "occupied" && (
                      <div className="absolute inset-0 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {space.status === "free" && (
                          <>
                            <button onClick={() => toggleSpaceBlock(space.id)} className="p-1 rounded bg-muted hover:bg-border transition-colors" title="Bloquear"><Lock className="w-3 h-3" /></button>
                            <button onClick={() => reserveSpace(space.id)} className="p-1 rounded bg-muted hover:bg-border transition-colors" title="Reservar"><BookmarkPlus className="w-3 h-3" /></button>
                          </>
                        )}
                        {space.status === "blocked" && (
                          <button onClick={() => toggleSpaceBlock(space.id)} className="p-1 rounded bg-muted hover:bg-border transition-colors" title="Desbloquear"><Unlock className="w-3 h-3" /></button>
                        )}
                        {space.status === "reserved" && (
                          <button onClick={() => unreserveSpace(space.id)} className="p-1 rounded bg-muted hover:bg-border transition-colors" title="Quitar reserva"><BookmarkMinus className="w-3 h-3" /></button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-4">
        {(Object.entries(SPACE_LABELS) as [SpaceStatus, string][]).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border-2 ${statusColors[status]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingSpaces;
