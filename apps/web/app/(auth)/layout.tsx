import { MainFooter } from "@/components/main-footer";
import { MainHeader } from "@/components/main-header";

/**
 * Wraps all auth pages (login, register, etc.).
 * Redirecting authenticated users is handled by proxy.ts.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <MainFooter />
    </div>
  );
}
