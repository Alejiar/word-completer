/* ──────────────────────────────────────────────
   Settings / Configuration
   - Receipts with dirección, teléfono
   - Only carro/moto (no truck)
   ────────────────────────────────────────────── */

import { useState } from "react";
import { Settings as SettingsIcon, DollarSign, ParkingSquare, RotateCcw, Receipt, Timer } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS, RATE_LABELS } from "@/lib/parking-types";
import type { VehicleType, RateType, RatesConfig, ReceiptConfig } from "@/lib/parking-types";

const ParkingSettings = () => {
  const { config, updateConfig } = useParkingContext();
  const [rates, setRates] = useState<RatesConfig>(config.rates);
  const [name, setName] = useState(config.name);
  const [gracePeriod, setGracePeriod] = useState(config.gracePeriod);
  const [receiptEntry, setReceiptEntry] = useState<ReceiptConfig>(config.receiptEntry);
  const [receiptExit, setReceiptExit] = useState<ReceiptConfig>(config.receiptExit);
  const [receiptMonthly, setReceiptMonthly] = useState<ReceiptConfig>(config.receiptMonthly);
  const [activeTab, setActiveTab] = useState<"general" | "rates" | "receipts">("general");

  const handleSave = () => {
    updateConfig({ rates, name, gracePeriod, receiptEntry, receiptExit, receiptMonthly });
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const updateRate = (vType: VehicleType, rType: RateType | "monthly", value: number) => {
    setRates((prev) => ({
      ...prev,
      [vType]: { ...prev[vType], [rType]: value },
    }));
  };

  const rateKeys: (RateType | "monthly")[] = ["hour", "day", "night", "24h", "monthly"];
  const rateKeyLabels: Record<string, string> = {
    ...RATE_LABELS,
    monthly: "Mensual",
  };

  const ReceiptEditor = ({
    label,
    receipt,
    onChange,
  }: {
    label: string;
    receipt: ReceiptConfig;
    onChange: (r: ReceiptConfig) => void;
  }) => (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="font-semibold text-foreground text-sm">{label}</h4>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre / Encabezado</label>
        <input
          type="text"
          value={receipt.headerText}
          onChange={(e) => onChange({ ...receipt, headerText: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Dirección</label>
        <input
          type="text"
          value={receipt.direccion}
          onChange={(e) => onChange({ ...receipt, direccion: e.target.value })}
          placeholder="Calle 123 #45-67"
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Teléfono</label>
        <input
          type="text"
          value={receipt.telefono}
          onChange={(e) => onChange({ ...receipt, telefono: e.target.value })}
          placeholder="3001234567"
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Pie de recibo</label>
        <input
          type="text"
          value={receipt.footerText}
          onChange={(e) => onChange({ ...receipt, footerText: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">URL del Logo</label>
        <input
          type="text"
          value={receipt.logoUrl}
          onChange={(e) => onChange({ ...receipt, logoUrl: e.target.value })}
          placeholder="https://ejemplo.com/logo.png"
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
        />
        {receipt.logoUrl && (
          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
            <img
              src={receipt.logoUrl}
              alt="Logo preview"
              className="max-h-12 max-w-full object-contain mx-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Ancho recibo (mm)</label>
        <select
          value={receipt.widthMm}
          onChange={(e) => onChange({ ...receipt, widthMm: Number(e.target.value) })}
          className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
        >
          <option value={58}>58mm</option>
          <option value={80}>80mm</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground">Configuración</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["general", "General"], ["rates", "Tarifas"], ["receipts", "Recibos"]] as [typeof activeTab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-parking-accent text-white shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <>
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
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
                  <Timer className="w-4 h-4" /> Tiempo de gracia (minutos)
                </label>
                <input
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={30}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aplica después de cada hora completa. Ej: gracia=5 → 1h05min cobra 1h, 1h06min cobra 2h
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <ParkingSquare className="w-5 h-5 text-parking-accent" />
              <h3 className="font-semibold text-foreground text-lg">Espacios Configurados</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(["car", "motorcycle"] as VehicleType[]).map((type) => (
                <div key={type} className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{config.totalSpaces[type]}</p>
                  <p className="text-xs text-muted-foreground">{VEHICLE_LABELS[type]}s</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "rates" && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-parking-accent" />
            <h3 className="font-semibold text-foreground text-lg">Tarifas</h3>
          </div>
          <div className="space-y-6">
            {(["car", "motorcycle"] as VehicleType[]).map((vType) => (
              <div key={vType} className="rounded-xl border border-border p-4">
                <h4 className="font-semibold text-foreground mb-3">{VEHICLE_LABELS[vType]}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rateKeys.map((rType) => (
                    <div key={rType} className="flex items-center justify-between gap-2">
                      <label className="text-sm text-muted-foreground min-w-[80px]">{rateKeyLabels[rType]}</label>
                      <div className="relative flex-1 max-w-[160px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          value={rates[vType][rType]}
                          onChange={(e) => updateRate(vType, rType, Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-foreground text-right text-sm focus:outline-none focus:ring-2 focus:ring-parking-accent/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "receipts" && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Receipt className="w-5 h-5 text-parking-accent" />
            <h3 className="font-semibold text-foreground text-lg">Configuración de Recibos</h3>
          </div>
          <div className="space-y-4">
            <ReceiptEditor label="Recibo de Entrada" receipt={receiptEntry} onChange={setReceiptEntry} />
            <ReceiptEditor label="Recibo de Salida" receipt={receiptExit} onChange={setReceiptExit} />
            <ReceiptEditor label="Recibo Mensualidad" receipt={receiptMonthly} onChange={setReceiptMonthly} />
          </div>
        </div>
      )}

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
