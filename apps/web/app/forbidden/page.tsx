import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Login01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export const metadata = { title: "403 — Access Denied" };

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            You don&apos;t have access to this page
          </h1>
          <p className="text-xs text-muted-foreground">
            You do not have the required permissions to view this page. If you
            believe this is an error, try signing in with an account that has
            the appropriate role.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/" />}>
            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
            Back to Home
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/login" />}
          >
            <HugeiconsIcon icon={Login01Icon} strokeWidth={2} />
            Sign in
          </Button>
        </div>
      </div>
    </main>
  );
}
