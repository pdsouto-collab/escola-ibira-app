export interface Invoice {
    id: string;
    studentId: string;
    description: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD
    status: "pendente" | "pago" | "atrasado" | "cancelado" | string;
    paymentDate?: string | null;
    paymentMethod?: "boleto" | "pix" | "cartao" | string | null;
    bankId?: string | null; // Itaú ID if registered
    barcode?: string | null;
    pixCode?: string | null;
    pdfUrl?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
