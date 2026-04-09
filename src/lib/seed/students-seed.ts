import { Student } from "@/types/student";

export const studentsDataSeed: Student[] = [
    {
        id: "s1",
        name: "Alice Souza",
        age: 4,
        dateOfBirth: "2020-05-15",
        status: "presente",
        parentName: "Mariana Souza",
        classId: "jardim-i",
        guardians: [
            { name: "Mariana Souza", kinship: "Mãe", phone: "(11) 99999-9999", email: "mariana@email.com" }
        ],
        emergencyContacts: [
            { name: "Carlos Souza", kinship: "Pai", phone: "(11) 98888-8888" }
        ]
    },
    {
        id: "s2",
        name: "Bernardo Silva",
        age: 5,
        dateOfBirth: "2019-08-20",
        status: "presente",
        parentName: "Carlos Silva",
        classId: "jardim-ii",
        guardians: [
            { name: "Carlos Silva", kinship: "Pai", phone: "(11) 97777-7777" }
        ]
    },
    {
        id: "s3",
        name: "Clara Oliveira",
        age: 3,
        dateOfBirth: "2021-02-10",
        status: "ausente",
        parentName: "Fernanda Oliveira",
        classId: "maternal-ii",
        guardians: [
            { name: "Fernanda Oliveira", kinship: "Mãe", phone: "(11) 96666-6666" }
        ]
    },
    {
        id: "s4",
        name: "Davi Santos",
        age: 4,
        dateOfBirth: "2020-11-05",
        status: "presente",
        parentName: "Roberto Santos",
        classId: "jardim-i",
        guardians: [
            { name: "Roberto Santos", kinship: "Pai", phone: "(11) 95555-5555" }
        ]
    },
    {
        id: "s5",
        name: "Enzo Pereira",
        age: 5,
        dateOfBirth: "2019-06-30",
        status: "presente",
        parentName: "Juliana Pereira",
        classId: "jardim-ii",
        guardians: [
            { name: "Juliana Pereira", kinship: "Mãe", phone: "(11) 94444-4444" }
        ]
    },
    {
        id: "s6",
        name: "Valentina Costa",
        age: 3,
        dateOfBirth: "2021-04-12",
        status: "presente",
        parentName: "Amanda Costa",
        classId: "maternal-ii",
        guardians: [
            { name: "Amanda Costa", kinship: "Mãe", phone: "(11) 93333-3333" }
        ]
    },
];