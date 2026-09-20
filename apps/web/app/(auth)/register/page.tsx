import Link from "next/link";
import { RegisterForm } from "./_components/register-form";

export const metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your details below to register
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
