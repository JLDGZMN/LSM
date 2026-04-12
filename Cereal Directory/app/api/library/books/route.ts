import { NextResponse } from "next/server";

import { errorResponse, requireApiSession } from "@/lib/api-utils";
import { createBook, listBooks, type BookInput } from "@/lib/library-data";

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

export async function GET(request: Request) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const books = await listBooks();
  return NextResponse.json({ data: books });
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = parseBookPayload(
      (await request.json()) as Record<string, unknown>,
    );
    const id = await createBook(payload);
    const books = await listBooks();

    return NextResponse.json({ data: books, id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
