import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth/dal";

export async function AdminTopNav() {
  const session = await getSession();

  return (
    <div className="flex h-14 w-full items-center justify-end gap-2 border-b px-4">
      <ThemeToggle />
      <UserMenu session={session} />
    </div>
  );
}
