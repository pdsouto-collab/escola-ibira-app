export type ClassBoardCategoryType = "Projetos da Classe" | "Novidades da Turma";

export interface ClassBoardPost {
    id: string;
    classId: string;
    authorId: string;
    authorName: string;
    authorRole?: string;
    categoryType: ClassBoardCategoryType;
    linkedProjectId?: string;
    title: string;
    content: string;
    extraMaterials?: string;
    photos?: string[];
    createdAt: string;
}
