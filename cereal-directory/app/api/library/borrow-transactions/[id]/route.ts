import { NextResponse } from "next/server";

import { errorResponse, requireApiSession } from "@/lib/api-utils";
import {
  deleteBorrowTransaction,
  listBorrowTransactions,
  updateBorrowTransaction,
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

function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid record id.");
  }

  return id;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const payload = parseTransactionPayload(
      (await request.json()) as Record<string, unknown>,
    );

    await updateBorrowTransaction(parseId(rawId), {
      ...payload,
      returnedToUserId:
        payload.status === "returned"
          ? payload.returnedToUserId ?? session.user.id
          : payload.returnedToUserId,
    });

    return NextResponse.json({ data: await listBorrowTransactions() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    await deleteBorrowTransaction(parseId(rawId));
    return NextResponse.json({ data: await listBorrowTransactions() });
  } catch (error) {
    return errorResponse(error);
  }
}
