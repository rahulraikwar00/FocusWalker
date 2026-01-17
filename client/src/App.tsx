import React, { Suspense, useEffect, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import InstallButton from "./components/shared/PWAInstallButton";
import {
  GlobalProvider,
  useGlobal,
} from "./features/mission/contexts/GlobalContext";
import { DrawerProvider } from "./features/mission/contexts/DrawerContext";
import { GlobalSideSheet } from "./features/profile/GlobalSideSheet";
import { MissionContextProvider } from "./features/mission/contexts/MissionContext";

// Lazy load the heavy map component
const FocusTacticalMap = React.lazy(() => import("@/pages/FocusTacticalMap"));

import { HomePage } from "./pages/HomePage";
import { AnimatePresence, motion } from "framer-motion";

const AppLoading = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground">
    <p className="animate-pulse">Loading Tactical Interface...</p>
  </div>
);

function Router() {
  const [hasSeenHome] = useState(() => {
    return localStorage.getItem("onboarding_complete") === "true";
  });
  return (
    <Suspense fallback={<AppLoading />}>
      <Switch>
        <Route path="/">
          {hasSeenHome ? <Redirect to="/app" /> : <HomePage />}
        </Route>
        <Route path="/app" component={FocusTacticalMap} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Initial Check: Is the app currently running in "Standalone" mode?
    const checkStandalone = window.matchMedia(
      "(display-mode: standalone)",
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

  function GlobalToast() {
    const { toast, setUI } = useGlobal();

    return (
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            // Ensure z-index is HIGHER than your map and HUD (z-2000+)
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none"
          >
            <div
              className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3
            ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/50 text-green-400"
                : toast.type === "error"
                  ? "bg-red-500/10 border-red-500/50 text-red-400"
                  : "bg-hud border-(--accent-primary)/30 text-(--accent-primary)"
            }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {toast.msg}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap everything with your new contexts */}
      <GlobalProvider>
        <Toaster />
        <MissionContextProvider>
          <DrawerProvider>
            <GlobalSideSheet />
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
