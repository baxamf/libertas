import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        L
      </span>
      <span>Libertas</span>
    </Link>
  );
}
