import type { UserSession } from "@repo/shared-types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevokeSessionDialog } from "./revoke-session-dialog";

export function SessionsCard({ sessions }: { sessions: UserSession[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          These are the devices and browsers that are currently signed in to
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No active sessions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device / Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed in</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.sessionId}>
                    <TableCell
                      title={session.device || "Unknown device"}
                      className="font-medium max-w-37.5 text-ellipsis overflow-hidden text-foreground"
                    >
                      {session.device || "Unknown device"}
                    </TableCell>
                    <TableCell>
                      {session.isCurrent ? (
                        <Badge variant="default">Current session</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {session.createdAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {session.expiresAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <RevokeSessionDialog
                        session={{
                          sessionId: session.sessionId,
                          device: session.device,
                          isCurrent: session.isCurrent,
                        }}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                            aria-label={`Revoke session for ${session.device || "device"}`}
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              strokeWidth={2}
                              data-icon="inline-start"
                            />
                            {session.isCurrent ? "Log out" : "Revoke"}
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
