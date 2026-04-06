import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const progressList = await prisma.bnccProgress.findMany();
    return NextResponse.json(progressList);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { skillCode, status } = await request.json();

    // Logic: if status is "achieved", increment evidenceCount
    const existing = await prisma.bnccProgress.findUnique({
      where: { skillCode }
    });

    const isAchievingNow = status === "achieved";
    const currentCount = existing ? existing.evidenceCount : 0;
    const newCount = currentCount + (isAchievingNow ? 1 : 0);

    const updated = await prisma.bnccProgress.upsert({
      where: { skillCode },
      update: {
        status,
        evidenceCount: newCount
      },
      create: {
        skillCode,
        status,
        evidenceCount: isAchievingNow ? 1 : 0
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
