import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordDialog } from "./change-password-dialog";

export function SecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage your password and security preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-foreground">Password</span>
          <span className="text-xs text-muted-foreground">
            Ensure your account is using a long and secure password.
          </span>
        </div>
        <ChangePasswordDialog
          trigger={<Button variant="outline">Change password</Button>}
        />
      </CardContent>
    </Card>
  );
}
