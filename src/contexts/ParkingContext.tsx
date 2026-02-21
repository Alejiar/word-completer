/* ──────────────────────────────────────────────
   Parking Management System — Global Context
   ────────────────────────────────────────────── */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  Vehicle, Payment, ParkingSpace, ParkingConfig, UserRole,
  VehicleType, PaymentMethod,
} from "@/lib/parking-types";
import { DEFAULT_CONFIG } from "@/lib/parking-types";
import {
  generateId, generateTicketCode, calcDuration, calcFee,
  initSpaces, loadState, saveState, seedDemoData,
} from "@/lib/parking-utils";

interface ParkingContextType {
  vehicles: Vehicle[];
  payments: Payment[];
  spaces: ParkingSpace[];
  config: ParkingConfig;
  role: UserRole;
  setRole: (r: UserRole) => void;
  updateConfig: (c: Partial<ParkingConfig>) => void;
  registerEntry: (plate: string, type: VehicleType) => Vehicle | null;
  registerExit: (vehicleId: string, method: PaymentMethod) => Payment | null;
  toggleSpaceBlock: (spaceId: string) => void;
  reserveSpace: (spaceId: string) => void;
  unreserveSpace: (spaceId: string) => void;
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
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Seed demo data on first load
  useEffect(() => {
    const seeded = localStorage.getItem(`${STORAGE_KEY}_seeded`);
    if (!seeded) {
      const demo = seedDemoData(config);
      setVehicles(demo.vehicles);
      setPayments(demo.payments);
      setSpaces(demo.spaces);
      localStorage.setItem(`${STORAGE_KEY}_seeded`, "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state
  useEffect(() => { saveState(`${STORAGE_KEY}_vehicles`, vehicles); }, [vehicles]);
  useEffect(() => { saveState(`${STORAGE_KEY}_payments`, payments); }, [payments]);
  useEffect(() => { saveState(`${STORAGE_KEY}_spaces`, spaces); }, [spaces]);
  useEffect(() => { saveState(`${STORAGE_KEY}_config`, config); }, [config]);
  useEffect(() => { saveState(`${STORAGE_KEY}_role`, role); }, [role]);

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const clearAlert = () => setAlert(null);

  const updateConfig = useCallback((partial: Partial<ParkingConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    showAlert("Configuración actualizada", "success");
  }, []);

  const registerEntry = useCallback((plate: string, type: VehicleType): Vehicle | null => {
    const normalized = plate.toUpperCase().trim();
    if (!normalized) {
      showAlert("Ingrese una placa válida", "error");
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
      entryTime: new Date().toISOString(),
      spaceId: freeSpace.id,
      status: "parked",
      ticketCode: generateTicketCode(),
    };
    setVehicles((prev) => [vehicle, ...prev]);
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === freeSpace.id ? { ...s, status: "occupied" as const, vehicleId: vehicle.id } : s
      )
    );
    showAlert(`Vehículo ${normalized} registrado en espacio ${freeSpace.label}`, "success");
    return vehicle;
  }, [vehicles, spaces]);

  const registerExit = useCallback((vehicleId: string, method: PaymentMethod): Payment | null => {
    const vehicle = vehicles.find((v) => v.id === vehicleId && v.status === "parked");
    if (!vehicle) {
      showAlert("Vehículo no encontrado", "error");
      return null;
    }
    const exitTime = new Date().toISOString();
    const duration = calcDuration(vehicle.entryTime, exitTime);
    const amount = calcFee(duration, vehicle.type, config);
    const payment: Payment = {
      id: generateId(),
      vehicleId,
      plate: vehicle.plate,
      amount,
      method,
      status: "paid",
      date: exitTime,
      vehicleType: vehicle.type,
      duration,
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
    showAlert(`Salida registrada. Total: $${amount.toLocaleString("es-CO")}`, "success");
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

  return (
    <ParkingContext.Provider
      value={{
        vehicles, payments, spaces, config, role,
        setRole, updateConfig, registerEntry, registerExit,
        toggleSpaceBlock, reserveSpace, unreserveSpace,
        alert, clearAlert,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};
