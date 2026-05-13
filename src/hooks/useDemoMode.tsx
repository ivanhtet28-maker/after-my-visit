import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
  toggleDemoMode: () => {},
});

const STORAGE_KEY = "aftervisit_demo_mode";

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // ?demo=true URL parameter forces demo on
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") {
      setIsDemoMode(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, []);

  // Force demo off whenever an authenticated user is detected. Demo is for
  // visitors only — signed-in practitioners and patients always get the real
  // flow, regardless of stale localStorage flags from previous sessions.
  useEffect(() => {
    if (!authLoading && user && isDemoMode) {
      setIsDemoMode(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [user, authLoading, isDemoMode]);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const toggleDemoMode = () => {
    if (isDemoMode) disableDemoMode();
    else enableDemoMode();
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
