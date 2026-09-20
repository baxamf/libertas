import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ArchitectureGrid } from "./_components/architecture-grid";
import { StackList } from "./_components/stack-list";

export default async function Home() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-24 px-4 py-20 md:px-6 md:py-28">
      <section className="flex flex-col gap-6">
        <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
          A starter foundation for whatever you build next
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Libertas is a Turborepo monorepo with the API, database, and shared
          types already wired together, so a new project starts from a working
          app instead of an empty folder.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button nativeButton={false} render={<Link href="/register" />}>
            Get started
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://github.com/baxamf/libertas"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <HugeiconsIcon icon={GithubIcon} data-icon="inline-start" />
            View source
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Architecture
          </h2>
          <p className="text-sm text-muted-foreground">
            Four workspace packages, each with one job.
          </p>
        </div>
        <ArchitectureGrid />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Stack
          </h2>
          <p className="text-sm text-muted-foreground">
            What&apos;s already installed and configured.
          </p>
        </div>
        <StackList />
      </section>
    </div>
  );
}
