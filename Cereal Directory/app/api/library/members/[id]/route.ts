import { NextResponse } from "next/server";

import { errorResponse, requireApiSession } from "@/lib/api-utils";
import { deleteMember, listMembers, updateMember, type MemberInput } from "@/lib/library-data";

function parseMemberPayload(body: Record<string, unknown>): MemberInput {
  return {
    fullName: String(body.fullName ?? ""),
    studentId: String(body.studentId ?? ""),
    course: String(body.course ?? ""),
    section: String(body.section ?? ""),
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
    const payload = parseMemberPayload(
      (await request.json()) as Record<string, unknown>,
    );

    await updateMember(id, payload);

    return NextResponse.json({ data: await listMembers() });
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
    await deleteMember(parseId(rawId));
    return NextResponse.json({ data: await listMembers() });
  } catch (error) {
    return errorResponse(error);
  }
}
