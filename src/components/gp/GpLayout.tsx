import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GpSidebar } from "@/components/gp/GpSidebar";
import { Stethoscope } from "lucide-react";

export default function GpLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <GpSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">DEMO</span>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">GP Practice Portal — sample patient data</span>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
