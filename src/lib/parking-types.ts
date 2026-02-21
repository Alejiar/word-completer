/* ──────────────────────────────────────────────
   Parking Management System — Type Definitions
   ────────────────────────────────────────────── */

export type VehicleType = "car" | "motorcycle" | "truck";
export type SpaceStatus = "free" | "occupied" | "blocked" | "reserved";
export type PaymentMethod = "cash" | "card";
export type PaymentStatus = "paid" | "pending";
export type UserRole = "admin" | "cashier";

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  entryTime: string;
  exitTime?: string;
  spaceId: string;
  status: "parked" | "exited";
  ticketCode: string;
}

export interface Payment {
  id: string;
  vehicleId: string;
  plate: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  vehicleType: VehicleType;
  duration: number; // minutes
}

export interface ParkingSpace {
  id: string;
  label: string;
  type: VehicleType;
  status: SpaceStatus;
  vehicleId?: string;
}

export interface ParkingConfig {
  rates: Record<VehicleType, number>; // per hour
  totalSpaces: Record<VehicleType, number>;
  currency: string;
  name: string;
}

export interface ParkingState {
  vehicles: Vehicle[];
  payments: Payment[];
  spaces: ParkingSpace[];
  config: ParkingConfig;
  currentRole: UserRole;
}

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  car: "Carro",
  motorcycle: "Moto",
  truck: "Camioneta",
};

export const SPACE_LABELS: Record<SpaceStatus, string> = {
  free: "Libre",
  occupied: "Ocupado",
  blocked: "Bloqueado",
  reserved: "Reservado",
};

export const DEFAULT_CONFIG: ParkingConfig = {
  rates: { car: 5000, motorcycle: 3000, truck: 8000 },
  totalSpaces: { car: 20, motorcycle: 10, truck: 5 },
  currency: "COP",
  name: "ParkSystem Pro",
};
