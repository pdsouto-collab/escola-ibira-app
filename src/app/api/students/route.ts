import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      id, 
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
    
    if (!name || !classId) {
      return new NextResponse("Nome e Classe são obrigatórios", { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        id,
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
    console.error("[STUDENTS_POST]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
