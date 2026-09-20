import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Logout01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import type { JwtPayload } from "@repo/shared-types";
import { logoutAction } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

function getInitials(email?: string): string {
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({ session }: { session: Partial<JwtPayload> }) {
  const email = session.email ?? "Guest";
  const role = session.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-1.5 py-1"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{getInitials(email)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-xs font-medium md:inline-block max-w-40 truncate">
          {email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-foreground truncate">
                {email}
              </p>
              {role && (
                <div>
                  <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
                    {role}
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {role === "ADMIN" && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
              <span>Admin</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem render={<Link href="/profile" />}>
            <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            render={
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="flex size-full items-center gap-2 text-left"
                >
                  <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                  <span>Log out</span>
                </button>
              </form>
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
