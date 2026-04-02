import { FinalProductType } from "@/types/final-product-type";

export const finalProductTypesDataSeed: Pick<FinalProductType, "id" | "name">[] = [
    { id: "none", name: "Nenhum" },
    { id: "arts_crafts", name: "Artes e Ofícios" },
    { id: "audio_visual", name: "Audiovisual" },
    { id: "culinary", name: "Produto Culinário" },
    { id: "document", name: "Documento" },
    { id: "event", name: "Evento" },
    { id: "presentation", name: "Apresentação" },
    { id: "prototype", name: "Protótipo" },
];
