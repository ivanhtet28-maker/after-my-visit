import { Inbox, Users, CalendarDays, BarChart3, Settings, Stethoscope, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
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
import { GP_DEMO_DOCTOR, GP_DEMO_STATS } from "@/data/gpDemoData";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "Today", url: "/gp", icon: CalendarDays, end: true },
  { title: "Inbox", url: "/gp/inbox", icon: Inbox, badge: GP_DEMO_STATS.unread_visits },
  { title: "Patients", url: "/gp/patients", icon: Users },
  { title: "Analytics", url: "/gp/analytics", icon: BarChart3 },
  { title: "Settings", url: "/gp/settings", icon: Settings },
];

export function GpSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`flex h-16 items-center gap-2 border-b px-4 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-foreground">Clarity Health</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">GP Portal</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="border-b px-4 py-3">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground">{GP_DEMO_DOCTOR.title} {GP_DEMO_DOCTOR.first_name} {GP_DEMO_DOCTOR.last_name}</p>
            <p className="text-xs text-muted-foreground">{GP_DEMO_DOCTOR.practice}</p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <span className="flex-1">{item.title}</span>
                      )}
                      {!collapsed && item.badge ? (
                        <Badge variant="secondary" className="ml-auto h-5 min-w-5 justify-center px-1.5 text-[10px]">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className={`mt-auto border-t p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted ${collapsed ? "justify-center px-2" : "w-full"}`}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Exit Portal</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
