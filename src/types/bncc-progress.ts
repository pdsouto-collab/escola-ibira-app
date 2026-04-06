import { LearningStatus } from "./learning-status";

export interface BnccProgressItem {
    status: LearningStatus;
    evidenceCount: number;
}

export type BnccProgressData = Record<string, BnccProgressItem>;
