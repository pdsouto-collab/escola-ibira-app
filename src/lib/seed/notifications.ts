import { AppNotification } from "@/types/notification";

export const notificationsDataSeed: AppNotification[] = [
    {
        id: "n1",
        userId: "u2", // Claudia (Teacher)
        title: "Novo Diário de Bordo",
        message: "O diário de bordo da Alice Souza foi atualizado pela coordenação.",
        type: "info",
        isRead: false,
        createdAt: new Date().toISOString(),
        studentId: "s1"
    },
    {
        id: "n2",
        userId: "u2",
        title: "Atividade Pendente",
        message: "Lembrete: Você tem avaliações pendentes para a turma Jardim I.",
        type: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: "n3",
        userId: "u2",
        title: "Projeto Concluído",
        message: "O projeto 'Pequenos Construtores' foi finalizado com sucesso!",
        type: "success",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
];
