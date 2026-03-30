import { SchoolClass } from "@/types/school-class";

export const schoolClassesDataSeed: SchoolClass[] = [
    { id: "bercario-i", name: "Berçário I", description: "0 a 1 ano" },
    { id: "bercario-ii", name: "Berçário II", description: "1 a 2 anos" },
    { id: "maternal-i", name: "Maternal I", description: "2 a 3 anos" },
    { id: "maternal-ii", name: "Maternal II", description: "3 a 4 anos" },
    { id: "jardim-i", name: "Jardim I", description: "4 a 5 anos", teacherId: "u2" }, // Assigned to Cláudia
    { id: "jardim-ii", name: "Jardim II", description: "5 a 6 anos", teacherId: "u2" }, // Assigned to Cláudia
];

