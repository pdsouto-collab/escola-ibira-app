// --- 4-LEVEL KNOWLEDGE HIERARCHY ---
// L1 = Macro (Eixo / Área do Saber)
// L2 = Mesclado (Competência / Tópico)
// L3 = Micro (Habilidade / Objetivo de Aprendizagem) -> Links to LibraryItem ID
// L4 = Atômico (Habilidade Específica / Evidência de Conteúdo) -> Checkpoints for Teachers
export type KnowledgeLevel = "macro" | "mesclado" | "micro" | "atomico";

export interface KnowledgeNode {
    id: string;
    level: KnowledgeLevel;
    type: "skill" | "content";
    name: string; // The label/name of the level (e.g. "Natureza e Sociedade" or "Compreensão de Adição")
    description?: string; // Optional detailed description
    libraryItemId?: string; // ONLY for L3 (Micro): points to an item in `libraryItems`
    linkedNodeIds?: string[]; // For Cross-Linking: L3/L4 Contenúdo mapping to L3/L4 Habilidades
    children: KnowledgeNode[]; // Nested nodes down the hierarchy
}

// Initial mock data to bootstrap the trees
export const mockSkillsTree: KnowledgeNode[] = [
    {
        id: "sk-macro-1",
        level: "macro",
        type: "skill",
        name: "Linguagens",
        children: [
            {
                id: "sk-mesclado-1",
                level: "mesclado",
                type: "skill",
                name: "Comunicação",
                children: [
                    {
                        id: "sk-micro-1",
                        level: "micro",
                        type: "skill",
                        name: "Escuta ativa e fala", // In reality, pulls from LibraryItem
                        libraryItemId: "EF01LP01", // Assuming this BNCC code exists in the library
                        children: [
                            {
                                id: "sk-ato-1",
                                level: "atomico",
                                type: "skill",
                                name: "Espera a vez de falar e ouve o colega",
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export const mockContentsTree: KnowledgeNode[] = [
    {
        id: "co-macro-1",
        level: "macro",
        type: "content",
        name: "Lógica e Matemática",
        children: [
            {
                id: "co-mesclado-1",
                level: "mesclado",
                type: "content",
                name: "Números e Operações",
                children: [
                    {
                        id: "co-micro-1",
                        level: "micro",
                        type: "content",
                        name: "Compreensão de Adição",
                        libraryItemId: "EF01MA01", // Assuming this BNCC code exists
                        linkedNodeIds: ["sk-micro-1"], // Cross-linked to the skill above
                        children: [
                            {
                                id: "co-ato-1",
                                level: "atomico",
                                type: "content",
                                name: "Resolve somas simples de um dígito usando material concreto",
                                linkedNodeIds: ["sk-ato-1"], // Cross-linked to the specific skill evidence
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export type Status = "not-started" | "in-progress" | "achieved";

export interface Indicator {
    id: string;
    label: string;
    status: Status;
    evidenceCount?: number;
}

export interface Theme {
    id: string;
    title: string;
    color: string; // Tailwind class equivalent for border/bg
    icon?: string;
    indicators: Indicator[];
}

export const mockCurriculum: Theme[] = [
    {
        id: "identity",
        title: "Identidade e Autonomia",
        color: "orange",
        indicators: [
            { id: "id-1", label: "Reconhece a si mesmo no espelho", status: "achieved", evidenceCount: 2 },
            { id: "id-2", label: "Expressa necessidades básicas", status: "achieved", evidenceCount: 5 },
            { id: "id-3", label: "Interage com outras crianças", status: "in-progress", evidenceCount: 1 },
            { id: "id-4", label: "Cuida dos pertences pessoais", status: "not-started" },
        ]
    },
    {
        id: "body",
        title: "Corpo e Movimento",
        color: "blue",
        indicators: [
            { id: "mv-1", label: "Corre com segurança", status: "achieved", evidenceCount: 3 },
            { id: "mv-2", label: "Salta com dois pés", status: "in-progress", evidenceCount: 1 },
            { id: "mv-3", label: "Manipula objetos pequenos", status: "in-progress", evidenceCount: 2 },
            { id: "mv-4", label: "Dança e segue ritmos", status: "not-started" },
        ]
    },
    {
        id: "nature",
        title: "Traços, Sons, Cores e Formas",
        color: "teal",
        indicators: [
            { id: "art-1", label: "Explora tintas e texturas", status: "achieved", evidenceCount: 8 },
            { id: "art-2", label: "Produz sons com objetos", status: "in-progress", evidenceCount: 2 },
            { id: "art-3", label: "Reconhece cores primárias", status: "not-started" },
        ]
    }
];

export const mockContent: Theme[] = [
    {
        id: "nature-soc",
        title: "Natureza e Sociedade",
        color: "purple",
        indicators: [
            { id: "ns-1", label: "Os animais e seus habitats", status: "achieved", evidenceCount: 4 },
            { id: "ns-2", label: "Preservação do meio ambiente", status: "in-progress", evidenceCount: 2 },
            { id: "ns-3", label: "Fenômenos naturais", status: "not-started" },
            { id: "ns-4", label: "O corpo humano", status: "achieved", evidenceCount: 3 },
        ]
    },
    {
        id: "math",
        title: "Matemática",
        color: "indigo",
        indicators: [
            { id: "mt-1", label: "Contagem até 10", status: "achieved", evidenceCount: 6 },
            { id: "mt-2", label: "Formas geométricas", status: "in-progress", evidenceCount: 2 },
            { id: "mt-3", label: "Noções de grandeza", status: "not-started" },
        ]
    },
    {
        id: "lang",
        title: "Linguagem Oral e Escrita",
        color: "pink",
        indicators: [
            { id: "lg-1", label: "Escuta atenta de histórias", status: "achieved", evidenceCount: 5 },
            { id: "lg-2", label: "Reconto de histórias", status: "in-progress", evidenceCount: 1 },
            { id: "lg-3", label: "Garatuja e escrita espontânea", status: "in-progress", evidenceCount: 3 },
            { id: "lg-4", label: "Reconhecimento do próprio nome", status: "achieved", evidenceCount: 2 },
        ]
    }
];

export interface ScheduleItem {
    id: string;
    time: string;
    endTime?: string;
    title: string;
    type: "activity" | "meal" | "care";
    description?: string;
    date?: string; // YYYY-MM-DD
    classId?: string;
    projectId?: string;
    routineId?: string; // Links items created as a bulk routine
}

export const mockSchedule: ScheduleItem[] = [
    {
        id: "1",
        time: "08:00",
        endTime: "09:00",
        title: "Chegada e Acolhimento",
        type: "care",
        description: "Recepção das crianças e brincadeira livre.",
        classId: "jardim-i"
    },
    {
        id: "2",
        time: "09:00",
        endTime: "09:30",
        title: "Roda de Conversa",
        type: "activity",
        description: "Momento de compartilhar novidades e planejar o dia.",
        classId: "jardim-i"
    },
    {
        id: "3",
        time: "09:30",
        endTime: "10:00",
        title: "Lanche da Manhã",
        type: "meal",
        description: "Frutas da estação e suco natural.",
        classId: "jardim-i"
    },
    {
        id: "4",
        time: "10:00",
        endTime: "11:30",
        title: "Atividade de Pátio",
        type: "activity",
        description: "Brincadeiras dirigidas e exploração do espaço externo.",
        classId: "jardim-i"
    },
    {
        id: "5",
        time: "11:30",
        endTime: "13:00",
        title: "Almoço",
        type: "meal",
        description: "Arroz, feijão, legumes e proteína.",
        classId: "jardim-i"
    },
    {
        id: "6",
        time: "13:00",
        endTime: "15:00",
        title: "Descanso / Sono",
        type: "care",
        description: "Momento de repouso.",
        classId: "jardim-i"
    },
];

export interface SchoolClass {
    id: string;
    name: string;
    description?: string;
    teacherId?: string; // ID of the assigned teacher
}

export const mockClasses: SchoolClass[] = [
    { id: "bercario-i", name: "Berçário I", description: "0 a 1 ano" },
    { id: "bercario-ii", name: "Berçário II", description: "1 a 2 anos" },
    { id: "maternal-i", name: "Maternal I", description: "2 a 3 anos" },
    { id: "maternal-ii", name: "Maternal II", description: "3 a 4 anos" },
    { id: "jardim-i", name: "Jardim I", description: "4 a 5 anos", teacherId: "u2" }, // Assigned to Cláudia
    { id: "jardim-ii", name: "Jardim II", description: "5 a 6 anos", teacherId: "u2" }, // Assigned to Cláudia
];

export interface Guardian {
    name: string;
    cpf?: string;
    kinship: string;
    phone: string;
    address?: string;
    email?: string;
}

export interface EmergencyContact {
    name: string;
    kinship: string;
    phone: string;
}

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
    guardians: Guardian[];
    // Parent Name for quick display compatibility
    parentName: string;

    // Financial
    financialResponsible?: {
        name: string;
        phone: string;
        cpf: string;
        address: string;
        email: string;
    };

    // Health
    health?: {
        hasChronicIssue: boolean;
        chronicIssueDetail?: string;
        hasAllergy: boolean;
        allergyDetail?: string;
        hasDietaryRestriction: boolean;
        dietaryRestrictionDetail?: string;
        emergencyAction?: string; // "Em caso de manifestação alérgica..."
        feverProcedure?: string; // "Em caso de febre..."
        pediatricianName?: string;
        pediatricianPhone?: string;
        hasHealthInsurance: boolean;
        healthInsuranceDetail?: string;
        otherInfo?: string;
    };

    // Emergency
    emergencyContacts?: EmergencyContact[];
    hospitalPreference?: string;
    hospitalAddress?: string;

    // Docs (URLs/Paths)
    documents?: {
        childDoc?: string;
        vaccinationCard?: string;
        guardianDoc?: string;
        insuranceCard?: string;
    }
}

export const mockStudents: Student[] = [
    {
        id: "1",
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
        id: "2",
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
        id: "3",
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
        id: "4",
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
        id: "5",
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
        id: "6",
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

export interface ProgressRecord {
    studentId: string;
    indicatorId: string;
    status: Status;
    evidenceCount?: number;
}

export const mockProgress: ProgressRecord[] = [
    { studentId: "1", indicatorId: "id-1", status: "achieved", evidenceCount: 1 },
    { studentId: "1", indicatorId: "id-2", status: "in-progress", evidenceCount: 0 },
    { studentId: "1", indicatorId: "mv-1", status: "achieved", evidenceCount: 2 },

    { studentId: "2", indicatorId: "id-1", status: "in-progress", evidenceCount: 1 },
    { studentId: "2", indicatorId: "art-1", status: "achieved", evidenceCount: 3 },
];

export function getStudentCurriculum(studentId: string): Theme[] {
    return mockCurriculum.map(theme => ({
        ...theme,
        indicators: theme.indicators.map(indicator => {
            const record = mockProgress.find(p => p.studentId === studentId && p.indicatorId === indicator.id);
            return record ? { ...indicator, status: record.status, evidenceCount: record.evidenceCount } : { ...indicator, status: "not-started", evidenceCount: 0 };
        })
    }));
}

export type NodeType = "area" | "component" | "unit" | "skill" | "trunk" | "root";

export interface MosaicNode {
    id: string;
    label: string;
    type: NodeType;
    status: Status;
    evidenceCount?: number;
    weight?: number; // For manual sizing if needed
    color?: string; // Hex code or Tailwind class
    children?: MosaicNode[];
}

export const mockRecursiveDataSkills: MosaicNode[] = [
    {
        id: "artes",
        label: "Artes",
        type: "area",
        status: "in-progress",
        color: "#2980B9", // Vivid Blue
        children: [
            {
                id: "artes-visuais",
                label: "Artes Visuais",
                type: "component",
                status: "in-progress",
                children: [
                    {
                        id: "criacao",
                        label: "Criação e Expressão",
                        type: "unit",
                        status: "achieved",
                        children: [
                            { id: "av-1", label: "Explora materiais diversos", type: "skill", status: "achieved", evidenceCount: 3 },
                            { id: "av-2", label: "Cria desenhos espontâneos", type: "skill", status: "achieved", evidenceCount: 5 }
                        ]
                    },
                    {
                        id: "apreciacao",
                        label: "Apreciação Estética",
                        type: "component",
                        status: "achieved",
                        children: [
                            { id: "ident-1", label: "Conta histórias", type: "skill", status: "achieved" },
                            { id: "ident-2", label: "Expressa sentimentos", type: "skill", status: "achieved" },
                            { id: "artes-3", label: "Explora materiais", type: "skill", status: "in-progress" }
                        ]
                    },
                    {
                        id: "musica",
                        label: "Música",
                        type: "component",
                        status: "in-progress",
                        children: [
                            { id: "musica-1", label: "Acompanha o ritmo", type: "skill", status: "achieved" },
                            { id: "musica-2", label: "Dança livremente", type: "skill", status: "in-progress" }
                        ]
                    }
                ]
            },
            {
                id: "natureza",
                label: "Natureza e Sociedade",
                type: "area",
                status: "in-progress",
                color: "#48BB78", // Green (Reference: Center-Left branch)
                children: [
                    {
                        id: "meio-ambiente",
                        label: "Meio Ambiente",
                        type: "component",
                        status: "in-progress",
                        children: [
                            { id: "nat-1", label: "Cuida das plantas", type: "skill", status: "achieved" },
                            { id: "nat-2", label: "Separa o lixo", type: "skill", status: "not-started" }
                        ]
                    },
                    {
                        id: "seres-vivos",
                        label: "Seres Vivos",
                        type: "component",
                        status: "not-started",
                        children: [
                            { id: "nat-3", label: "Identifica animais", type: "skill", status: "not-started" }
                        ]
                    }
                ]
            },
            {
                id: "linguagem",
                label: "Linguagem",
                type: "area",
                status: "in-progress",
                color: "#805AD5", // Purple (Reference: Center-Right branch)
                children: [
                    {
                        id: "escrita",
                        label: "Escrita",
                        type: "component",
                        status: "in-progress",
                        children: [
                            { id: "ling-1", label: "Escreve o próprio nome", type: "skill", status: "achieved" },
                            { id: "ling-2", label: "Reconhece letras", type: "skill", status: "in-progress" }
                        ]
                    }
                ]
            },
            {
                id: "identidade",
                label: "Identidade",
                type: "area",
                status: "in-progress",
                color: "#E67E22", // Vivid Orange to match "Anexo 1" vibe as 4th color
            }
        ]
    }
];

export const mockRecursiveDataContent: MosaicNode[] = [
    // ... Content data would go here
];

export interface BNCCSkill {
    code: string;
    description: string;
    category: string; // e.g., "Matéria e energia"
}

export interface BNCCSubject {
    id: string;
    name: string;
    skills: BNCCSkill[];
}

export const mockBNCCData: BNCCSubject[] = [
    {
        id: "ciencias",
        name: "Ciências",
        skills: [
            { code: "EF01CI01", description: "Comparar características de diferentes materiais presentes em objetos de uso cotidiano.", category: "Matéria e energia" },
            { code: "EF02CI01", description: "Identificar de que materiais são feitos os objetos de uso cotidiano.", category: "Matéria e energia" },
            { code: "EF03CI01", description: "Produzir diferentes sons a partir da vibração de variados objetos.", category: "Matéria e energia" },
            { code: "EF01CI02", description: "Localizar e nomear partes do corpo humano.", category: "Vida e evolução" },
            { code: "EF02CI04", description: "Descrever características de plantas e animais.", category: "Vida e evolução" },
            { code: "EF03CI07", description: "Identificar características da Terra e do Sol.", category: "Terra e Universo" }
        ]
    },
    {
        id: "geografia",
        name: "Geografia",
        skills: [
            { code: "EF01GE01", description: "Descrever características observadas de seus lugares de vivência.", category: "O sujeito e seu lugar no mundo" },
            { code: "EF02GE04", description: "Reconhecer semelhanças e diferenças nos hábitos das pessoas.", category: "Conexões e escalas" }
        ]
    },
    {
        id: "historia",
        name: "História",
        skills: [
            { code: "EF01HI01", description: "Identificar aspectos do seu crescimento.", category: "Mundo pessoal" },
            { code: "EF02HI03", description: "Selecionar situações cotidianas que remetam à percepção de mudança.", category: "Comunidade e seus registros" }
        ]
    },
    {
        id: "portugues",
        name: "Língua Portuguesa",
        skills: [
            { code: "EF01LP01", description: "Reconhecer que textos são lidos e escritos da esquerda para a direita.", category: "Leitura/Escuta" },
            { code: "EF02LP04", description: "Ler e escrever corretamente palavras com sílabas CV, V, CVC.", category: "Escrita" }
        ]
    },
    {
        id: "matematica",
        name: "Matemática",
        skills: [
            { code: "EF01MA01", description: "Utilizar números naturais como indicador de quantidade.", category: "Números" },
            { code: "EF02MA06", description: "Resolver problemas de adição e subtração.", category: "Números" },
            { code: "EF03MA13", description: "Associar figuras geométricas espaciais a objetos do mundo físico.", category: "Geometria" }
        ]
    }
];



export interface DailyLog {
    id: string;
    studentId: string;
    date: string;
    mood: "happy" | "neutral" | "sad" | "tired" | "excited";
    meals: {
        breakfast: "all" | "most" | "some" | "none";
        lunch: "all" | "most" | "some" | "none";
        snack: "all" | "most" | "some" | "none";
    };
    nap: {
        start: string;
        end: string;
    };
    activities: string[];
    notes: string;
}

export const mockDailyLogs: DailyLog[] = [
    {
        id: "log-1",
        studentId: "1",
        date: "2024-02-12",
        mood: "happy",
        meals: {
            breakfast: "all",
            lunch: "most",
            snack: "all"
        },
        nap: {
            start: "13:00",
            end: "14:30"
        },
        activities: ["Roda de música", "Pintura com dedos", "Parquinho"],
        notes: "Alice estava muito participativa hoje, especialmente na aula de música."
    },
    {
        id: "log-2",
        studentId: "2",
        date: "2024-02-12",
        mood: "excited",
        meals: {
            breakfast: "most",
            lunch: "all",
            snack: "most"
        },
        nap: {
            start: "13:15",
            end: "14:15"
        },
        activities: ["Blocos de montar", "História dos 3 porquinhos", "Jardinagem"],
        notes: "Bernardo ajudou os colegas a organizar os brinquedos."
    }
];

export interface PortfolioEntry {
    id: string;
    studentId: string;
    date: string;
    title: string;
    description: string;
    imageUrl?: string;
    tags: string[];
}

// --- NEW ENHANCED LIBRARY STRUCTURE ---
export interface LibraryItem {
    id: string;
    type: "skill" | "content";
    code?: string; // Only for BNCC skills (e.g. EF01 MA01)
    name: string; // The category, title, or short name
    description: string; // The full text or content detail
    isBNCC: boolean;
    subGroup: string; // e.g. "Ciências", "Matemática", "Projetos Culturais"
}

import { bnccData } from "./bncc-data";

// Comprehensive Mock Data spanning multiple BNCC subjects and custom examples
export const mockLibraryItems: LibraryItem[] = [
    ...bnccData,
    // --- CUSTOM CATEGORY EXAMPLES ---
    { id: "lib-custom-sk-01", type: "skill", name: "Inteligência Emocional", description: "Identificar e nomear as próprias emoções em situações de conflito no parquinho.", isBNCC: false, subGroup: "Sócio-Emocional" },
    { id: "lib-custom-co-01", type: "content", name: "Horta Comunitária", description: "Técnicas de plantio e cuidado diário com hortaliças no ambiente escolar.", isBNCC: false, subGroup: "Projetos Especiais" }
];

export const mockPortfolio: PortfolioEntry[] = [
    {
        id: "port-1",
        studentId: "1",
        date: "2024-02-10",
        title: "Explorando Texturas",
        description: "Atividade sensorial com areia, água e folhas secas. Alice demonstrou muita curiosidade.",
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=300&h=200",
        tags: ["Natureza", "Sensorial", "Artes"]
    },
    {
        id: "port-2",
        studentId: "1",
        date: "2024-02-05",
        title: "Primeira Letra do Nome",
        description: "Alice identificou a letra 'A' em cartazes pela sala e tentou traçá-la na areia.",
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=300&h=200", // Placeholder
        tags: ["Linguagem", "Escrita"]
    },
    {
        id: "port-3",
        studentId: "2",
        date: "2024-02-11",
        title: "Construção Coletiva",
        description: "Bernardo liderou o grupo na construção de um castelo com blocos de madeira.",
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=300&h=200", // Placeholder
        tags: ["Matemática", "Socialização"]
    }
];

export interface Contact {
    id: string;
    name: string;
    role: "Mãe" | "Pai" | "Responsável";
    studentName: string;
    studentId: string;
    avatarUrl?: string;
    unreadCount: number;
    lastMessage: string;
    lastMessageTime: string;
}

export const mockContacts: Contact[] = [
    {
        id: "c1",
        name: "Mariana Silva",
        role: "Mãe",
        studentName: "Alice Silva",
        studentId: "1",
        unreadCount: 2,
        lastMessage: "Olá, a Alice esqueceu o casaco?",
        lastMessageTime: "10:30"
    },
    {
        id: "c2",
        name: "Carlos Souza",
        role: "Pai",
        studentName: "Bernardo Souza",
        studentId: "2",
        unreadCount: 0,
        lastMessage: "Obrigado pelas fotos!",
        lastMessageTime: "Ontem"
    },
    {
        id: "c3",
        name: "Fernanda Lima",
        role: "Mãe",
        studentName: "Clara Lima",
        studentId: "3",
        unreadCount: 0,
        lastMessage: "Ela vai chegar um pouco atrasada amanhã.",
        lastMessageTime: "Ontem"
    }
];

export interface Message {
    id: string;
    contactId: string;
    sender: "me" | "them";
    content: string;
    timestamp: string;
}

export const mockMessages: Message[] = [
    { id: "m1", contactId: "c1", sender: "them", content: "Bom dia, professor!", timestamp: "08:00" },
    { id: "m2", contactId: "c1", sender: "me", content: "Bom dia, Mariana! Tudo bem?", timestamp: "08:05" },
    { id: "m3", contactId: "c1", sender: "them", content: "Tudo ótimo. A Alice esqueceu o casaco rosa dela aí?", timestamp: "10:30" },

    { id: "m4", contactId: "c2", sender: "me", content: "Olá Carlos, segue o registro da atividade de hoje.", timestamp: "14:00" },
    { id: "m5", contactId: "c2", sender: "them", content: "Obrigado pelas fotos! Ele adorou.", timestamp: "14:15" }
];

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    assignee?: string;
    priority: "low" | "medium" | "high";
}

export interface MuralEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    author: string;
    type: "event" | "notice" | "activity";
    location?: string;
    image?: string;
    classId?: string; // Optional: if null/undefined, it's for all classes
    comments: { id: string; author: string; text: string; date: string }[];
    likes: number;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: "planning" | "active" | "completed";
    startDate: string;
    endDate?: string;
    students: string[]; // IDs
    classes?: string[]; // IDs of SchoolClass
    tags: string[];
    bnccSkillIds?: string[]; // IDs of BNCC Skills
    contentIds?: string[]; // IDs of Custom Content
    guidingQuestion?: string; // e.g. "Como podemos cuidar da natureza?"
    imageUrl?: string; // Banner image url for the project card
}

export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read: boolean;
}

export const mockTasks: Task[] = [
    { id: "1", title: "Enviar documentação de matrícula", completed: false, priority: "high" },
    { id: "2", title: "Assinar autorização de passeio", completed: true, priority: "medium" },
    { id: "3", title: "Atualizar ficha médica", completed: false, priority: "low" },
];

export type UserRole = "director" | "teacher" | "guardian" | "admin";

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
    email: string;
    assignedClassIds?: string[]; // For teachers: IDs of classes they teach
    linkedStudentIds?: string[]; // For guardians: IDs of students they are responsible for
}

export const mockUsers: User[] = [
    {
        id: "u1",
        name: "Ana Pereira",
        role: "director",
        email: "ana.diretora@escolaibira.com.br",
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: "u2",
        name: "Cláudia Santos",
        role: "teacher",
        email: "claudia.prof@escolaibira.com.br",
        assignedClassIds: ["jardim-i", "jardim-ii"],
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: "u3",
        name: "Mariana Silva",
        role: "guardian",
        email: "mariana.responsavel@escolaibira.com.br", // Standardized email
        linkedStudentIds: ["1"], // Alice Souza
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: "u4",
        name: "Carlos Admin",
        role: "admin",
        email: "admin@escolaibira.com.br",
        avatar: "https://github.com/shadcn.png"
    }
];

