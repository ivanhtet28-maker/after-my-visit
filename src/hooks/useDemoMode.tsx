import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Support ?demo=true URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") {
      setIsDemoMode(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, []);

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
