import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSquare01Icon, Home01Icon } from "@hugeicons/core-free-icons";
import { getSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: DashboardSquare01Icon,
    adminOnly: true,
  },
  { href: "/", label: "Home", icon: Home01Icon },
];

export async function MainHeader() {
  const session = await getSession();
  const isAuthenticated = Boolean(session?.role || session?.email);
  const isAdmin = session?.role === "ADMIN";

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Logo />
        <NavigationMenu>
          <NavigationMenuList>
            {NAV_ITEMS.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink render={<Link href={item.href} />}>
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isAuthenticated ? (
          <UserMenu session={session} />
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              nativeButton={false}
              size="sm"
              render={<Link href="/login" />}
            >
              Log in
            </Button>
            <Button
              nativeButton={false}
              size="sm"
              render={<Link href="/register" />}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
