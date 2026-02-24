/* ──────────────────────────────────────────────
   Parking Management System — Type Definitions
   ────────────────────────────────────────────── */

export type VehicleType = "car" | "motorcycle" | "truck";
export type RateType = "hour" | "day" | "night" | "24h";
export type SpaceStatus = "free" | "occupied" | "blocked" | "reserved";
export type PaymentMethod = "cash" | "card";
export type PaymentStatus = "paid" | "pending";
export type UserRole = "admin" | "cashier";

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  rateType: RateType;
  entryTime: string;
  exitTime?: string;
  spaceId: string;
  status: "parked" | "exited";
  ticketCode: string;
  convenio?: boolean;
  helmetNumber?: string; // solo motos
}

export interface Payment {
  id: string;
  vehicleId: string;
  plate: string;
  amount: number;
  subtotal: number;
  discount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  vehicleType: VehicleType;
  rateType: RateType;
  duration: number; // minutes
  convenio: boolean;
}

export interface ParkingSpace {
  id: string;
  label: string;
  type: VehicleType;
  status: SpaceStatus;
  vehicleId?: string;
}

/** Rates per vehicle type and rate type */
export type RatesConfig = Record<VehicleType, Record<RateType | "monthly", number>>;

export interface ReceiptConfig {
  headerText: string;
  footerText: string;
  logoUrl: string;
  widthMm: number; // 58, 80, etc.
}

export interface ParkingConfig {
  rates: RatesConfig;
  totalSpaces: Record<VehicleType, number>;
  currency: string;
  name: string;
  gracePeriod: number; // minutes
  receiptEntry: ReceiptConfig;
  receiptExit: ReceiptConfig;
  receiptMonthly: ReceiptConfig;
}

export interface MonthlySubscription {
  id: string;
  plate: string;
  clientName: string;
  vehicleType: VehicleType;
  startDate: string;
  cutDay: number; // 1-31
  price: number;
  status: "active" | "pending";
  payments: MonthlyPayment[];
}

export interface MonthlyPayment {
  id: string;
  date: string;
  amount: number;
  month: number; // 1-12
  year: number;
}

export interface ParkingState {
  vehicles: Vehicle[];
  payments: Payment[];
  spaces: ParkingSpace[];
  config: ParkingConfig;
  currentRole: UserRole;
  monthlySubs: MonthlySubscription[];
}

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  car: "Carro",
  motorcycle: "Moto",
  truck: "Camioneta",
};

export const RATE_LABELS: Record<RateType, string> = {
  hour: "Por Hora",
  day: "Por Día",
  night: "Por Noche",
  "24h": "24 Horas",
};

export const SPACE_LABELS: Record<SpaceStatus, string> = {
  free: "Libre",
  occupied: "Ocupado",
  blocked: "Bloqueado",
  reserved: "Reservado",
};

const defaultReceiptConfig: ReceiptConfig = {
  headerText: "ParkSystem Pro",
  footerText: "Gracias por su visita",
  logoUrl: "",
  widthMm: 80,
};

export const DEFAULT_CONFIG: ParkingConfig = {
  rates: {
    car: { hour: 5000, day: 25000, night: 15000, "24h": 35000, monthly: 250000 },
    motorcycle: { hour: 3000, day: 15000, night: 10000, "24h": 20000, monthly: 150000 },
    truck: { hour: 8000, day: 40000, night: 25000, "24h": 50000, monthly: 400000 },
  },
  totalSpaces: { car: 20, motorcycle: 10, truck: 5 },
  currency: "COP",
  name: "ParkSystem Pro",
  gracePeriod: 5,
  receiptEntry: { ...defaultReceiptConfig },
  receiptExit: { ...defaultReceiptConfig },
  receiptMonthly: { ...defaultReceiptConfig },
};
