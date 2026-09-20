import { HugeiconsIcon } from "@hugeicons/react";
import {
  Database02Icon,
  GlobalIcon,
  PackageIcon,
  ServerStack01Icon,
} from "@hugeicons/core-free-icons";

const workspaceMembers = [
  {
    path: "apps/web",
    icon: GlobalIcon,
    description:
      "Next.js 16 App Router front end — server components by default, shadcn/ui for the design system.",
  },
  {
    path: "apps/backend",
    icon: ServerStack01Icon,
    description:
      "NestJS 12 API on Fastify, structured around CQRS commands and queries.",
  },
  {
    path: "packages/db",
    icon: Database02Icon,
    description:
      "Prisma 8 contract, migrations, and the typed client shared by every app.",
  },
  {
    path: "packages/shared-types",
    icon: PackageIcon,
    description:
      "Zod schemas and types kept in one place so the API and the UI never drift apart.",
  },
];

export function ArchitectureGrid() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
      {workspaceMembers.map((member) => (
        <div key={member.path} className="flex flex-col gap-3 bg-card p-6">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={member.icon}
              strokeWidth={1.75}
              className="size-4 text-primary"
            />
            <span className="font-mono text-xs text-foreground">
              {member.path}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{member.description}</p>
        </div>
      ))}
    </div>
  );
}
