/* ──────────────────────────────────────────────
   Parking Management System — Global Context
   ────────────────────────────────────────────── */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  Vehicle, Payment, ParkingSpace, ParkingConfig, UserRole,
  VehicleType, PaymentMethod, RateType, MonthlySubscription, MonthlyPayment,
} from "@/lib/parking-types";
import { DEFAULT_CONFIG } from "@/lib/parking-types";
import {
  generateId, generateTicketCode, calcDuration, calcFee, validatePlate,
  initSpaces, loadState, saveState, seedDemoData,
} from "@/lib/parking-utils";

interface ParkingContextType {
  vehicles: Vehicle[];
  payments: Payment[];
  spaces: ParkingSpace[];
  config: ParkingConfig;
  role: UserRole;
  monthlySubs: MonthlySubscription[];
  setRole: (r: UserRole) => void;
  updateConfig: (c: Partial<ParkingConfig>) => void;
  registerEntry: (plate: string, type: VehicleType, rateType: RateType, convenio: boolean, helmetNumber?: string) => Vehicle | null;
  registerExit: (vehicleId: string, method: PaymentMethod) => Payment | null;
  toggleSpaceBlock: (spaceId: string) => void;
  reserveSpace: (spaceId: string) => void;
  unreserveSpace: (spaceId: string) => void;
  addMonthlySub: (sub: Omit<MonthlySubscription, "id" | "payments" | "status">) => void;
  payMonthlySub: (subId: string) => void;
  deleteMonthlySub: (subId: string) => void;
  isMonthlyVehicle: (plate: string) => boolean;
  alert: { message: string; type: "success" | "error" | "info" } | null;
  clearAlert: () => void;
}

const ParkingContext = createContext<ParkingContextType | null>(null);

export const useParkingContext = () => {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParkingContext must be inside ParkingProvider");
  return ctx;
};

const STORAGE_KEY = "parking_system";

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ParkingConfig>(() =>
    loadState(`${STORAGE_KEY}_config`, DEFAULT_CONFIG)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadState(`${STORAGE_KEY}_vehicles`, [])
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    loadState(`${STORAGE_KEY}_payments`, [])
  );
  const [spaces, setSpaces] = useState<ParkingSpace[]>(() => {
    const saved = loadState<ParkingSpace[] | null>(`${STORAGE_KEY}_spaces`, null);
    return saved ?? initSpaces(config);
  });
  const [role, setRole] = useState<UserRole>(() =>
    loadState(`${STORAGE_KEY}_role`, "admin" as UserRole)
  );
  const [monthlySubs, setMonthlySubs] = useState<MonthlySubscription[]>(() =>
    loadState(`${STORAGE_KEY}_monthly`, [])
  );
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Seed demo data on first load
  useEffect(() => {
    const seeded = localStorage.getItem(`${STORAGE_KEY}_seeded_v2`);
    if (!seeded) {
      const demo = seedDemoData(config);
      setVehicles(demo.vehicles);
      setPayments(demo.payments);
      setSpaces(demo.spaces);
      localStorage.setItem(`${STORAGE_KEY}_seeded_v2`, "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check monthly subscription statuses
  useEffect(() => {
    const today = new Date();
    setMonthlySubs((prev) =>
      prev.map((sub) => {
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const hasPaidThisMonth = sub.payments.some(
          (p) => p.month === currentMonth && p.year === currentYear
        );
        const pastCutDay = today.getDate() >= sub.cutDay;
        const newStatus = hasPaidThisMonth ? "active" : pastCutDay ? "pending" : sub.status;
        return { ...sub, status: newStatus };
      })
    );
  }, []);

  // Persist state
  useEffect(() => { saveState(`${STORAGE_KEY}_vehicles`, vehicles); }, [vehicles]);
  useEffect(() => { saveState(`${STORAGE_KEY}_payments`, payments); }, [payments]);
  useEffect(() => { saveState(`${STORAGE_KEY}_spaces`, spaces); }, [spaces]);
  useEffect(() => { saveState(`${STORAGE_KEY}_config`, config); }, [config]);
  useEffect(() => { saveState(`${STORAGE_KEY}_role`, role); }, [role]);
  useEffect(() => { saveState(`${STORAGE_KEY}_monthly`, monthlySubs); }, [monthlySubs]);

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const clearAlert = () => setAlert(null);

  const updateConfig = useCallback((partial: Partial<ParkingConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    showAlert("Configuración actualizada", "success");
  }, []);

  const isMonthlyVehicle = useCallback((plate: string): boolean => {
    return monthlySubs.some((s) => s.plate.toUpperCase() === plate.toUpperCase());
  }, [monthlySubs]);

  const registerEntry = useCallback((
    plate: string, type: VehicleType, rateType: RateType, convenio: boolean, helmetNumber?: string
  ): Vehicle | null => {
    const normalized = plate.toUpperCase().trim();

    // Validate plate
    const validation = validatePlate(normalized, type);
    if (!validation.valid) {
      showAlert(validation.error!, "error");
      return null;
    }

    // Check if monthly vehicle
    if (isMonthlyVehicle(normalized)) {
      showAlert(`⚠️ Este vehículo (${normalized}) es mensualidad. No se registra desde aquí.`, "error");
      return null;
    }

    // Check helmet for motorcycles
    if (type === "motorcycle" && (!helmetNumber || !helmetNumber.trim())) {
      showAlert("Debe ingresar el número de casco para motos", "error");
      return null;
    }

    const alreadyParked = vehicles.find((v) => v.plate === normalized && v.status === "parked");
    if (alreadyParked) {
      showAlert(`El vehículo ${normalized} ya está registrado`, "error");
      return null;
    }
    const freeSpace = spaces.find((s) => s.type === type && s.status === "free");
    if (!freeSpace) {
      showAlert(`No hay espacios disponibles para ${type}`, "error");
      return null;
    }
    const vehicle: Vehicle = {
      id: generateId(),
      plate: normalized,
      type,
      rateType,
      entryTime: new Date().toISOString(),
      spaceId: freeSpace.id,
      status: "parked",
      ticketCode: generateTicketCode(),
      convenio,
      helmetNumber: type === "motorcycle" ? helmetNumber?.trim() : undefined,
    };
    setVehicles((prev) => [vehicle, ...prev]);
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === freeSpace.id ? { ...s, status: "occupied" as const, vehicleId: vehicle.id } : s
      )
    );
    showAlert(`Vehículo ${normalized} registrado en espacio ${freeSpace.label}`, "success");
    return vehicle;
  }, [vehicles, spaces, isMonthlyVehicle]);

  const registerExit = useCallback((vehicleId: string, method: PaymentMethod): Payment | null => {
    const vehicle = vehicles.find((v) => v.id === vehicleId && v.status === "parked");
    if (!vehicle) {
      showAlert("Vehículo no encontrado", "error");
      return null;
    }
    const exitTime = new Date().toISOString();
    const duration = calcDuration(vehicle.entryTime, exitTime);
    const subtotal = calcFee(duration, vehicle.type, vehicle.rateType, config, false);
    const amount = calcFee(duration, vehicle.type, vehicle.rateType, config, vehicle.convenio ?? false);
    const discount = subtotal - amount;
    const payment: Payment = {
      id: generateId(),
      vehicleId,
      plate: vehicle.plate,
      amount,
      subtotal,
      discount,
      method,
      status: "paid",
      date: exitTime,
      vehicleType: vehicle.type,
      rateType: vehicle.rateType,
      duration,
      convenio: vehicle.convenio ?? false,
    };

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, exitTime, status: "exited" as const } : v
      )
    );
    setSpaces((prev) =>
      prev.map((s) =>
        s.vehicleId === vehicleId ? { ...s, status: "free" as const, vehicleId: undefined } : s
      )
    );
    setPayments((prev) => [payment, ...prev]);
    const msg = vehicle.convenio
      ? `Salida registrada. Subtotal: $${subtotal.toLocaleString("es-CO")} | Descuento convenio: -$${discount.toLocaleString("es-CO")} | Total: $${amount.toLocaleString("es-CO")}`
      : `Salida registrada. Total: $${amount.toLocaleString("es-CO")}`;
    showAlert(msg, "success");
    return payment;
  }, [vehicles, config]);

  const toggleSpaceBlock = useCallback((spaceId: string) => {
    setSpaces((prev) =>
      prev.map((s) => {
        if (s.id !== spaceId) return s;
        if (s.status === "occupied") return s;
        return { ...s, status: s.status === "blocked" ? "free" as const : "blocked" as const };
      })
    );
  }, []);

  const reserveSpace = useCallback((spaceId: string) => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId && s.status === "free" ? { ...s, status: "reserved" as const } : s
      )
    );
    showAlert("Espacio reservado", "info");
  }, []);

  const unreserveSpace = useCallback((spaceId: string) => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId && s.status === "reserved" ? { ...s, status: "free" as const } : s
      )
    );
  }, []);

  const addMonthlySub = useCallback((sub: Omit<MonthlySubscription, "id" | "payments" | "status">) => {
    const newSub: MonthlySubscription = {
      ...sub,
      id: generateId(),
      payments: [],
      status: "pending",
    };
    setMonthlySubs((prev) => [...prev, newSub]);
    showAlert(`Mensualidad registrada para ${sub.plate}`, "success");
  }, []);

  const payMonthlySub = useCallback((subId: string) => {
    const now = new Date();
    const payment: MonthlyPayment = {
      id: generateId(),
      date: now.toISOString(),
      amount: 0, // will be set from sub price
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
    setMonthlySubs((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        return {
          ...s,
          status: "active" as const,
          payments: [...s.payments, { ...payment, amount: s.price }],
        };
      })
    );
    showAlert("Pago de mensualidad registrado", "success");
  }, []);

  const deleteMonthlySub = useCallback((subId: string) => {
    setMonthlySubs((prev) => prev.filter((s) => s.id !== subId));
    showAlert("Mensualidad eliminada", "info");
  }, []);

  return (
    <ParkingContext.Provider
      value={{
        vehicles, payments, spaces, config, role, monthlySubs,
        setRole, updateConfig, registerEntry, registerExit,
        toggleSpaceBlock, reserveSpace, unreserveSpace,
        addMonthlySub, payMonthlySub, deleteMonthlySub, isMonthlyVehicle,
        alert, clearAlert,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};
