import { Home, Users, FileText, QrCode, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const gpItems = [
  { title: "Dashboard", url: "/gp/dashboard", icon: Home },
  { title: "Patients", url: "/gp/patients", icon: Users },
  { title: "Consent Settings", url: "/gp/consent-settings", icon: FileText },
  { title: "QR Code", url: "/gp/qr-code", icon: QrCode },
];

function GpSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div
          className={`flex h-16 items-center border-b px-4 ${collapsed ? "justify-center" : ""}`}
        >
          <span className="text-lg font-bold text-primary">
            {collapsed ? "CH" : "Clarity Health"}
          </span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {gpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/gp/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const GpLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const { isDemoMode } = useDemoMode();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <GpSidebar />
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
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GpLayout;
