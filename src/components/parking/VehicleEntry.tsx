/* ──────────────────────────────────────────────
   Vehicle Entry / Exit Management
   - Auto-detect vehicle type from plate
   - Convenio ONLY on exit
   - Receipt printing
   ────────────────────────────────────────────── */

import { useState } from "react";
import { CarFront, Bike, LogIn, LogOut, Ticket, Copy, Check, HardHat, Printer, Handshake } from "lucide-react";
import { useParkingContext } from "@/contexts/ParkingContext";
import { VEHICLE_LABELS, RATE_LABELS } from "@/lib/parking-types";
import type { VehicleType, PaymentMethod, Vehicle, Payment, RateType } from "@/lib/parking-types";
import { formatDateTime, formatCurrency, formatDuration, calcDuration, calcFee, detectVehicleType, printReceipt } from "@/lib/parking-utils";

const typeIcons: Record<VehicleType, React.ReactNode> = {
  car: <CarFront className="w-5 h-5" />,
  motorcycle: <Bike className="w-5 h-5" />,
};

const VehicleEntry = () => {
  const { vehicles, spaces, config, registerEntry, registerExit } = useParkingContext();
  const [plate, setPlate] = useState("");
  const [rateType, setRateType] = useState<RateType>("hour");
  const [helmetNumber, setHelmetNumber] = useState("");
  const [lastTicket, setLastTicket] = useState<Vehicle | null>(null);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [exitMethod, setExitMethod] = useState<PaymentMethod>("cash");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [convenioMap, setConvenioMap] = useState<Record<string, boolean>>({});

  const detectedType = detectVehicleType(plate);

  const parked = vehicles
    .filter((v) => v.status === "parked")
    .filter((v) => !search || v.plate.includes(search.toUpperCase()));

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const v = registerEntry(plate, rateType, helmetNumber);
    if (v) {
      setLastTicket(v);
      setLastPayment(null);
      setPlate("");
      setHelmetNumber("");
    }
  };

  const handleExit = (vehicleId: string) => {
    const convenio = convenioMap[vehicleId] ?? false;
    const payment = registerExit(vehicleId, exitMethod, convenio);
    if (payment) {
      setLastPayment(payment);
      setLastTicket(null);
      setConvenioMap((prev) => {
        const next = { ...prev };
        delete next[vehicleId];
        return next;
      });
    }
  };

  const toggleConvenio = (vehicleId: string) => {
    setConvenioMap((prev) => ({ ...prev, [vehicleId]: !prev[vehicleId] }));
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
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Placa del vehículo (6 caracteres)</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="ABC123 ó HOQ79C"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50 transition-all font-mono text-lg tracking-wider"
                required
              />
              {plate.length === 6 && detectedType && (
                <div className="mt-2 flex items-center gap-2 text-sm animate-fade-in">
                  <div className="w-7 h-7 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                    {typeIcons[detectedType]}
                  </div>
                  <span className="font-medium text-foreground">
                    Detectado: <span className="text-parking-accent">{VEHICLE_LABELS[detectedType]}</span>
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Termina en número → Carro · Termina en letra → Moto
              </p>
            </div>

            {/* Rate Type */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Tipo de cobro</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["hour", "day", "night", "24h"] as RateType[]).map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => setRateType(rt)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all duration-200 ${
                      rateType === rt
                        ? "border-parking-accent bg-parking-accent/10 text-parking-accent"
                        : "border-border text-muted-foreground hover:border-parking-accent/40"
                    }`}
                  >
                    {RATE_LABELS[rt]}
                  </button>
                ))}
              </div>
              {detectedType && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tarifa: {formatCurrency(config.rates[detectedType][rateType])}
                </p>
              )}
            </div>

            {/* Helmet Number for motorcycles */}
            {detectedType === "motorcycle" && (
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
                  <HardHat className="w-4 h-4" /> Número de Casco (obligatorio)
                </label>
                <input
                  type="text"
                  value={helmetNumber}
                  onChange={(e) => setHelmetNumber(e.target.value)}
                  placeholder="Ej: C-001"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-parking-accent/50 transition-all font-mono"
                  required
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Espacios disponibles:{" "}
              {detectedType ? (
                <span className="font-semibold text-foreground">
                  {spaces.filter((s) => s.type === detectedType && s.status === "free").length}
                  /{spaces.filter((s) => s.type === detectedType).length}
                </span>
              ) : "Ingrese placa completa"}
            </div>
            <button
              type="submit"
              disabled={!detectedType}
              className="w-full py-3 rounded-xl bg-parking-accent text-white font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-parking-accent/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              Registrar Entrada
            </button>
          </form>

          {/* Last Entry Ticket */}
          {lastTicket && (
            <div id="receipt-entry" className="mt-5 p-4 rounded-xl border-2 border-dashed border-parking-accent/40 bg-parking-accent/5 animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-5 h-5 text-parking-accent" />
                <span className="font-semibold text-foreground">Ticket de Entrada</span>
              </div>
              {config.receiptEntry.logoUrl && (
                <img src={config.receiptEntry.logoUrl} alt="Logo" className="receipt-logo max-h-10 max-w-full object-contain mx-auto mb-2" />
              )}
              <div className="receipt-header text-center font-bold text-sm mb-1">{config.receiptEntry.headerText}</div>
              {config.receiptEntry.direccion && <p className="text-center text-xs text-muted-foreground">{config.receiptEntry.direccion}</p>}
              {config.receiptEntry.telefono && <p className="text-center text-xs text-muted-foreground">Tel: {config.receiptEntry.telefono}</p>}
              <div className="receipt-line border-t border-dashed border-border my-2" />
              <div className="space-y-1 text-sm">
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Placa:</span><span className="font-mono font-bold text-foreground">{lastTicket.plate}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Tipo:</span><span className="font-semibold text-foreground">{VEHICLE_LABELS[lastTicket.type]}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Cobro:</span><span className="font-semibold text-foreground">{RATE_LABELS[lastTicket.rateType]}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Espacio:</span><span className="font-semibold text-foreground">{spaces.find(s => s.id === lastTicket.spaceId)?.label}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Hora:</span><span className="font-semibold text-foreground">{formatDateTime(lastTicket.entryTime)}</span></div>
                {lastTicket.helmetNumber && (
                  <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Casco:</span><span className="font-semibold text-foreground">{lastTicket.helmetNumber}</span></div>
                )}
              </div>
              <div className="receipt-line border-t border-dashed border-border my-2" />
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-center font-mono text-lg font-bold text-parking-accent tracking-widest">
                  {lastTicket.ticketCode}
                </code>
                <button onClick={() => copyTicket(lastTicket.ticketCode)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copiar código">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <p className="receipt-footer text-center text-xs text-muted-foreground mt-2">{config.receiptEntry.footerText}</p>
              <button
                onClick={() => printReceipt("receipt-entry", config.receiptEntry.widthMm)}
                className="w-full mt-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir Recibo
              </button>
            </div>
          )}

          {/* Last Exit Receipt */}
          {lastPayment && (
            <div id="receipt-exit" className="mt-5 p-4 rounded-xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <LogOut className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-foreground">Recibo de Salida</span>
              </div>
              {config.receiptExit.logoUrl && (
                <img src={config.receiptExit.logoUrl} alt="Logo" className="receipt-logo max-h-10 max-w-full object-contain mx-auto mb-2" />
              )}
              <div className="receipt-header text-center font-bold text-sm mb-1">{config.receiptExit.headerText}</div>
              {config.receiptExit.direccion && <p className="text-center text-xs text-muted-foreground">{config.receiptExit.direccion}</p>}
              {config.receiptExit.telefono && <p className="text-center text-xs text-muted-foreground">Tel: {config.receiptExit.telefono}</p>}
              <div className="receipt-line border-t border-dashed border-border my-2" />
              <div className="space-y-1 text-sm">
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Placa:</span><span className="font-mono font-bold text-foreground">{lastPayment.plate}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Tipo:</span><span className="font-semibold text-foreground">{VEHICLE_LABELS[lastPayment.vehicleType]}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Duración:</span><span className="font-semibold text-foreground">{formatDuration(lastPayment.duration)}</span></div>
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Método:</span><span className="font-semibold text-foreground">{lastPayment.method === "cash" ? "Efectivo" : "Tarjeta"}</span></div>
                <div className="receipt-line border-t border-dashed border-border my-2" />
                <div className="receipt-row flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="font-semibold text-foreground">{formatCurrency(lastPayment.subtotal)}</span></div>
                {lastPayment.convenio && (
                  <>
                    <div className="receipt-row flex justify-between"><span className="text-emerald-600">Descuento convenio:</span><span className="font-semibold text-emerald-600">-{formatCurrency(lastPayment.discount)}</span></div>
                    <p className="text-xs text-emerald-600 font-medium">✓ Aplicó convenio</p>
                  </>
                )}
                <div className="receipt-row flex justify-between text-base"><span className="font-bold text-foreground">TOTAL:</span><span className="font-bold text-parking-accent">{formatCurrency(lastPayment.amount)}</span></div>
              </div>
              <p className="receipt-footer text-center text-xs text-muted-foreground mt-2">{config.receiptExit.footerText}</p>
              <button
                onClick={() => printReceipt("receipt-exit", config.receiptExit.widthMm)}
                className="w-full mt-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir Recibo
              </button>
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

          <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1">
            {parked.map((v) => {
              const now = new Date().toISOString();
              const dur = calcDuration(v.entryTime, now);
              const isConvenio = convenioMap[v.id] ?? false;
              const subtotal = calcFee(dur, v.type, v.rateType, config, false);
              const fee = calcFee(dur, v.type, v.rateType, config, isConvenio);
              const discount = subtotal - fee;
              return (
                <div key={v.id} className="p-3 rounded-xl border border-border hover:bg-muted/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-parking-accent/10 text-parking-accent flex items-center justify-center">
                        {typeIcons[v.type]}
                      </div>
                      <div>
                        <p className="font-mono font-bold text-foreground">{v.plate}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(dur)} · {spaces.find(s => s.id === v.spaceId)?.label} · {RATE_LABELS[v.rateType]}
                        </p>
                        {v.helmetNumber && <span className="text-[10px] text-muted-foreground">🪖 {v.helmetNumber}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {isConvenio && discount > 0 && (
                          <span className="text-[10px] text-muted-foreground line-through block">{formatCurrency(subtotal)}</span>
                        )}
                        <span className="text-sm font-bold text-parking-accent">{formatCurrency(fee)}</span>
                        {isConvenio && <span className="text-[10px] text-emerald-600 block">-{formatCurrency(discount)}</span>}
                      </div>
                      <button
                        onClick={() => handleExit(v.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"
                      >
                        Salida
                      </button>
                    </div>
                  </div>
                  {/* Convenio toggle — ONLY at exit */}
                  <button
                    onClick={() => toggleConvenio(v.id)}
                    className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      isConvenio
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-border text-muted-foreground hover:border-parking-accent/40"
                    }`}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    {isConvenio ? "✓ Convenio aplicado (−1 hora)" : "Aplicar convenio"}
                  </button>
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
