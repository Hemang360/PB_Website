import { NextResponse } from "next/server";
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from "@/lib/server/members";
import { createLog } from "@/lib/server/logs";
import { type Members } from "@/lib/db/models/members";
import { verifyToken } from "@/lib/server/auth";
import connectDB from "@/lib/db/connection";
import { getPostHogClient } from "@/lib/posthog-server";

/*
 * GET /api/members
 *   searchParams: { id?: string }
 */
export async function GET(request: Request) {
  await connectDB()
  const { searchParams } = new URL(request.url);

  if (searchParams.has("id")) {
    const id = searchParams.get("id")!;
    const members = await getMemberById(id);
    if (!members)
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, members });
  }

  const members = await getAllMembers();
  return NextResponse.json({ success: true, members });
}

/*
 * POST /api/members
 *   Header
 *     { Authorization: "Bearer <token>" }
 *    Body { Members }
 *
 */
export async function POST(request: Request) {
  await connectDB()
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token)
    return NextResponse.json(
      { success: true, error: "Unauthorized" },
      { status: 401 },
    );

  const admin = await verifyToken(token);
  if (!admin?.email)
    return NextResponse.json(
      { success: true, error: "Unauthorized" },
      { status: 401 },
    );

  const body = await request.json();

  const { name, role, year }: Members = body;

  if (!name || !role || !year)
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );

  const newMember = await createMember({
    ...body,
  });

  await createLog({
    action: "CREATE",
    module: "members",
    email: admin.email,
    title: `Created member ${name}`,
  });

  const posthogCreate = getPostHogClient();
  if (posthogCreate) {
    posthogCreate.capture({
      distinctId: admin.email,
      event: "member_created",
      properties: { role, year },
    });
    await posthogCreate.flush();
  }

  return NextResponse.json({ success: true, member: newMember });
}

/*
 * PUT /api/members
 *   Header
 *     { Authorization: "Bearer <token>" }
 *   Body { Members } (must include _id)
 */
export async function PUT(request: Request) {
  await connectDB()
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const admin = await verifyToken(token);
  if (!admin?.email)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const body = await request.json();
  const { _id, name, role, year }: Members & { _id: string } = body;

  if (!_id)
    return NextResponse.json(
      { success: false, error: "Missing required field: _id" },
      { status: 400 },
    );

  if (!name || !role || !year)
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );

  const existing = await getMemberById(_id);
  if (!existing)
    return NextResponse.json(
      { success: false, error: "Member not found" },
      { status: 404 },
    );

  const updatedMember = await updateMember({ ...body });

  await createLog({
    action: "UPDATE",
    module: "members",
    email: admin.email,
    title: `Updated member ${name}`,
  });

  const posthogUpdate = getPostHogClient();
  if (posthogUpdate) {
    posthogUpdate.capture({
      distinctId: admin.email,
      event: "member_updated",
      properties: { role, year },
    });
    await posthogUpdate.flush();
  }

  return NextResponse.json({ success: true, member: updatedMember });
}

/*
 * DELETE /api/members
 *   Header
 *     { Authorization: "Bearer <token>" }
 *   searchParams: { id: string }
 */
export async function DELETE(request: Request) {
  await connectDB()
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const admin = await verifyToken(token);
  if (!admin?.email)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json(
      { success: false, error: "Missing required query param: id" },
      { status: 400 },
    );

  const existing = await getMemberById(id);
  if (!existing)
    return NextResponse.json(
      { success: false, error: "Member not found" },
      { status: 404 },
    );

  const deleted = await deleteMember(id);
  if (!deleted)
    return NextResponse.json(
      { success: false, error: "Failed to delete member" },
      { status: 500 },
    );

  await createLog({
    action: "DELETE",
    module: "members",
    email: admin.email,
    title: `Deleted member ${existing.name}`,
  });

  const posthogDelete = getPostHogClient();
  if (posthogDelete) {
    posthogDelete.capture({
      distinctId: admin.email,
      event: "member_deleted",
      properties: { role: existing.role, year: existing.year },
    });
    await posthogDelete.flush();
  }

  return NextResponse.json({ success: true });
}
