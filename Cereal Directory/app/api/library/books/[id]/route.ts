import { NextResponse } from "next/server";

import { errorResponse, requireApiSession } from "@/lib/api-utils";
import { deleteBook, listBooks, updateBook, type BookInput } from "@/lib/library-data";

function parseBookPayload(body: Record<string, unknown>): BookInput {
  const publishedYear =
    body.publishedYear === "" || body.publishedYear == null
      ? null
      : Number(body.publishedYear);

  return {
    categoryId:
      body.categoryId === "" || body.categoryId == null ? null : Number(body.categoryId),
    title: String(body.title ?? ""),
    isbn: body.isbn == null ? null : String(body.isbn),
    author: String(body.author ?? ""),
    publisher: body.publisher == null ? null : String(body.publisher),
    publishedYear: publishedYear && !Number.isNaN(publishedYear) ? publishedYear : null,
    shelfLocation:
      body.shelfLocation == null ? null : String(body.shelfLocation),
    totalCopies: Number(body.totalCopies ?? 0),
    availableCopies: Number(body.availableCopies ?? 0),
    status: "available",
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
    const id = parseId(rawId);
    const payload = parseBookPayload(
      (await request.json()) as Record<string, unknown>,
    );

    await updateBook(id, payload);

    return NextResponse.json({ data: await listBooks() });
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
    await deleteBook(parseId(rawId));
    return NextResponse.json({ data: await listBooks() });
  } catch (error) {
    return errorResponse(error);
  }
}
