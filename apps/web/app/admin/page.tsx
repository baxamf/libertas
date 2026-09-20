import { getSession } from "@/lib/auth/dal";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <main className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Dashboard
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Welcome, {session?.email ?? "Guest"}! Your role is:{" "}
        {session?.role ?? "N/A"}.
      </p>
    </main>
  );
}
