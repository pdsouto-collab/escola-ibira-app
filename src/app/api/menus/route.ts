import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const menus = await prisma.menu.findMany({
      include: {
        items: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const body = await req.json();
    const { date, items } = body;

    const newMenu = await prisma.menu.create({
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

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}
