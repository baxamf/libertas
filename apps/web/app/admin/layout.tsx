import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { AdminTopNav } from "./_components/admin-top-nav";

/**
 * Wraps all protected pages.
 * Route protection is handled by proxy.ts — this layout exists
 * for shared protected-area UI (nav, sidebar, etc.).
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AdminTopNav />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
