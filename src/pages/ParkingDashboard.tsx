/* ──────────────────────────────────────────────
   Parking Dashboard — Main Layout
   ────────────────────────────────────────────── */

import { useState } from "react";
import Sidebar, { type SectionId } from "@/components/parking/Sidebar";
import DashboardHome from "@/components/parking/DashboardHome";
import VehicleEntry from "@/components/parking/VehicleEntry";
import Payments from "@/components/parking/Payments";
import ParkingSpaces from "@/components/parking/ParkingSpaces";
import Reports from "@/components/parking/Reports";
import ParkingSettings from "@/components/parking/ParkingSettings";
import Mensualidades from "@/components/parking/Mensualidades";
import { useParkingContext } from "@/contexts/ParkingContext";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const alertIcons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const alertBg = {
  success: "bg-emerald-500/10 border-emerald-500/30",
  error: "bg-red-500/10 border-red-500/30",
  info: "bg-blue-500/10 border-blue-500/30",
};

const sections: Record<SectionId, React.FC> = {
  dashboard: DashboardHome,
  vehicles: VehicleEntry,
  payments: Payments,
  spaces: ParkingSpaces,
  monthly: Mensualidades,
  reports: Reports,
  settings: ParkingSettings,
};

const ParkingDashboard = () => {
  const [active, setActive] = useState<SectionId>("dashboard");
  const { alert, clearAlert } = useParkingContext();

  const ActiveSection = sections[active];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active={active} onNavigate={setActive} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Alert Toast */}
        {alert && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg animate-scale-in max-w-md ${alertBg[alert.type]}`}>
            {alertIcons[alert.type]}
            <span className="text-sm font-medium text-foreground">{alert.message}</span>
            <button onClick={clearAlert} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <ActiveSection />
      </main>
    </div>
  );
};

export default ParkingDashboard;
