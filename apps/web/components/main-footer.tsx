export async function MainFooter() {
  "use cache";
  return (
    <footer className="flex h-24 w-full items-center justify-center border-t">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Libertas. All rights reserved.
      </p>
    </footer>
  );
}
