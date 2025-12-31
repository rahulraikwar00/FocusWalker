import { useEffect, useState } from "react";

export const useUIState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  useEffect(() => {
    const hasOnboarded = localStorage.getItem("has_onboarded");
    if (!hasOnboarded) {
      setShowWelcome(true);
    }
  }, []);
  const triggerToast = (msg: any, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };
  const completeOnboarding = () => {
    setShowWelcome(false);
    localStorage.setItem("has_onboarded", "true");
  };

  return {
    completeOnboarding,
    searchQuery,
    setSearchQuery,
    isSettingsOpen,
    setIsSettingsOpen,
    showWelcome,
    setShowWelcome,
    isDossierOpen,
    setIsDossierOpen,
    toast,
    triggerToast,
  };
};
