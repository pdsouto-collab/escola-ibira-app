import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const date = searchParams.get("date");
        const classId = searchParams.get("classId");

        const whereClause: any = {};

        if (studentId) {
            whereClause.studentId = studentId;
        }

        if (date) {
            whereClause.date = date;
        }

        if (classId) {
            whereClause.student = { classId };
        }

        const logs = await prisma.dailyLog.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc"
            }
        });

        // Ensure we parse JSON correctly back to the type since Prisma stores Json
        // Prisma resolves Json correctly to any, but we map it explicitly
        return NextResponse.json(logs);
    } catch (error) {
        console.error("Erro ao buscar registros diários:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Support for array of items (bulk create from DailyLogDialog)
        if (Array.isArray(body)) {
            const dataToInsert = body.map(item => {
                const copy = { ...item };
                delete copy.id; // DB generates ID
                delete copy.createdAt;
                return copy;
            });

            const count = await prisma.dailyLog.createMany({
                data: dataToInsert
            });

            return NextResponse.json({ success: true, count: count.count });
        } else {
            // Single insertion
            const dataToInsert = { ...body };
            delete dataToInsert.id;
            delete dataToInsert.createdAt;
            
            const newLog = await prisma.dailyLog.create({
                data: dataToInsert
            });

            return NextResponse.json(newLog, { status: 201 });
        }
    } catch (error) {
        console.error("Erro ao criar registro(s) diário(s):", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
