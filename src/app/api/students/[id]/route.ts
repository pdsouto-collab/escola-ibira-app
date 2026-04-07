import { getServerSessionOrJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("[STUDENT_GET]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      name, 
      dateOfBirth, 
      document, 
      schoolStage, 
      period, 
      photo, 
      classId, 
      status, 
      age, 
      parentName, 
      guardians, 
      financialResponsible, 
      health, 
      emergencyContacts, 
      documents, 
      hospitalPreference, 
      hospitalAddress 
    } = body;

    const student = await prisma.student.update({
      where: {
        id,
      },
      data: {
        name,
        dateOfBirth,
        document,
        schoolStage,
        period,
        photo,
        classId,
        status,
        age,
        parentName,
        guardians: guardians || undefined,
        financialResponsible: financialResponsible || undefined,
        health: health || undefined,
        emergencyContacts: emergencyContacts || undefined,
        documents: documents || undefined,
        hospitalPreference,
        hospitalAddress
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("[STUDENT_PUT]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
        const session = await getServerSessionOrJwt();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

  try {
    const { id } = await params;

    await prisma.student.delete({
      where: {
        id,
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STUDENT_DELETE]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
