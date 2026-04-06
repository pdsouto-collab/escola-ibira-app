import { LearningStatus } from "./learning-status";
import { MosaicNodeType } from "./mosaic-node-type";

export interface MosaicNode {
    id: string;
    label: string;
    type: MosaicNodeType | string;
    status: LearningStatus | string;
    evidenceCount?: number;
    weight?: number; // For manual sizing if needed
    color?: string | null; // Hex code or Tailwind class
    children?: MosaicNode[];
}
