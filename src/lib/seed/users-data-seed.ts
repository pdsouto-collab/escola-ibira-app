import { User } from "@/types/user";

export const usersDataSeed: User[] = [
    {
        id: "u1",
        name: "Ana Pereira",
        role: "director",
        email: "ana.diretora@escolaibira.com.br",
        password: '$2b$10$tbT3y17p0Z2bZOfHjsIIOOcbs.Q4Udf.iPBzZFKDP5y4LzWRajxiu', // 123
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
        status: "active",
        cpf: "123.456.789-00",
        phone: "(11) 98765-4321",
        hiringDate: "2010-01-15"
    },
    {
        id: "u2",
        name: "Cláudia Santos",
        role: "teacher",
        email: "claudia.prof@escolaibira.com.br",
        password: '$2b$10$tbT3y17p0Z2bZOfHjsIIOOcbs.Q4Udf.iPBzZFKDP5y4LzWRajxiu', // 123,
        assignedClassIds: ["jardim-i", "jardim-ii"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claudia",
        status: "active",
        cpf: "234.567.890-11",
        phone: "(11) 99887-7665",
        hiringDate: "2015-05-10",
        education: "Pedagogia - USP",
        specialization: ["Infantil", "BNCC", "Lúdico"]
    },
    {
        id: "u3",
        name: "Mariana Silva",
        role: "guardian",
        email: "mariana.mae@email.com",
        password: '$2b$10$tbT3y17p0Z2bZOfHjsIIOOcbs.Q4Udf.iPBzZFKDP5y4LzWRajxiu', // 123,
        linkedStudentIds: ["s1"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
        status: "active"
    },
    {
        id: "u4",
        name: "Carlos Admin",
        role: "admin",
        email: "admin@escolaibira.com.br",
        password: '$2b$10$tbT3y17p0Z2bZOfHjsIIOOcbs.Q4Udf.iPBzZFKDP5y4LzWRajxiu', // 123,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        status: "active",
    },
    {
        id: "u5",
        name: "Juliana Nutri",
        role: "nutritionist",
        email: "juliana.nutri@escolaibira.com.br",
        password: '$2b$10$tbT3y17p0Z2bZOfHjsIIOOcbs.Q4Udf.iPBzZFKDP5y4LzWRajxiu', // 123,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana",
        status: "active",
    }
];