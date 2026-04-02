import { Assessment } from "@/types/assessment";

export const assessmentsDataSeed: Omit<Assessment, 'attachments'>[] = [
    {
        id: "as-1",
        createdAt: "2024-02-15T10:00:00Z",
        knowledgeNodeId: "mic-sk-EF03CI04",
        sessionId: "7",
        scope: "student",
        studentId: "1",
        rating: 5,
        observations: "A Alice demonstrou uma curiosidade incrível durante a observação do canteiro. Ela conseguiu identificar as partes da planta sem ajuda e questionou sobre como a água chega até as folhas.",
    },
    {
        id: "as-2",
        createdAt: "2024-02-18T14:00:00Z",
        knowledgeNodeId: "mic-sk-EF03EF06",
        sessionId: "8",
        scope: "student",
        studentId: "1",
        rating: 4,
        observations: "Alice participou ativamente dos jogos de matriz indígena. Ela mostrou boa coordenação motora e respeitou as regras combinadas com o grupo, demonstrando empatia com os colegas.",
    },
    {
        id: "as-3",
        createdAt: "2024-02-20T09:30:00Z",
        knowledgeNodeId: "mic-sk-EF03MA19",
        sessionId: "9",
        scope: "student",
        studentId: "1",
        rating: 3,
        observations: "Durante a atividade de medição, a Alice começou a compreender a diferença entre comprimento e largura. Ela ainda precisa de apoio para usar a régua corretamente, mas a noção espacial está evoluindo bem.",
    },
    {
        id: "as-4",
        createdAt: "2024-02-22T11:00:00Z",
        knowledgeNodeId: "mic-sk-EF03CI06",
        scope: "student",
        studentId: "1",
        rating: 5,
        observations: "Destaque para a capacidade da Alice de classificar os animais por suas características físicas. Ela criou um 'álbum de figurinhas' mental muito organizado.",
    }
];

export const assessmentsAttachmentsDataSeed = [
    { id: "att-1", assessmentId: "as-1", type: "photo", url: "https://images.unsplash.com/photo-1542601906960-daaeac71e9c9?auto=format&fit=crop&q=80&w=400&h=400", capturedAt: "2024-02-15T10:05:00Z", name: "Exploração da horta" },
    { id: "att-2", assessmentId: "as-2", type: "photo", url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=400&h=400", capturedAt: "2024-02-18T14:30:00Z", name: "Atividade de pátio" },
    { id: "att-3", assessmentId: "as-3", type: "photo", url: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=400&h=400", capturedAt: "2024-02-20T10:00:00Z", name: "Medindo objetos" }
];
