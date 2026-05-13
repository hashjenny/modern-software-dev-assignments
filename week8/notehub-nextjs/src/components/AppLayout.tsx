import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { SearchBar } from "@/components/SearchBar"
import { FileText, FolderOpen, PenLine, Search, BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "All Notes", to: "/notes", icon: FileText },
  { label: "Categories", to: "/categories", icon: FolderOpen },
  { label: "Search", to: "/search", icon: Search },
]

const quickItems = [
  { label: "New Note", to: "/notes/new", icon: PenLine },
  { label: "New Category", to: "/categories/new", icon: Plus },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(to: string) {
    if (to === "/notes") return location.pathname === "/notes" || location.pathname.startsWith("/notes/")
    if (to === "/categories") return location.pathname === "/categories" || location.pathname.startsWith("/categories/")
    return location.pathname.startsWith(to)
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="NoteHub">
                <NavLink to="/notes">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">NoteHub</span>
                    <span className="text-xs text-muted-foreground">Your notes</span>
                  </div>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton isActive={isActive(item.to)} asChild tooltip={item.label}>
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
              Single user
            </span>
            <ModeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 max-w-sm">
              <SearchBar
                onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
              />
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/notes/new")}>
            <PenLine className="size-4" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
