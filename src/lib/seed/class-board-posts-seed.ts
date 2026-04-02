import { ClassBoardPost } from "@/types/class-board-post";

export const classBoardPostsDataSeed: ClassBoardPost[] = [
    {
        id: "cbp1",
        classId: "jardim-i",
        authorId: "u2",
        authorName: "Profa. Cláudia",
        authorRole: "Responsável pela Turma",
        categoryType: "Projetos da Classe",
        linkedProjectId: "p1",
        title: "Cultivo de Hortaliças Hoje!",
        content: "Nossa tarde foi maravilhosa mexendo na terra.",
        extraMaterials: "Livro de Ciências: A Semente de Mostarda.",
        photos: ["https://images.unsplash.com/photo-1542601906960-daaeac71e9c9?q=80&w=800&auto=format&fit=crop"],
        createdAt: "2024-02-14T10:00:00.000Z"
    }
];
