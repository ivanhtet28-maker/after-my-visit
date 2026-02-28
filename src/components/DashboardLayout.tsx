import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AIChatSidebar from "@/components/AIChatSidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const { isDemoMode } = useDemoMode();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex h-14 items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {isDemoMode && (
                <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground">
                  DEMO
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
        <AIChatSidebar />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
