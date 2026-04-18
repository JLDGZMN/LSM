"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

const passwordRuleText =
  "Use at least 8 characters with no spaces, uppercase, lowercase, number, and special character.";

function lettersOnly(value: string) {
  return value.replace(/[^A-Za-z\s.'-]/g, "");
}

function validateStrongPassword(value: string) {
  if (value.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (/\s/.test(value)) {
    return "Password cannot contain spaces.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must include an uppercase letter.";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must include a lowercase letter.";
  }

  if (!/\d/.test(value)) {
    return "Password must include a number.";
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must include a special character.";
  }

  return "";
}

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "No spaces",
    test: (value: string) => !/\s/.test(value),
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
  {
    label: "One special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

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
    fullName: values.fullName.trim()
      ? /\d/.test(values.fullName)
        ? "Full name cannot contain numbers."
        : ""
      : "Enter your full name.",
    username:
      values.username.trim().length >= 3
        ? ""
        : "Username must be at least 3 characters.",
    email: /\S+@\S+\.\S+/.test(values.email)
      ? ""
      : "Enter a valid email address.",
    password: validateStrongPassword(values.password),
    confirmPassword:
      values.confirmPassword.length === 0
        ? "Confirm your password."
        : values.confirmPassword === values.password
          ? ""
          : "Passwords do not match.",
  };
}

function hasErrors(errors: Record<string, string>) {
  return Object.values(errors).some(Boolean);
}

function getFirstErrorField(errors: Record<string, string>) {
  return Object.entries(errors).find(([, error]) => Boolean(error))?.[0] ?? null;
}

const fieldIds: Record<AuthMode, Record<string, string>> = {
  signin: {
    identifier: "identifier",
    password: "password",
  },
  signup: {
    fullName: "full-name",
    username: "username",
    email: "email",
    password: "new-password",
    confirmPassword: "confirm-password",
  },
};

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  autoComplete?: string;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  title?: string;
  type?: React.HTMLInputTypeAttribute;
  onChange: (value: string) => void;
}

function FormField({
  autoComplete,
  error,
  id,
  label,
  minLength,
  onChange,
  pattern,
  placeholder,
  required,
  title,
  type = "text",
  value,
}: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        minLength={minLength}
        pattern={pattern}
        required={required}
        title={title}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          error &&
            "border-[color:var(--color-danger)] bg-rose-50/40 focus-visible:ring-[var(--color-danger)]",
        )}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordChecklist({ value }: { value: string }) {
  return (
    <div
      className="grid gap-2 rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 sm:grid-cols-2"
      aria-live="polite"
    >
      {passwordRules.map((rule) => {
        const passed = rule.test(value);

        return (
          <div
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-xs font-medium transition-colors",
              passed
                ? "text-emerald-700"
                : "text-[var(--color-muted-foreground)]",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border",
                passed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-[color:var(--color-border)] bg-white/80",
              )}
              aria-hidden="true"
            >
              {passed ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            </span>
            <span>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PasswordMatchStatus({
  confirmPassword,
  password,
}: {
  confirmPassword: string;
  password: string;
}) {
  const hasConfirmation = confirmPassword.length > 0;
  const matches = hasConfirmation && confirmPassword === password;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium",
        !hasConfirmation
          ? "border-[color:var(--color-border)] bg-white text-[var(--color-muted-foreground)]"
          : matches
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-[var(--color-danger)]",
      )}
      aria-live="polite"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          !hasConfirmation
            ? "border-[color:var(--color-border)] bg-white/80"
            : matches
              ? "border-emerald-200 bg-white"
              : "border-rose-200 bg-white",
        )}
        aria-hidden="true"
      >
        {matches ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      </span>
      <span>
        {!hasConfirmation
          ? "Confirm password to check the match."
          : matches
            ? "Passwords match."
            : "Passwords do not match."}
      </span>
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
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    data: session,
    isPending: isSessionPending,
  } = authClient.useSession();

  React.useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [router, session]);

  React.useEffect(() => {
    setMode(initialMode);
    setHasAttemptedSubmit(false);
  }, [initialMode]);

  const signInErrors = getSignInErrors(signInValues);
  const signUpErrors = getSignUpErrors(signUpValues);

  const currentErrors = mode === "signin" ? signInErrors : signUpErrors;
  const visibleSignInErrors = hasAttemptedSubmit ? signInErrors : signInDefaults;
  const visibleSignUpErrors = hasAttemptedSubmit ? signUpErrors : signUpDefaults;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);

    if (hasErrors(currentErrors)) {
      const firstField = getFirstErrorField(currentErrors);
      const firstError = Object.values(currentErrors).find(Boolean);
      const firstFieldId = firstField ? fieldIds[mode][firstField] : null;

      if (firstFieldId) {
        requestAnimationFrame(() => {
          document.getElementById(firstFieldId)?.focus();
        });
      }

      toast.error("Please review the highlighted field", {
        description: firstError || "Complete the required fields before continuing.",
      });
      return;
    }

    setIsSubmitting(true);

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
          toast.error("Unable to sign in", {
            description:
              result.error.message || "Please check your credentials and try again.",
          });
          return;
        }

        toast.success("Signed in successfully");
        setHasAttemptedSubmit(false);
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
        toast.error("Unable to create your account", {
          description: result.error.message || "Please try again.",
        });
        return;
      }

      toast.success("Account created", {
        description: "Please sign in with your new credentials.",
      });
      setSignUpValues(signUpDefaults);
      setHasAttemptedSubmit(false);
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error(mode === "signin" ? "Unable to sign in" : "Unable to create your account", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
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
      <CardHeader className="space-y-4">
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
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {mode === "signin" ? (
            <>
              <FormField
                id="identifier"
                label="Email or Username"
                placeholder="Enter your email or username"
                autoComplete="username"
                value={signInValues.identifier}
                error={visibleSignInErrors.identifier}
                required
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
                error={visibleSignInErrors.password}
                required
                minLength={8}
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
                error={visibleSignUpErrors.fullName}
                required
                pattern="[A-Za-z\s.'-]+"
                onChange={(fullName) =>
                  setSignUpValues((current) => ({
                    ...current,
                    fullName: lettersOnly(fullName),
                  }))
                }
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="username"
                  label="Username"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={signUpValues.username}
                  error={visibleSignUpErrors.username}
                  required
                  minLength={3}
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
                  error={visibleSignUpErrors.email}
                  required
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
                error={visibleSignUpErrors.password}
                required
                minLength={8}
                pattern="(?=\\S{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).*"
                title={passwordRuleText}
                value={signUpValues.password}
                onChange={(event) =>
                  setSignUpValues((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <PasswordChecklist value={signUpValues.password} />
              <PasswordField
                id="confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={visibleSignUpErrors.confirmPassword}
                required
                minLength={8}
                value={signUpValues.confirmPassword}
                onChange={(event) =>
                  setSignUpValues((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
              <PasswordMatchStatus
                password={signUpValues.password}
                confirmPassword={signUpValues.confirmPassword}
              />
            </>
          )}

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
