import { MosaicNode } from "../../types/mosaic-node";

export const mosaicSkillsDataSeed: MosaicNode[] = [
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
