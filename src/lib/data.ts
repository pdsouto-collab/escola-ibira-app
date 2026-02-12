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
    title: string;
    type: "activity" | "meal" | "care";
    description?: string;
}

export const mockSchedule: ScheduleItem[] = [
    {
        id: "1",
        time: "08:00",
        title: "Chegada e Acolhimento",
        type: "care",
        description: "Recepção das crianças e brincadeira livre.",
    },
    {
        id: "2",
        time: "09:00",
        title: "Roda de Conversa",
        type: "activity",
        description: "Momento de compartilhar novidades e planejar o dia.",
    },
    {
        id: "3",
        time: "09:30",
        title: "Lanche da Manhã",
        type: "meal",
        description: "Frutas da estação e suco natural.",
    },
    {
        id: "4",
        time: "10:00",
        title: "Atividade de Pátio",
        type: "activity",
        description: "Brincadeiras dirigidas e exploração do espaço externo.",
    },
    {
        id: "5",
        time: "11:30",
        title: "Almoço",
        type: "meal",
        description: "Arroz, feijão, legumes e proteína.",
    },
    {
        id: "6",
        time: "13:00",
        title: "Descanso / Sono",
        type: "care",
        description: "Momento de repouso.",
    },
];

export interface Student {
    id: string;
    name: string;
    age: number;
    photo?: string;
    status: "presente" | "ausente";
    parentName: string;
    class: string;
}

export const mockStudents: Student[] = [
    {
        id: "1",
        name: "Alice Souza",
        age: 4,
        status: "presente",
        parentName: "Mariana Souza",
        class: "Jardim I",
    },
    {
        id: "2",
        name: "Bernardo Silva",
        age: 5,
        status: "presente",
        parentName: "Carlos Silva",
        class: "Jardim II",
    },
    {
        id: "3",
        name: "Clara Oliveira",
        age: 3,
        status: "ausente",
        parentName: "Fernanda Oliveira",
        class: "Maternal II",
    },
    {
        id: "4",
        name: "Davi Santos",
        age: 4,
        status: "presente",
        parentName: "Roberto Santos",
        class: "Jardim I",
    },
    {
        id: "5",
        name: "Enzo Pereira",
        age: 5,
        status: "presente",
        parentName: "Juliana Pereira",
        class: "Jardim II",
    },
    {
        id: "6",
        name: "Valentina Costa",
        age: 3,
        status: "presente",
        parentName: "Amanda Costa",
        class: "Maternal II",
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

export type NodeType = "area" | "component" | "unit" | "skill";

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
        color: "#3b82f6", // Blue
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
                        type: "unit",
                        status: "in-progress",
                        children: [
                            { id: "av-3", label: "Observa obras de arte", type: "skill", status: "in-progress", evidenceCount: 1 },
                            { id: "av-4", label: "Descreve sentimentos ao ver arte", type: "skill", status: "not-started" }
                        ]
                    }
                ]
            },
            {
                id: "musica",
                label: "Música",
                type: "component",
                status: "in-progress",
                children: [
                    {
                        id: "ritmo",
                        label: "Ritmo e Movimento",
                        type: "unit",
                        status: "in-progress",
                        children: [
                            { id: "mus-1", label: "Acompanha o ritmo com palmas", type: "skill", status: "achieved", evidenceCount: 4 },
                            { id: "mus-2", label: "Dança livremente", type: "skill", status: "in-progress", evidenceCount: 2 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "natureza",
        label: "Natureza e Sociedade",
        type: "area",
        status: "in-progress",
        color: "#10b981", // Emerald
        children: [
            {
                id: "ser-vivo",
                label: "Seres Vivos",
                type: "component",
                status: "in-progress",
                children: [
                    { id: "nat-1", label: "Identifica animais domésticos", type: "skill", status: "achieved", evidenceCount: 2 },
                    { id: "nat-2", label: "Cuida das plantas", type: "skill", status: "in-progress", evidenceCount: 1 }
                ]
            },
            {
                id: "ambiente",
                label: "Meio Ambiente",
                type: "component",
                status: "not-started",
                children: [
                    { id: "nat-3", label: "Separa o lixo (reciclagem)", type: "skill", status: "not-started" }
                ]
            }
        ]
    },
    {
        id: "linguagem",
        label: "Linguagem",
        type: "area",
        status: "in-progress",
        color: "#f43f5e", // Rose
        children: [
            {
                id: "oralidade",
                label: "Oralidade",
                type: "component",
                status: "achieved",
                children: [
                    { id: "lin-1", label: "Conta histórias conhecidas", type: "skill", status: "achieved", evidenceCount: 6 }
                ]
            },
            {
                id: "escrita",
                label: "Escrita",
                type: "component",
                status: "in-progress",
                children: [
                    { id: "lin-2", label: "Escreve o próprio nome", type: "skill", status: "achieved", evidenceCount: 3 },
                    { id: "lin-3", label: "Reconhece letras do alfabeto", type: "skill", status: "in-progress", evidenceCount: 2 }
                ]
            }
        ]
    }
];

export const mockRecursiveDataContent: MosaicNode[] = [
    {
        id: "portugues",
        label: "Português",
        type: "area",
        status: "in-progress",
        color: "#ec4899", // Pink
        children: [
            {
                id: "alfabetizacao",
                label: "Alfabetização",
                type: "component",
                status: "in-progress",
                children: [
                    { id: "vogais", label: "Vogais", type: "unit", status: "achieved", children: [] },
                    { id: "consoantes", label: "Consoantes Simples", type: "unit", status: "in-progress", children: [] }
                ]
            }
        ]
    },
    {
        id: "matematica",
        label: "Matemática",
        type: "area",
        status: "in-progress",
        color: "#a855f7", // Purple
        children: [
            {
                id: "numeros",
                label: "Números e Operações",
                type: "component",
                status: "in-progress",
                children: [
                    { id: "contagem", label: "Contagem 0-20", type: "unit", status: "achieved", children: [] },
                    { id: "soma", label: "Adição Simples", type: "unit", status: "not-started", children: [] }
                ]
            },
            {
                id: "geom",
                label: "Geometria",
                type: "component",
                status: "in-progress",
                children: [
                    { id: "formas", label: "Formas Planas", type: "unit", status: "achieved", children: [] }
                ]
            }
        ]
    }
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


