import React from "react";
import { PatientProvider, usePatient } from "./context/PatientContext";
import PatientKioskApp from "./components/kiosk/PatientKioskApp";
import DoctorWorkstationApp from "./components/doctor/DoctorWorkstationApp";
import RoleGateway from "./components/gateway/RoleGateway";

function MainAppRouter() {
  const { portalMode, setPortalMode } = usePatient();

  if (portalMode === "patient") {
    return <PatientKioskApp />;
  }

  if (portalMode === "doctor") {
    return <DoctorWorkstationApp />;
  }

  return <RoleGateway onSelectRole={setPortalMode} />;
}

export default function App() {
  return (
    <PatientProvider>
      <MainAppRouter />
    </PatientProvider>
  );
}
