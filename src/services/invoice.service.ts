import { Invoice } from "@/types/invoice";

export async function getInvoices(): Promise<Invoice[]> {
    const res = await fetch("/api/invoices");
    if (!res.ok) {
        throw new Error("Failed to fetch invoices");
    }
    return res.json();
}

export async function createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create invoice");
    }
    
    return res.json();
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update invoice");
    }
    
    return res.json();
}

export async function deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE"
    });
    
    if (!res.ok) {
        throw new Error("Failed to delete invoice");
    }
}
