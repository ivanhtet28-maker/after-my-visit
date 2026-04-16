import { Home, PlusCircle, Folder, CheckSquare, Pill, FlaskConical, Settings, Phone } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { EmergencyContactsModal } from "@/components/EmergencyContactsModal";
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

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "New Visit", url: "/visit/new", icon: PlusCircle },
  { title: "My Visits", url: "/visits", icon: Folder },
  { title: "Action Items", url: "/actions", icon: CheckSquare },
  { title: "Medications", url: "/medications", icon: Pill },
  { title: "Lab Results", url: "/lab-results", icon: FlaskConical },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`flex h-16 items-center border-b px-4 ${collapsed ? "justify-center" : ""}`}>
          <span className="text-lg font-bold text-primary">{collapsed ? "CH" : "Clarity Health"}</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
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
        {/* Emergency Contacts */}
        <div className={`mt-auto border-t p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <EmergencyContactsModal>
            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 ${collapsed ? "justify-center px-2" : "w-full"}`}>
              <Phone className="h-4 w-4" />
              {!collapsed && <span>Emergency</span>}
            </button>
          </EmergencyContactsModal>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
