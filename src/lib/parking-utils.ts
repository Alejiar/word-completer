/* ──────────────────────────────────────────────
   Parking Management System — Utility Functions
   ────────────────────────────────────────────── */

import type { ParkingSpace, ParkingConfig, Vehicle, Payment, VehicleType, RateType } from "./parking-types";

/** Generate a unique ID */
export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

/** Generate a ticket code */
export const generateTicketCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "PKS-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

/** Auto-detect vehicle type from plate last character */
export const detectVehicleType = (plate: string): VehicleType | null => {
  const p = plate.toUpperCase().trim();
  if (p.length !== 6) return null;
  const lastChar = p[5];
  if (/[0-9]/.test(lastChar)) return "car";
  if (/[A-Z]/.test(lastChar)) return "motorcycle";
  return null;
};

/** Calculate parking duration in minutes */
export const calcDuration = (entry: string, exit: string): number => {
  const diff = new Date(exit).getTime() - new Date(entry).getTime();
  return Math.max(1, Math.ceil(diff / 60000));
};

/**
 * Calculate fee based on duration, vehicle type, rate type, config, and convenio.
 * Convenio: discounts 1 hour (applied ONLY at exit).
 */
export const calcFee = (
  minutes: number,
  type: VehicleType,
  rateType: RateType,
  config: ParkingConfig,
  convenio: boolean = false
): number => {
  const rate = config.rates[type][rateType];

  if (rateType !== "hour") {
    if (convenio) {
      const hourRate = config.rates[type].hour;
      return Math.max(0, rate - hourRate);
    }
    return rate;
  }

  // Hourly calculation with grace period
  const grace = config.gracePeriod ?? 5;
  const hours = Math.max(1, Math.ceil((minutes - grace) / 60));
  const billableHours = convenio ? Math.max(1, hours - 1) : hours;
  return billableHours * rate;
};

/** Validate plate: exactly 6 chars, auto-detect type */
export const validatePlate = (plate: string): { valid: boolean; error?: string; type?: VehicleType } => {
  const p = plate.toUpperCase().trim();
  if (p.length !== 6) {
    return { valid: false, error: "La placa debe tener exactamente 6 caracteres" };
  }
  if (!/^[A-Z0-9]{6}$/.test(p)) {
    return { valid: false, error: "La placa solo puede contener letras y números" };
  }
  const type = detectVehicleType(p);
  if (!type) {
    return { valid: false, error: "No se pudo detectar el tipo de vehículo" };
  }
  return { valid: true, type };
};

/** Format currency */
export const formatCurrency = (amount: number): string =>
  `$${amount.toLocaleString("es-CO")}`;

/** Format date/time */
export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

/** Format duration */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}min`;
};

/** Initialize parking spaces from config */
export const initSpaces = (config: ParkingConfig): ParkingSpace[] => {
  const spaces: ParkingSpace[] = [];
  const types: VehicleType[] = ["car", "motorcycle"];
  const prefixes = { car: "C", motorcycle: "M" };
  types.forEach((type) => {
    for (let i = 1; i <= config.totalSpaces[type]; i++) {
      spaces.push({
        id: `${type}-${i}`,
        label: `${prefixes[type]}${i.toString().padStart(2, "0")}`,
        type,
        status: "free",
      });
    }
  });
  return spaces;
};

/** Export data to CSV */
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => `"${row[h] ?? ""}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Export data to JSON */
export const exportToJSON = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Get storage data or default */
export const loadState = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/** Save to localStorage */
export const saveState = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/** Print a receipt element */
export const printReceipt = (elementId: string, widthMm: number = 58) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  const printWindow = window.open("", "_blank", `width=${widthMm * 3.78},height=600`);
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: ${widthMm}mm auto; margin: 2mm; }
        body { font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 4px; width: ${widthMm}mm; }
        .receipt-logo { max-width: ${widthMm - 10}mm; max-height: 30mm; display: block; margin: 0 auto 4px; object-fit: contain; }
        .receipt-header { text-align: center; font-weight: bold; font-size: 13px; margin-bottom: 4px; }
        .receipt-line { border-top: 1px dashed #000; margin: 4px 0; }
        .receipt-row { display: flex; justify-content: space-between; }
        .receipt-footer { text-align: center; font-size: 10px; margin-top: 6px; }
        .receipt-bold { font-weight: bold; }
      </style>
    </head>
    <body>${el.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
};

/** Seed demo data */
export const seedDemoData = (config: ParkingConfig) => {
  const spaces = initSpaces(config);
  const vehicles: Vehicle[] = [];
  const payments: Payment[] = [];
  const rateTypes: RateType[] = ["hour", "day", "night", "24h"];
  const types: VehicleType[] = ["car", "motorcycle"];

  const demoPlates = ["ABC123", "XYZ789", "MOT45C"];
  demoPlates.forEach((plate, i) => {
    const type = detectVehicleType(plate) ?? "car";
    const space = spaces.find((s) => s.type === type && s.status === "free");
    if (!space) return;
    const entryTime = new Date(Date.now() - (60 + i * 45) * 60000).toISOString();
    const vid = generateId();
    vehicles.push({
      id: vid, plate, type, rateType: "hour", entryTime,
      spaceId: space.id, status: "parked", ticketCode: generateTicketCode(),
      helmetNumber: type === "motorcycle" ? "C-" + Math.floor(100 + Math.random() * 900) : undefined,
    });
    space.status = "occupied";
    space.vehicleId = vid;
  });

  for (let d = 0; d < 7; d++) {
    const count = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < count; j++) {
      const type = types[Math.floor(Math.random() * 2)];
      const rateType = rateTypes[Math.floor(Math.random() * rateTypes.length)];
      const entry = new Date(Date.now() - (d * 86400000 + Math.random() * 86400000));
      const duration = 30 + Math.floor(Math.random() * 300);
      const exit = new Date(entry.getTime() + duration * 60000);
      const vid = generateId();
      const amount = calcFee(duration, type, rateType, config);
      const lastCharPool = type === "motorcycle" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";
      vehicles.push({
        id: vid,
        plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(10 + Math.random() * 90)}${lastCharPool[Math.floor(Math.random() * lastCharPool.length)]}`,
        type, rateType, entryTime: entry.toISOString(), exitTime: exit.toISOString(),
        spaceId: `${type}-${Math.floor(Math.random() * config.totalSpaces[type]) + 1}`,
        status: "exited", ticketCode: generateTicketCode(),
      });
      payments.push({
        id: generateId(), vehicleId: vid, plate: vehicles[vehicles.length - 1].plate,
        amount, subtotal: amount, discount: 0,
        method: Math.random() > 0.5 ? "cash" : "card", status: "paid",
        date: exit.toISOString(), vehicleType: type, rateType, duration, convenio: false,
      });
    }
  }

  return { vehicles, payments, spaces };
};
