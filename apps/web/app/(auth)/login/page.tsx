import Link from "next/link";
import { LoginForm } from "./_components/login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Log in
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your email and password to sign in
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
