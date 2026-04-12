import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function requireApiSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user ? session : null;
}

export function errorMessage(error: unknown) {
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
