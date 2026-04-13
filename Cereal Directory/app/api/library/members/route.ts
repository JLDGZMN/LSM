import { NextResponse } from "next/server";

import { errorResponse, requireApiSession } from "@/lib/api-utils";
import { createMember, listMembers, type MemberInput } from "@/lib/library-data";

function parseMemberPayload(body: Record<string, unknown>): MemberInput {
  return {
    fullName: String(body.fullName ?? ""),
    studentId: String(body.studentId ?? ""),
    course: String(body.course ?? ""),
    section: String(body.section ?? ""),
  };
}

export async function GET(request: Request) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const members = await listMembers();
  return NextResponse.json({ data: members });
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = parseMemberPayload(
      (await request.json()) as Record<string, unknown>,
    );
    const id = await createMember(payload);
    return NextResponse.json({ data: await listMembers(), id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
