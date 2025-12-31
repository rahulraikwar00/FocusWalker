import React, { Suspense, useEffect, useState } from "react"; // ← This line is CRITICAL
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import InstallButton from "./components/PWAInstallButton";

const FocusTacticalMap = React.lazy(() => import("@/pages/FocusTacticalMap"));

// 2. A simple fallback keeps the Main Thread free while the Map loads
const MapLoading = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground">
    <p className="animate-pulse">Loading Tactical Interface...</p>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<MapLoading />}>
      <Switch>
        <Route path="/" component={FocusTacticalMap} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Initial Check: Is the app currently running in "Standalone" mode?
    const checkStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    setIsInstalled(checkStandalone);

    // 2. Listener: If the user installs the app WHILE it's open
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />

      {/* Pass the state and the function as props */}
      {!isInstalled && installPrompt && <InstallButton />}
    </QueryClientProvider>
  );
}

export default App;
