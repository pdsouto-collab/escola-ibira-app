import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;
    const body = await req.json();
    const { date, items } = body;

    // To update items, the simplest way is to delete all existing and create new ones
    // since items might have been removed, added or reordered.
    await prisma.menuItem.deleteMany({
      where: { menuId: id },
    });

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: {
        date,
        items: {
          create: items?.map((item: any) => ({
            time: item.time,
            title: item.title,
            description: item.description,
          })) || [],
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;
    
    await prisma.menu.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 });
  }
}
