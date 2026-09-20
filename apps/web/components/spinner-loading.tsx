import { Spinner } from "@/components/ui/spinner";

export default function SpinnerLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </main>
  );
}
