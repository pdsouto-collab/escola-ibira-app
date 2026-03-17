import { UserRole } from "./user-role";

export type User = {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
    email: string;
    password: string;

    // Additional Profile Fields
    cpf?: string;
    phone?: string;
    birthDate?: string;
    address?: string;
    currentPassword?: string; // Only for password updates/validation

    // Professional/Admin Fields
    hiringDate?: string;
    education?: string;
    specialization?: string[];
    bio?: string;
    status: "active" | "inactive";

    assignedClassIds?: string[]; // For teachers: IDs of classes they teach
    linkedStudentIds?: string[]; // For guardians: IDs of students they are responsible for
};
