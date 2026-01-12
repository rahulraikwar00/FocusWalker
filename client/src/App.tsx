import React, { Suspense, useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import InstallButton from "./components/shared/PWAInstallButton";
import { GlobalProvider } from "./features/mission/contexts/GlobalContext";
import { DrawerProvider } from "./features/mission/contexts/DrawerContext";
import { GlobalSideSheet } from "./features/profile/GlobalSideSheet";
import { MissionContextProvider } from "./features/mission/contexts/MissionContext";

// Lazy load the heavy map component
const FocusTacticalMap = React.lazy(() => import("@/pages/FocusTacticalMap"));

const AppLoading = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground">
    <p className="animate-pulse">Loading Tactical Interface...</p>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route
        path="/"
        component={() => (
          <Suspense fallback={<AppLoading />}>
            <FocusTacticalMap />
          </Suspense>
        )}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

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

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent the default right-click or long-press menu
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap everything with your new contexts */}
      <GlobalProvider>
        <MissionContextProvider>
          <DrawerProvider>
            <GlobalSideSheet />
            <Toaster />
            <Router />
          </DrawerProvider>
        </MissionContextProvider>
        {/* Pass the state and the function as props */}
        {!isInstalled && installPrompt && <InstallButton />}
      </GlobalProvider>
    </QueryClientProvider>
  );
}

export default App;
