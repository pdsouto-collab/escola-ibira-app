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
    classId?: string; // e.g. "all" or a specific class ID. Usually set at the macro (root) level.
    period?: string; // e.g. "1º Semestre / 2026". Usually set at the macro (root) level.
    children: KnowledgeNode[]; // Nested nodes down the hierarchy
}

export const SEMESTERS = ["1º Semestre", "2º Semestre"];
export const YEARS = Array.from({ length: 2099 - 2020 + 1 }, (_, i) => (2020 + i).toString());

// Initial mock data to bootstrap the trees
export const mockSkillsTree: KnowledgeNode[] = [
    {
        "id": "macro-sk-ciencias",
        "level": "macro",
        "type": "skill",
        "name": "Ciências da Natureza e Humanas",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-sk-ciencias-1",
                "level": "mesclado",
                "type": "skill",
                "name": "Ciências",
                "children": [
                    {
                        "id": "mic-sk-ciencias-1-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-1-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-1-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-1-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-ciencias-1-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-1-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-1-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-1-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-ciencias-1-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-1-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-1-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-1-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-ciencias-2",
                "level": "mesclado",
                "type": "skill",
                "name": "História",
                "children": [
                    {
                        "id": "mic-sk-ciencias-2-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-2-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-2-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-2-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-ciencias-2-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-2-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-2-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-2-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-ciencias-2-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-2-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-2-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-2-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-ciencias-3",
                "level": "mesclado",
                "type": "skill",
                "name": "Geografia",
                "children": [
                    {
                        "id": "mic-sk-ciencias-3-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-3-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-3-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-3-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-ciencias-3-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-3-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-3-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-3-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-ciencias-3-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-ciencias-3-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-3-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-ciencias-3-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-sk-linguagens",
        "level": "macro",
        "type": "skill",
        "name": "Linguagens",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-sk-linguagens-1",
                "level": "mesclado",
                "type": "skill",
                "name": "Língua Portuguesa",
                "children": [
                    {
                        "id": "mic-sk-linguagens-1-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-1-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-1-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-1-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-linguagens-1-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-1-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-1-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-1-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-linguagens-1-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-1-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-1-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-1-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-linguagens-2",
                "level": "mesclado",
                "type": "skill",
                "name": "Arte",
                "children": [
                    {
                        "id": "mic-sk-linguagens-2-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-2-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-2-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-2-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-linguagens-2-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-2-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-2-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-2-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-linguagens-2-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-2-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-2-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-2-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-linguagens-3",
                "level": "mesclado",
                "type": "skill",
                "name": "Educação Física",
                "children": [
                    {
                        "id": "mic-sk-linguagens-3-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-3-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-3-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-3-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-linguagens-3-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-3-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-3-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-3-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-linguagens-3-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-linguagens-3-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-3-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-linguagens-3-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-sk-matematica",
        "level": "macro",
        "type": "skill",
        "name": "Matemática e Lógica",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-sk-matematica-1",
                "level": "mesclado",
                "type": "skill",
                "name": "Aritmética",
                "children": [
                    {
                        "id": "mic-sk-matematica-1-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-matematica-1-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-1-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-1-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-matematica-1-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-matematica-1-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-1-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-1-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-matematica-1-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-matematica-1-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-1-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-1-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-matematica-2",
                "level": "mesclado",
                "type": "skill",
                "name": "Geometria",
                "children": [
                    {
                        "id": "mic-sk-matematica-2-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-matematica-2-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-2-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-2-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-matematica-2-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-matematica-2-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-2-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-2-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-matematica-2-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-matematica-2-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-2-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-2-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-matematica-3",
                "level": "mesclado",
                "type": "skill",
                "name": "Medidas",
                "children": [
                    {
                        "id": "mic-sk-matematica-3-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-matematica-3-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-3-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-3-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-matematica-3-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-matematica-3-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-3-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-3-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-matematica-3-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-matematica-3-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-3-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-matematica-3-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-sk-socioemocional",
        "level": "macro",
        "type": "skill",
        "name": "Socioemocional",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-sk-socioemocional-1",
                "level": "mesclado",
                "type": "skill",
                "name": "Autoconhecimento",
                "children": [
                    {
                        "id": "mic-sk-socioemocional-1-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-1-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-1-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-1-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-socioemocional-1-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-1-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-1-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-1-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-socioemocional-1-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-1-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-1-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-1-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-socioemocional-2",
                "level": "mesclado",
                "type": "skill",
                "name": "Empatia",
                "children": [
                    {
                        "id": "mic-sk-socioemocional-2-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-2-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-2-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-2-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-socioemocional-2-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-2-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-2-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-2-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-socioemocional-2-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-2-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-2-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-2-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-socioemocional-3",
                "level": "mesclado",
                "type": "skill",
                "name": "Colaboração",
                "children": [
                    {
                        "id": "mic-sk-socioemocional-3-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-3-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-3-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-3-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-socioemocional-3-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-3-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-3-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-3-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-socioemocional-3-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-socioemocional-3-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-3-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-socioemocional-3-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-sk-expressao",
        "level": "macro",
        "type": "skill",
        "name": "Expressão Corporal e Artística",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-sk-expressao-1",
                "level": "mesclado",
                "type": "skill",
                "name": "Dança",
                "children": [
                    {
                        "id": "mic-sk-expressao-1-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-expressao-1-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-1-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-1-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-expressao-1-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-expressao-1-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-1-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-1-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-expressao-1-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-expressao-1-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-1-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-1-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-expressao-2",
                "level": "mesclado",
                "type": "skill",
                "name": "Teatro",
                "children": [
                    {
                        "id": "mic-sk-expressao-2-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-expressao-2-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-2-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-2-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-expressao-2-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-expressao-2-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-2-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-2-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-expressao-2-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-expressao-2-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-2-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-2-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-sk-expressao-3",
                "level": "mesclado",
                "type": "skill",
                "name": "Música",
                "children": [
                    {
                        "id": "mic-sk-expressao-3-1",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp01-0",
                        "children": [
                            {
                                "id": "ato-sk-expressao-3-1-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-3-1-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-3-1-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-expressao-3-2",
                        "level": "micro",
                        "type": "skill",
                        "name": "Leitura/escuta (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp02-1",
                        "children": [
                            {
                                "id": "ato-sk-expressao-3-2-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-3-2-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-3-2-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-sk-expressao-3-3",
                        "level": "micro",
                        "type": "skill",
                        "name": "Escrita (compartilhada e autônoma)",
                        "libraryItemId": "bncc-ef-ef01lp03-2",
                        "children": [
                            {
                                "id": "ato-sk-expressao-3-3-1",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-3-3-2",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-sk-expressao-3-3-3",
                                "level": "atomico",
                                "type": "skill",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
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
        "id": "macro-ct-identidade",
        "level": "macro",
        "type": "content",
        "name": "Identidade e Autonomia",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-ct-identidade-1",
                "level": "mesclado",
                "type": "content",
                "name": "Eu e o Outro",
                "children": [
                    {
                        "id": "mic-ct-identidade-1-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-identidade-1-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-1-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-1-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-identidade-1-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-identidade-1-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-1-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-1-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-identidade-1-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-identidade-1-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-1-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-1-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-identidade-2",
                "level": "mesclado",
                "type": "content",
                "name": "Cuidado Pessoal",
                "children": [
                    {
                        "id": "mic-ct-identidade-2-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-identidade-2-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-2-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-2-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-identidade-2-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-identidade-2-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-2-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-2-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-identidade-2-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-identidade-2-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-2-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-2-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-identidade-3",
                "level": "mesclado",
                "type": "content",
                "name": "Estando no Mundo",
                "children": [
                    {
                        "id": "mic-ct-identidade-3-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-identidade-3-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-3-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-3-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-identidade-3-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-identidade-3-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-3-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-3-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-identidade-3-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-identidade-3-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-3-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-identidade-3-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-ct-linguagem",
        "level": "macro",
        "type": "content",
        "name": "Linguagem Oral e Escrita",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-ct-linguagem-1",
                "level": "mesclado",
                "type": "content",
                "name": "Fala e Escuta",
                "children": [
                    {
                        "id": "mic-ct-linguagem-1-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-1-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-1-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-1-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-linguagem-1-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-1-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-1-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-1-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-linguagem-1-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-1-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-1-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-1-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-linguagem-2",
                "level": "mesclado",
                "type": "content",
                "name": "Práticas de Leitura",
                "children": [
                    {
                        "id": "mic-ct-linguagem-2-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-2-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-2-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-2-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-linguagem-2-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-2-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-2-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-2-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-linguagem-2-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-2-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-2-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-2-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-linguagem-3",
                "level": "mesclado",
                "type": "content",
                "name": "Escrita Inicial",
                "children": [
                    {
                        "id": "mic-ct-linguagem-3-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-3-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-3-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-3-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-linguagem-3-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-3-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-3-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-3-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-linguagem-3-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-linguagem-3-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-3-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-linguagem-3-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-ct-matematica",
        "level": "macro",
        "type": "content",
        "name": "Matemática",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-ct-matematica-1",
                "level": "mesclado",
                "type": "content",
                "name": "Números",
                "children": [
                    {
                        "id": "mic-ct-matematica-1-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-matematica-1-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-1-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-1-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-matematica-1-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-matematica-1-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-1-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-1-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-matematica-1-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-matematica-1-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-1-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-1-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-matematica-2",
                "level": "mesclado",
                "type": "content",
                "name": "Espaço e Forma",
                "children": [
                    {
                        "id": "mic-ct-matematica-2-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-matematica-2-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-2-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-2-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-matematica-2-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-matematica-2-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-2-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-2-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-matematica-2-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-matematica-2-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-2-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-2-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-matematica-3",
                "level": "mesclado",
                "type": "content",
                "name": "Grandezas",
                "children": [
                    {
                        "id": "mic-ct-matematica-3-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-matematica-3-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-3-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-3-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-matematica-3-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-matematica-3-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-3-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-3-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-matematica-3-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-matematica-3-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-3-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-matematica-3-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-ct-natureza",
        "level": "macro",
        "type": "content",
        "name": "Natureza e Sociedade",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-ct-natureza-1",
                "level": "mesclado",
                "type": "content",
                "name": "Seres Vivos",
                "children": [
                    {
                        "id": "mic-ct-natureza-1-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-natureza-1-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-1-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-1-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-natureza-1-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-natureza-1-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-1-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-1-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-natureza-1-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-natureza-1-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-1-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-1-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-natureza-2",
                "level": "mesclado",
                "type": "content",
                "name": "Fenômenos Naturais",
                "children": [
                    {
                        "id": "mic-ct-natureza-2-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-natureza-2-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-2-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-2-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-natureza-2-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-natureza-2-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-2-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-2-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-natureza-2-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-natureza-2-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-2-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-2-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-natureza-3",
                "level": "mesclado",
                "type": "content",
                "name": "A Sociedade",
                "children": [
                    {
                        "id": "mic-ct-natureza-3-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-natureza-3-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-3-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-3-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-natureza-3-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-natureza-3-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-3-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-3-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-natureza-3-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-natureza-3-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-3-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-natureza-3-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "macro-ct-movimento",
        "level": "macro",
        "type": "content",
        "name": "Movimento",
        "classId": "jardim-i",
        "children": [
            {
                "id": "mes-ct-movimento-1",
                "level": "mesclado",
                "type": "content",
                "name": "Coordenação Grossa",
                "children": [
                    {
                        "id": "mic-ct-movimento-1-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-movimento-1-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-1-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-1-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-movimento-1-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-movimento-1-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-1-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-1-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-movimento-1-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-movimento-1-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-1-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-1-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-movimento-2",
                "level": "mesclado",
                "type": "content",
                "name": "Coordenação Fina",
                "children": [
                    {
                        "id": "mic-ct-movimento-2-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-movimento-2-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-2-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-2-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-movimento-2-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-movimento-2-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-2-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-2-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-movimento-2-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-movimento-2-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-2-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-2-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mes-ct-movimento-3",
                "level": "mesclado",
                "type": "content",
                "name": "Expressão Livre",
                "children": [
                    {
                        "id": "mic-ct-movimento-3-1",
                        "level": "micro",
                        "type": "content",
                        "name": "Busca por Aprendizado",
                        "libraryItemId": "lib-cg-1",
                        "children": [
                            {
                                "id": "ato-ct-movimento-3-1-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-3-1-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-3-1-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-movimento-3-2",
                        "level": "micro",
                        "type": "content",
                        "name": "Aplicação Prática do Saber",
                        "libraryItemId": "lib-cg-2",
                        "children": [
                            {
                                "id": "ato-ct-movimento-3-2-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-3-2-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-3-2-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "mic-ct-movimento-3-3",
                        "level": "micro",
                        "type": "content",
                        "name": "Investigação e Curiosidade",
                        "libraryItemId": "lib-cg-3",
                        "children": [
                            {
                                "id": "ato-ct-movimento-3-3-1",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 1 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-3-3-2",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 2 para a habilidade/conteúdo.",
                                "children": []
                            },
                            {
                                "id": "ato-ct-movimento-3-3-3",
                                "level": "atomico",
                                "type": "content",
                                "name": "Evidência 3 para a habilidade/conteúdo.",
                                "children": []
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

export interface MenuItem {
    time: string; // e.g., "09:30"
    title: string; // e.g., "Lanche da Manhã"
    description: string; // e.g., "Frutas da estação (banana e maçã) e suco natural de couve com limão."
}

export interface Menu {
    id: string;
    date: string; // YYYY-MM-DD
    items: MenuItem[];
}

export const mockMenus: Menu[] = [
    {
        id: "menu-1",
        date: "2024-02-12",
        items: [
            { time: "09:30", title: "Lanche da Manhã", description: "Frutas da estação e suco natural." },
            { time: "11:30", title: "Almoço", description: "Arroz, feijão, legumes e proteína." },
            { time: "15:00", title: "Lanche da Tarde", description: "Pão de queijo e chá." }
        ]
    }
];

export interface Contact {
    id: string;
    name: string;
    role: "Mãe" | "Pai" | "Responsável" | "Grupo" | string;
    studentName: string;
    studentId: string;
    avatarUrl?: string;
    isGroup?: boolean;
    participantIds?: string[];
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
    },
    {
        id: "group-1",
        name: "Pais - Jardim I",
        role: "Grupo",
        studentName: "Jardim I",
        studentId: "jardim-i",
        isGroup: true,
        participantIds: ["c1", "c2", "c3"],
        unreadCount: 3,
        lastMessage: "Ana (Diretora): Lembrete da reunião amanhã.",
        lastMessageTime: "11:00"
    }
];

export interface Message {
    id: string;
    contactId: string;
    sender: "me" | "them";
    senderName?: string;
    content: string;
    timestamp: string;
}

export const mockMessages: Message[] = [
    { id: "m1", contactId: "c1", sender: "them", content: "Bom dia, professor!", timestamp: "08:00" },
    { id: "m2", contactId: "c1", sender: "me", content: "Bom dia, Mariana! Tudo bem?", timestamp: "08:05" },
    { id: "m3", contactId: "c1", sender: "them", content: "Tudo ótimo. A Alice esqueceu o casaco rosa dela aí?", timestamp: "10:30" },

    // Group messages
    { id: "m4", contactId: "group-1", sender: "them", senderName: "Ana (Diretora)", content: "Bom dia, responsáveis! Lembrete da nossa reunião pedagógica amanhã às 18h.", timestamp: "08:00" },
    { id: "m5", contactId: "group-1", sender: "them", senderName: "Carlos Souza", content: "Obrigado pelo aviso, Ana. Estarei presente com a mãe do Bernardo.", timestamp: "08:05" },
    { id: "m6", contactId: "group-1", sender: "them", senderName: "Patrícia", content: "Nós também!", timestamp: "08:12" },
    { id: "m7", contactId: "c2", sender: "me", content: "Olá Carlos, segue o registro da atividade de hoje.", timestamp: "14:00" },
    { id: "m8", contactId: "c2", sender: "them", content: "Obrigado pelas fotos! Ele adorou.", timestamp: "14:15" }
];


export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read: boolean;
    senderName?: string;
}


// ─────────────────────────────────────────────
// ASSESSMENT SYSTEM
// ─────────────────────────────────────────────

export interface AssessmentAttachment {
    id: string;
    type: "photo" | "document" | "audio";
    url: string;         // base64 data URL (phase 1)
    name?: string;
    capturedAt: string;  // ISO date
}

/** A teacher evaluation record. */
export interface Assessment {
    id: string;
    createdAt: string;

    // Context (at least one required)
    projectId?: string;
    sessionId?: string;        // ScheduleItem.id
    routineId?: string;
    knowledgeNodeId?: string;  // KnowledgeNode.id
    period?: string;           // Optional explicit period


    // Scope
    scope: "class" | "student";
    classId?: string;
    studentId?: string;

    // Content
    rating?: 1 | 2 | 3 | 4 | 5;
    observations: string;
    attachments: AssessmentAttachment[];
}

export const mockAssessments: Assessment[] = [
    {
        id: "as-1",
        createdAt: "2024-02-15T10:00:00Z",
        knowledgeNodeId: "mic-sk-EF03CI04",
        sessionId: "7",
        scope: "student",
        studentId: "1",
        rating: 5,
        observations: "A Alice demonstrou uma curiosidade incrível durante a observação do canteiro. Ela conseguiu identificar as partes da planta sem ajuda e questionou sobre como a água chega até as folhas.",
        attachments: [
            { id: "att-1", type: "photo", url: "https://images.unsplash.com/photo-1542601906960-daaeac71e9c9?auto=format&fit=crop&q=80&w=400&h=400", capturedAt: "2024-02-15T10:05:00Z", name: "Exploração da horta" }
        ]
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
        attachments: [
            { id: "att-2", type: "photo", url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=400&h=400", capturedAt: "2024-02-18T14:30:00Z", name: "Atividade de pátio" }
        ]
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
        attachments: [
            { id: "att-3", type: "photo", url: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=400&h=400", capturedAt: "2024-02-20T10:00:00Z", name: "Medindo objetos" }
        ]
    },
    {
        id: "as-4",
        createdAt: "2024-02-22T11:00:00Z",
        knowledgeNodeId: "mic-sk-EF03CI06",
        scope: "student",
        studentId: "1",
        rating: 5,
        observations: "Destaque para a capacidade da Alice de classificar os animais por suas características físicas. Ela criou um 'álbum de figurinhas' mental muito organizado.",
        attachments: []
    }
];


export interface PostInteraction {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userRole?: string;
    type: "like" | "comment";
    content?: string;
    createdAt: string;
}

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

export const mockClassBoardPosts: ClassBoardPost[] = [
    {
        id: "cbp1",
        classId: "jardim-i",
        authorId: "u2",
        authorName: "Profa. Cláudia",
        authorRole: "Responsável pela Turma",
        categoryType: "Projetos da Classe",
        linkedProjectId: "p1", // Assumes project p1 exists
        title: "Cultivo de Hortaliças Hoje!",
        content: "Nossa tarde foi maravilhosa mexendo na terra.",
        extraMaterials: "Livro de Ciências: A Semente de Mostarda.",
        photos: ["https://images.unsplash.com/photo-1542601906960-daaeac71e9c9?q=80&w=800&auto=format&fit=crop"],
        createdAt: new Date().toISOString()
    }
];

export const mockPostInteractions: PostInteraction[] = [
    {
        id: "pi1",
        postId: "cbp1",
        userId: "u5",
        userName: "Mariana",
        userRole: "Pai/Responsável",
        type: "like",
        createdAt: new Date().toISOString()
    }
];
