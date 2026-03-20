import { StudentGuardian } from "./student-guardian";
import { StudentEmergencyContact } from "./student-emergency-contact";
import { StudentFinancialResponsible } from "./student-financial-responsible";
import { StudentHealth } from "./student-health";
import { StudentDocuments } from "./student-documents";

export interface Student {
    id: string;
    // Child Data
    name: string;
    dateOfBirth: string; // YYYY-MM-DD
    document?: string; // CPF/RG/Cert
    schoolStage?: string;
    period?: "integral" | "matutino";
    photo?: string;
    classId: string;
    status: "presente" | "ausente";

    // Kept for compatibility but derived if needed
    age: number; // Will try to compute or keep manual

    // Guardians (Max 2 usually)
    guardians: StudentGuardian[];
    // Parent Name for quick display compatibility
    parentName: string;

    // Financial
    financialResponsible?: StudentFinancialResponsible;

    // Health
    health?: StudentHealth;

    // Emergency
    emergencyContacts?: StudentEmergencyContact[];
    hospitalPreference?: string;
    hospitalAddress?: string;

    // Docs (URLs/Paths)
    documents?: StudentDocuments;
}
