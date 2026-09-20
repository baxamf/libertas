import { MainFooter } from "@/components/main-footer";
import { MainHeader } from "@/components/main-header";

/**
 * Wraps all pages except auth pages (login, register, etc.) and protected pages (admin, etc.).
 * Redirecting authenticated users is handled by proxy.ts.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">{children}</main>
      <MainFooter />
    </div>
  );
}
