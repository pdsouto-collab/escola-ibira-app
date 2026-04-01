import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { dueDate: "asc" }
        });
        return NextResponse.json(invoices);
    } catch (error) {
        console.error("Erro ao buscar faturas:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validation could be added here
        if (!data.studentId || !data.description || !data.amount || !data.dueDate) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
        }

        const invoice = await prisma.invoice.create({
            data: {
                studentId: data.studentId,
                description: data.description,
                amount: data.amount,
                dueDate: data.dueDate,
                status: data.status || "pendente",
                paymentDate: data.paymentDate,
                paymentMethod: data.paymentMethod,
                bankId: data.bankId,
                barcode: data.barcode,
                pixCode: data.pixCode,
                pdfUrl: data.pdfUrl,
            }
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar fatura:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
