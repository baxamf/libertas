import type { User } from "@repo/shared-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getInitials(email?: string): string {
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

export function UserInfoCard({
  user,
}: {
  user: Pick<User, "userId" | "email" | "role" | "createdAt">;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User profile</CardTitle>
        <CardDescription>
          Basic personal details and account information.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 text-base font-semibold">
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground truncate">
                {user.email}
              </span>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              User ID: <span className="font-mono">{user.userId}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-border pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Email Address
            </span>
            <span className="text-xs text-foreground font-medium truncate">
              {user.email}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Account Role
            </span>
            <span className="text-xs text-foreground font-medium">
              {user.role === "ADMIN" ? "Administrator" : "Standard User"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Account Created
            </span>
            <span className="text-xs text-foreground font-medium">
              {user.createdAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              User ID
            </span>
            <span className="text-xs text-foreground font-mono truncate">
              {user.userId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
