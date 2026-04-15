import { NextResponse } from "next/server";

import { errorResponse, requireApiSession } from "@/lib/api-utils";
import {
  createBorrowTransaction,
  listBorrowTransactions,
  type BorrowStatus,
  type BorrowTransactionInput,
} from "@/lib/library-data";

function parseBorrowStatus(value: unknown): BorrowStatus {
  if (
    value === "returned" ||
    value === "overdue" ||
    value === "lost"
  ) {
    return value;
  }

  return "borrowed";
}

function parseTransactionPayload(body: Record<string, unknown>): BorrowTransactionInput {
  return {
    bookId: Number(body.bookId ?? 0),
    memberId: Number(body.memberId ?? 0),
    dueAt: String(body.dueAt ?? ""),
    borrowedAt:
      body.borrowedAt == null || body.borrowedAt === ""
        ? null
        : String(body.borrowedAt),
    returnedAt:
      body.returnedAt == null || body.returnedAt === ""
        ? null
        : String(body.returnedAt),
    status: parseBorrowStatus(body.status),
    notes: body.notes == null ? null : String(body.notes),
    issuedByUserId:
      body.issuedByUserId == null || body.issuedByUserId === ""
        ? null
        : String(body.issuedByUserId),
    returnedToUserId:
      body.returnedToUserId == null || body.returnedToUserId === ""
        ? null
        : String(body.returnedToUserId),
  };
}

export async function GET(request: Request) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const borrowTransactions = await listBorrowTransactions();
  return NextResponse.json({ data: borrowTransactions });
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = parseTransactionPayload(
      (await request.json()) as Record<string, unknown>,
    );
    const id = await createBorrowTransaction({
      ...payload,
      issuedByUserId: payload.issuedByUserId ?? session.user.id,
    });

    return NextResponse.json(
      { data: await listBorrowTransactions(), id },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
