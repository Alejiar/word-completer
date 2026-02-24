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

/** Calculate parking duration in minutes */
export const calcDuration = (entry: string, exit: string): number => {
  const diff = new Date(exit).getTime() - new Date(entry).getTime();
  return Math.max(1, Math.ceil(diff / 60000));
};

/**
 * Calculate fee based on duration, vehicle type, rate type, config, and convenio.
 *
 * For "hour" rate:
 *   - First hour charged from minute 1.
 *   - Grace period applies after each full hour.
 *   - hours = max(1, ceil((minutes - gracePeriod) / 60))
 *
 * For "day", "night", "24h": flat rate.
 *
 * Convenio: discounts 1 hour (never negative).
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
    // Flat rates — convenio still discounts 1 hour equivalent
    if (convenio) {
      const hourRate = config.rates[type].hour;
      return Math.max(0, rate - hourRate);
    }
    return rate;
  }

  // Hourly calculation with grace period
  const grace = config.gracePeriod ?? 5;
  const hours = Math.max(1, Math.ceil((minutes - grace) / 60));
  const billableHours = convenio ? Math.max(0, hours - 1) : hours;
  return billableHours * rate;
};

/** Validate plate: exactly 6 chars. Car ends in number, moto ends in letter */
export const validatePlate = (plate: string, type: VehicleType): { valid: boolean; error?: string } => {
  const p = plate.toUpperCase().trim();
  if (p.length !== 6) {
    return { valid: false, error: "La placa debe tener exactamente 6 caracteres" };
  }
  const lastChar = p[5];
  if (type === "motorcycle") {
    if (!/[A-Z]/.test(lastChar)) {
      return { valid: false, error: "Placa de moto debe terminar en letra (ej: HOQ79C)" };
    }
  } else {
    if (!/[0-9]/.test(lastChar)) {
      return { valid: false, error: "Placa de carro/camioneta debe terminar en número (ej: MTV192)" };
    }
  }
  return { valid: true };
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
  const types: VehicleType[] = ["car", "motorcycle", "truck"];
  const prefixes = { car: "C", motorcycle: "M", truck: "T" };
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

/** Seed demo data */
export const seedDemoData = (config: ParkingConfig) => {
  const spaces = initSpaces(config);
  const vehicles: Vehicle[] = [];
  const payments: Payment[] = [];
  const rateTypes: RateType[] = ["hour", "day", "night", "24h"];

  // Park a few vehicles
  const demoPlates = ["ABC123", "XYZ789", "MOT45C"];
  const demoTypes: VehicleType[] = ["car", "motorcycle", "truck"];

  demoPlates.forEach((plate, i) => {
    const type = demoTypes[i];
    const space = spaces.find((s) => s.type === type && s.status === "free");
    if (!space) return;
    const entryTime = new Date(Date.now() - (60 + i * 45) * 60000).toISOString();
    const vid = generateId();
    vehicles.push({
      id: vid,
      plate,
      type,
      rateType: "hour",
      entryTime,
      spaceId: space.id,
      status: "parked",
      ticketCode: generateTicketCode(),
      helmetNumber: type === "motorcycle" ? "C-" + Math.floor(100 + Math.random() * 900) : undefined,
    });
    space.status = "occupied";
    space.vehicleId = vid;
  });

  // Add past vehicles with payments
  for (let d = 0; d < 7; d++) {
    const count = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < count; j++) {
      const type = demoTypes[Math.floor(Math.random() * 3)];
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
        type,
        rateType,
        entryTime: entry.toISOString(),
        exitTime: exit.toISOString(),
        spaceId: `${type}-${Math.floor(Math.random() * config.totalSpaces[type]) + 1}`,
        status: "exited",
        ticketCode: generateTicketCode(),
      });
      payments.push({
        id: generateId(),
        vehicleId: vid,
        plate: vehicles[vehicles.length - 1].plate,
        amount,
        subtotal: amount,
        discount: 0,
        method: Math.random() > 0.5 ? "cash" : "card",
        status: "paid",
        date: exit.toISOString(),
        vehicleType: type,
        rateType,
        duration,
        convenio: false,
      });
    }
  }

  return { vehicles, payments, spaces };
};
