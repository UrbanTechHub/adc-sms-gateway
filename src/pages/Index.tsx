import { useState } from "react";
import PinAccess from "@/components/PinAccess";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <PinAccess onSuccess={handleAccessGranted} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default Index;
