import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function requireApiSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user ? session : null;
}

export function errorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: string }).code === "string"
  ) {
    const code = (error as { code: string }).code;

    if (code === "ER_DUP_ENTRY") {
      return "That record already exists. Please use a unique value and try again.";
    }

    if (code === "ER_ROW_IS_REFERENCED_2") {
      return "This record is still linked to other records and cannot be deleted yet.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while processing your request.";
}

export function errorResponse(error: unknown, status = 400) {
  return NextResponse.json(
    {
      error: errorMessage(error),
    },
    { status },
  );
}
