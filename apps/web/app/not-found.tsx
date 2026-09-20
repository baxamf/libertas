import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Page not found
      </h2>
      <Link
        href="/"
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Go home
      </Link>
    </main>
  );
}
