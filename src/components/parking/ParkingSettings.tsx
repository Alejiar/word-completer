/* ──────────────────────────────────────────────
   Settings / Configuration
   ────────────────────────────────────────────── */

import { useState } from "react";
import { Settings as SettingsIcon, DollarSign, ParkingSquare, RotateCcw } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS } from "@/lib/parking-types";
import type { VehicleType } from "@/lib/parking-types";

const ParkingSettings = () => {
  const { config, updateConfig } = useParkingContext();
  const [rates, setRates] = useState(config.rates);
  const [name, setName] = useState(config.name);

  const handleSave = () => {
    updateConfig({ rates, name });
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground">Configuración</h2>

      {/* General */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <SettingsIcon className="w-5 h-5 text-parking-accent" />
          <h3 className="font-semibold text-foreground text-lg">General</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1.5">Nombre del parqueadero</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
            />
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <DollarSign className="w-5 h-5 text-parking-accent" />
          <h3 className="font-semibold text-foreground text-lg">Tarifas por Hora</h3>
        </div>
        <div className="space-y-4">
          {(["car", "motorcycle", "truck"] as VehicleType[]).map((type) => (
            <div key={type} className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-foreground min-w-[100px]">{VEHICLE_LABELS[type]}</label>
              <div className="relative flex-1 max-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={rates[type]}
                  onChange={(e) => setRates({ ...rates, [type]: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
                />
              </div>
              <span className="text-xs text-muted-foreground">/hora</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spaces info */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <ParkingSquare className="w-5 h-5 text-parking-accent" />
          <h3 className="font-semibold text-foreground text-lg">Espacios Configurados</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(["car", "motorcycle", "truck"] as VehicleType[]).map((type) => (
            <div key={type} className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{config.totalSpaces[type]}</p>
              <p className="text-xs text-muted-foreground">{VEHICLE_LABELS[type]}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-parking-accent text-white font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-parking-accent/30"
        >
          Guardar Cambios
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-destructive hover:text-white hover:border-destructive transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar Todo
        </button>
      </div>
    </div>
  );
};

export default ParkingSettings;
