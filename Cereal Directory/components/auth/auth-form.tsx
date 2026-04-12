"use client";

import Link from "next/link";
import { BookMarked, CircleAlert } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

type SignInValues = {
  identifier: string;
  password: string;
};

type SignUpValues = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const signInDefaults: SignInValues = {
  identifier: "",
  password: "",
};

const signUpDefaults: SignUpValues = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getSignInErrors(values: SignInValues) {
  return {
    identifier: values.identifier.trim()
      ? ""
      : "Enter your email address or username.",
    password: values.password.length >= 8
      ? ""
      : "Password must be at least 8 characters long.",
  };
}

function getSignUpErrors(values: SignUpValues) {
  return {
    fullName: values.fullName.trim() ? "" : "Enter your full name.",
    username:
      values.username.trim().length >= 3
        ? ""
        : "Username must be at least 3 characters.",
    email: /\S+@\S+\.\S+/.test(values.email)
      ? ""
      : "Enter a valid email address.",
    password:
      values.password.length >= 8
        ? ""
        : "Password must be at least 8 characters long.",
    confirmPassword:
      values.confirmPassword === values.password && values.confirmPassword.length > 0
        ? ""
        : "Passwords must match.",
  };
}

function hasErrors(errors: Record<string, string>) {
  return Object.values(errors).some(Boolean);
}

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  autoComplete?: string;
  type?: React.HTMLInputTypeAttribute;
  onChange: (value: string) => void;
}

function FormField({
  autoComplete,
  error,
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn(error && "border-[color:var(--color-danger)]")}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

interface AuthFormProps {
  initialMode?: AuthMode;
}

export function AuthForm({ initialMode = "signin" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>(initialMode);
  const [signInValues, setSignInValues] = React.useState(signInDefaults);
  const [signUpValues, setSignUpValues] = React.useState(signUpDefaults);
  const [submitMessage, setSubmitMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    data: session,
    error: sessionError,
    isPending: isSessionPending,
  } = authClient.useSession();

  React.useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [router, session]);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const signInErrors = getSignInErrors(signInValues);
  const signUpErrors = getSignUpErrors(signUpValues);

  const currentErrors = mode === "signin" ? signInErrors : signUpErrors;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasErrors(currentErrors)) {
      setSubmitMessage("Please review the highlighted fields before continuing.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      if (mode === "signin") {
        const isEmail = signInValues.identifier.includes("@");
        const result = isEmail
          ? await authClient.signIn.email({
              email: signInValues.identifier,
              password: signInValues.password,
            })
          : await authClient.signIn.username({
              username: signInValues.identifier,
              password: signInValues.password,
            });

        if (result.error) {
          setSubmitMessage(result.error.message || "Unable to sign in with those credentials.");
          return;
        }

        setSubmitMessage("Signed in successfully.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const result = await authClient.signUp.email({
        email: signUpValues.email,
        password: signUpValues.password,
        name: signUpValues.fullName,
        username: signUpValues.username,
      });

      if (result.error) {
        setSubmitMessage(result.error.message || "Unable to create your account.");
        return;
      }

      setSubmitMessage("Account created successfully. Please sign in.");
      setSignUpValues(signUpDefaults);
      router.push("/sign-in");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending) {
    return (
      <Card className="w-full max-w-xl">
        <CardContent className="px-8 py-10">
          <p className="text-center text-sm text-[var(--color-muted-foreground)]">
            Checking your session...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-sm">
            <BookMarked className="size-6" />
          </div>
          <div className="inline-flex rounded-full border border-[color:var(--color-border)] bg-[var(--color-muted)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setSubmitMessage("");
                router.push("/sign-in");
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition duration-200",
                mode === "signin"
                  ? "bg-white text-[var(--color-foreground)] shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setSubmitMessage("");
                router.push("/sign-up");
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition duration-200",
                mode === "signup"
                  ? "bg-white text-[var(--color-foreground)] shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
              )}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle>
            {mode === "signin" ? "Access your library workspace" : "Create your library account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Sign in with your library credentials to manage books, members, and borrowing activity."
              : "Set up your account to begin managing collections, users, and academic lending workflows."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === "signin" ? (
            <>
              <FormField
                id="identifier"
                label="Email or Username"
                placeholder="Enter your email or username"
                autoComplete="username"
                value={signInValues.identifier}
                error={signInErrors.identifier}
                onChange={(identifier) =>
                  setSignInValues((current) => ({ ...current, identifier }))
                }
              />
              <PasswordField
                id="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                error={signInErrors.password}
                value={signInValues.password}
                onChange={(event) =>
                  setSignInValues((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </>
          ) : (
            <>
              <FormField
                id="full-name"
                label="Full Name"
                placeholder="Enter your full name"
                autoComplete="name"
                value={signUpValues.fullName}
                error={signUpErrors.fullName}
                onChange={(fullName) =>
                  setSignUpValues((current) => ({ ...current, fullName }))
                }
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="username"
                  label="Username"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={signUpValues.username}
                  error={signUpErrors.username}
                  onChange={(username) =>
                    setSignUpValues((current) => ({ ...current, username }))
                  }
                />
                <FormField
                  id="email"
                  label="Email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  type="email"
                  value={signUpValues.email}
                  error={signUpErrors.email}
                  onChange={(email) =>
                    setSignUpValues((current) => ({ ...current, email }))
                  }
                />
              </div>
              <PasswordField
                id="new-password"
                name="password"
                label="Password"
                placeholder="Create a secure password"
                autoComplete="new-password"
                hint="Minimum 8 characters"
                error={signUpErrors.password}
                value={signUpValues.password}
                onChange={(event) =>
                  setSignUpValues((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <PasswordField
                id="confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={signUpErrors.confirmPassword}
                value={signUpValues.confirmPassword}
                onChange={(event) =>
                  setSignUpValues((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </>
          )}

          <div
            className={cn(
              "flex min-h-11 items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
              submitMessage
                ? "border-[color:var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning-foreground)]"
                : "border-dashed border-[color:var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
            )}
            aria-live="polite"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              {submitMessage ||
                "Use your library credentials to sign in or create a new account."}
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "signin"
                ? "Signing In..."
                : "Creating Account..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </Button>

          <p className="text-center text-sm text-[var(--color-muted-foreground)]">
            {mode === "signin" ? "New to the system?" : "Already have an account?"}{" "}
            <Link
              href={mode === "signin" ? "/sign-up" : "/sign-in"}
              className="font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
